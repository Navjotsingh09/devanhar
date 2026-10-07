'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { computeRanksWithTies, getPointsForPosition } from '@/lib/padel-ranking'

export type TournamentResultInput = {
  finishing_position: string
  player_id: string
  partner_player_id: string | null
  notes?: string | null
  match_wins?: number
  matches_played?: number
  group_points_scored?: number
  group_points_conceded?: number
}

type ActionResult = { error: string } | { success: true }

export type BulkTournamentResultInput = {
  player_name: string
  partner_name: string
  finishing_position: string
}

function normalizePlayerName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

export async function importTournamentResults(
  tournamentId: string,
  rows: BulkTournamentResultInput[]
): Promise<ActionResult & { importedPlayers?: number; importedResults?: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }
  if (rows.length === 0) return { error: 'Add at least one team to import' }

  for (const row of rows) {
    if (row.player_name.trim() === '' || row.partner_name.trim() === '') {
      return { error: 'Every imported team needs both player names' }
    }
    if (normalizePlayerName(row.player_name) === normalizePlayerName(row.partner_name)) {
      return { error: 'A team cannot contain the same player twice' }
    }
    if (getPointsForPosition(row.finishing_position) === 0) {
      return { error: `Unknown finishing position: ${row.finishing_position}` }
    }
  }

  const { data: players, error: playersError } = await supabase
    .from('padel_players')
    .select('id, first_name, last_name, display_name, canonical_player_key')
    .eq('is_active', true)
  if (playersError) return { error: playersError.message }

  const { data: aliases, error: aliasesError } = await supabase
    .from('padel_player_aliases')
    .select('player_id, alias_normalized')
  if (aliasesError) return { error: aliasesError.message }

  const exact = new Map<string, string[]>()
  for (const player of players || []) {
    const display = player.display_name || `${player.first_name} ${player.last_name}`.trim()
    const key = normalizePlayerName(display)
    const ids = exact.get(key) || []
    ids.push(player.id)
    exact.set(key, ids)
  }

  const aliasMap = new Map<string, string[]>()
  for (const alias of aliases || []) {
    const ids = aliasMap.get(alias.alias_normalized) || []
    ids.push(alias.player_id)
    aliasMap.set(alias.alias_normalized, ids)
  }

  let importedPlayers = 0

  async function resolvePlayer(name: string): Promise<{ id?: string; error?: string }> {
    const normalized = normalizePlayerName(name)
    const exactIds = exact.get(normalized) || []
    if (exactIds.length === 1) return { id: exactIds[0] }
    if (exactIds.length > 1) {
      return { error: `"${name}" matches more than one existing player. Select the correct player manually; this name will not be auto-merged.` }
    }

    const aliasIds = aliasMap.get(normalized) || []
    if (aliasIds.length === 1) return { id: aliasIds[0] }
    if (aliasIds.length > 1) {
      return { error: `"${name}" is an ambiguous alias. Select the player manually.` }
    }

    const { data: created, error } = await supabase
      .from('padel_players')
      .insert({
        first_name: name.trim(),
        last_name: '',
        display_name: name.trim(),
        identity_status: 'Name as supplied',
        is_active: true,
      })
      .select('id')
      .single()

    if (error || !created) return { error: error?.message || `Could not create player "${name}"` }

    importedPlayers += 1
    const ids = exact.get(normalized) || []
    ids.push(created.id)
    exact.set(normalized, ids)
    return { id: created.id }
  }

  const results: TournamentResultInput[] = []
  for (const row of rows) {
    const player = await resolvePlayer(row.player_name)
    if (player.error || !player.id) return { error: player.error || 'Could not resolve player' }

    const partner = await resolvePlayer(row.partner_name)
    if (partner.error || !partner.id) return { error: partner.error || 'Could not resolve partner' }

    if (player.id === partner.id) return { error: 'A team cannot contain the same player twice' }

    results.push(
      {
        finishing_position: row.finishing_position,
        player_id: player.id,
        partner_player_id: partner.id,
      },
      {
        finishing_position: row.finishing_position,
        player_id: partner.id,
        partner_player_id: player.id,
      }
    )
  }

  const result = await saveTournamentResults(tournamentId, results)
  if ('error' in result) return result
  return { success: true, importedPlayers, importedResults: results.length }
}

export async function saveTournamentResults(tournamentId: string, results: TournamentResultInput[]): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }

  const submitted = results.filter((r) => r.player_id)
  const seenPlayers = new Set<string>()
  for (const r of submitted) {
    if (seenPlayers.has(r.player_id)) {
      return { error: "A player cannot appear twice in the same tournament's results" }
    }
    if (r.player_id === r.partner_player_id) {
      return { error: 'A player cannot be their own partner' }
    }
    seenPlayers.add(r.player_id)
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from('padel_tournaments')
    .select('applicable_stages')
    .eq('id', tournamentId)
    .single()
  if (tournamentError || !tournament) return { error: tournamentError?.message || 'Tournament not found' }

  for (const result of submitted) {
    if (!tournament.applicable_stages.includes(result.finishing_position)) {
      return { error: 'A result uses a finishing position that is not enabled for this tournament' }
    }
    if (getPointsForPosition(result.finishing_position) === 0) {
      return { error: 'A result uses an invalid finishing position' }
    }
  }

  const { data: existing } = await supabase
    .from('padel_tournament_results')
    .select('id, player_id')
    .eq('tournament_id', tournamentId)
  const keepPlayerIds = new Set(submitted.map((r) => r.player_id))
  const toDelete = (existing || []).filter((row) => !keepPlayerIds.has(row.player_id)).map((row) => row.id)
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('padel_tournament_results').delete().in('id', toDelete)
    if (deleteError) return { error: deleteError.message }
  }

  if (submitted.length > 0) {
    const { error: upsertError } = await supabase
      .from('padel_tournament_results')
      .upsert(
        submitted.map((r) => ({
          tournament_id: tournamentId,
          player_id: r.player_id,
          partner_player_id: r.partner_player_id || null,
          finishing_position: r.finishing_position,
          points_awarded: getPointsForPosition(r.finishing_position),
          notes: r.notes || null,
          source_result_id: `LIVE:${tournamentId}:${r.player_id}`,
          source_tournament_code: `LIVE:${tournamentId}`,
          match_wins: Math.max(0, Number(r.match_wins || 0)),
          matches_played: Math.max(0, Number(r.matches_played || 0)),
          group_points_scored: Math.max(0, Number(r.group_points_scored || 0)),
          group_points_conceded: Math.max(0, Number(r.group_points_conceded || 0)),
          group_point_difference: Number(r.group_points_scored || 0) - Number(r.group_points_conceded || 0),
          group_total_points: Number(r.group_points_scored || 0) + Number(r.group_points_conceded || 0),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'tournament_id,player_id' }
      )
    if (upsertError) return { error: upsertError.message }
  }

  const { data: activePlayers } = await supabase
    .from('padel_players')
    .select('id')
    .eq('is_active', true)
  const { data: allResults } = await supabase
    .from('padel_tournament_results')
    .select('player_id, points_awarded, source_result_id')
    .not('source_result_id', 'is', null)

  const totalsByPlayer = new Map<string, number>()
  for (const row of allResults || []) {
    totalsByPlayer.set(row.player_id, (totalsByPlayer.get(row.player_id) || 0) + Number(row.points_awarded || 0))
  }

  for (const player of activePlayers || []) {
    const total = totalsByPlayer.get(player.id) || 0
    const { error } = await supabase
      .from('padel_players')
      .update({ total_points: total, updated_at: new Date().toISOString() })
      .eq('id', player.id)
    if (error) return { error: error.message }
  }

  const ranked = computeRanksWithTies(
    (activePlayers || []).map((p) => ({ id: p.id, total_points: totalsByPlayer.get(p.id) || 0 }))
  )
  const { error: snapshotError } = await supabase
    .from('padel_ranking_snapshots')
    .upsert(
      ranked.map((p) => ({
        tournament_id: tournamentId,
        player_id: p.id,
        rank: p.rank,
        total_points: p.total_points,
      })),
      { onConflict: 'tournament_id,player_id' }
    )
  if (snapshotError) return { error: snapshotError.message }

  revalidatePath('/dashboard/padel/results')
  revalidatePath('/dashboard/padel/tournaments/' + tournamentId + '/results')
  revalidatePath('/dashboard/padel/players')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  return { success: true }
}

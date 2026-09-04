'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { computeRanksWithTies, getPointsForPosition } from '@/lib/padel-ranking'

export type TournamentResultInput = {
  finishing_position: string
  player_id: string
  partner_player_id: string | null
  notes?: string | null
}

type ActionResult = { error: string } | { success: true }

export type BulkTournamentResultInput = {
  player_name: string
  partner_name: string
  finishing_position: string
}

function playerKey(playerName: string, partnerName: string) {
  return playerName.trim().toLocaleLowerCase() + '|' + partnerName.trim().toLocaleLowerCase()
}

export async function importTournamentResults(tournamentId: string, rows: BulkTournamentResultInput[]): Promise<ActionResult & { importedPlayers?: number; importedResults?: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }
  if (rows.length === 0) return { error: 'Add at least one team to import' }

  for (const row of rows) {
    if (row.player_name.trim() === '' || row.partner_name.trim() === '') {
      return { error: 'Every imported team needs both player names' }
    }
    if (row.player_name.trim().toLocaleLowerCase() === row.partner_name.trim().toLocaleLowerCase()) {
      return { error: 'A team cannot contain the same player twice' }
    }
  }

  const playerIdByKey = new Map<string, string>()
  const missingPlayers = new Map<string, { first_name: string; last_name: string }>()

  for (const row of rows) {
    missingPlayers.set(playerKey(row.player_name, row.partner_name), { first_name: row.player_name.trim(), last_name: '' })
    missingPlayers.set(playerKey(row.partner_name, row.player_name), { first_name: row.partner_name.trim(), last_name: '' })
  }

  if (missingPlayers.size > 0) {
    const { data: createdPlayers, error: createError } = await supabase.from('padel_players').insert([...missingPlayers.values()]).select('id, first_name, last_name')
    if (createError) return { error: createError.message }
    for (const [index, [key]] of [...missingPlayers.entries()].entries()) {
      const player = createdPlayers?.[index]
      if (player) playerIdByKey.set(key, player.id)
    }
  }

  const results: TournamentResultInput[] = rows.flatMap((row) => {
    const playerId = playerIdByKey.get(playerKey(row.player_name, row.partner_name))
    const partnerId = playerIdByKey.get(playerKey(row.partner_name, row.player_name))
    if (playerId === undefined || partnerId === undefined) return []
    return [{ finishing_position: row.finishing_position, player_id: playerId, partner_player_id: partnerId }, { finishing_position: row.finishing_position, player_id: partnerId, partner_player_id: playerId }]
  })
  if (results.length !== rows.length * 2) return { error: 'Could not resolve every imported player' }

  const result = await saveTournamentResults(tournamentId, results)
  if ('error' in result) return result
  return { success: true, importedPlayers: missingPlayers.size, importedResults: results.length }
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
    .select('player_id, points_awarded')

  const totalsByPlayer = new Map<string, number>()
  for (const row of allResults || []) {
    totalsByPlayer.set(row.player_id, (totalsByPlayer.get(row.player_id) || 0) + row.points_awarded)
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

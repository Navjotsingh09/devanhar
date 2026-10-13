'use server'

import { checkPadelStaffAccess } from '@/lib/padel-admin'
import { revalidatePath } from 'next/cache'
import { computeDenseRanks, getPointsForPosition, type RankingMetrics } from '@/lib/padel-ranking'

export type TournamentResultInput = {
  finishing_position: string
  player_id: string
  partner_player_id: string | null
  matches_played?: number
  match_wins?: number
  group_points_won?: number
  group_points_possible?: number
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

function emptyMetrics(id: string): RankingMetrics {
  return {
    id,
    total_points: 0,
    titles: 0,
    runner_up_finishes: 0,
    match_wins: 0,
    matches_played: 0,
    group_points_won: 0,
    group_points_possible: 0,
  }
}

export async function importTournamentResults(
  tournamentId: string,
  rows: BulkTournamentResultInput[]
): Promise<ActionResult & { importedPlayers?: number; importedResults?: number }> {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA staff may import tournament results' }
  if (!Array.isArray(rows) || rows.length === 0) return { error: 'Add at least one team to import' }
  if (rows.length > 1000) return { error: 'Import is limited to 1,000 teams at once' }

  // Resolve only existing player identities. Creating names here silently
  // duplicates approved spreadsheet records and corrupts official rankings.
  const { data: players, error: playerError } = await supabase.from('padel_players')
    .select('id, first_name, last_name, is_active')
    .eq('is_active', true)
  if (playerError) return { error: playerError.message }

  const normalize = (name: string) =>
    name.normalize('NFKC').trim().replace(/\\s+/g, ' ').toLocaleLowerCase('en-GB')

  const byName = new Map<string, string[]>()
  for (const player of players || []) {
    const name = normalize([player.first_name, player.last_name].filter(Boolean).join(' '))
    byName.set(name, [...(byName.get(name) || []), player.id])
  }

  const seenPlayers = new Set<string>()
  const results: TournamentResultInput[] = []

  for (const [index, row] of rows.entries()) {
    if (!row.player_name?.trim() || !row.partner_name?.trim()) {
      return { error: `Row ${index + 1}: both player names are required` }
    }
    const first = byName.get(normalize(row.player_name)) || []
    const second = byName.get(normalize(row.partner_name)) || []
    if (first.length !== 1 || second.length !== 1) {
      const problem = first.length !== 1 ? row.player_name : row.partner_name
      return { error: `Row ${index + 1}: "${problem}" is ${(byName.get(normalize(problem)) || []).length === 0 ? 'not yet registered' : 'ambiguous'}. Review identities in Players before import. No records were created.` }
    }
    if (first[0] === second[0]) return { error: `Row ${index + 1}: a player cannot partner with themselves` }
    if (seenPlayers.has(first[0]) || seenPlayers.has(second[0])) {
      return { error: `Row ${index + 1}: a player appears more than once in this tournament` }
    }
    if (getPointsForPosition(row.finishing_position) <= 0) {
      return { error: `Row ${index + 1}: unknown finishing position "${row.finishing_position}"` }
    }

    seenPlayers.add(first[0])
    seenPlayers.add(second[0])
    results.push({
      finishing_position: row.finishing_position, player_id: first[0], partner_player_id: second[0],
    }, {
      finishing_position: row.finishing_position, player_id: second[0], partner_player_id: first[0],
    })
  }

  const saved = await saveTournamentResults(tournamentId, results)
  if ('error' in saved) return saved
  return { success: true, importedPlayers: 0, importedResults: results.length }
}

export async function saveTournamentResults(
  tournamentId: string,
  results: TournamentResultInput[]
): Promise<ActionResult> {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA staff may save tournament results' }

  const submitted = results.filter((result) => result.player_id)
  const seenPlayers = new Set<string>()

  for (const result of submitted) {
    if (seenPlayers.has(result.player_id)) {
      return { error: "A player cannot appear twice in the same tournament's results" }
    }
    if (result.player_id === result.partner_player_id) {
      return { error: 'A player cannot be their own partner' }
    }

    const matchesPlayed = Math.max(0, result.matches_played || 0)
    const matchWins = Math.max(0, result.match_wins || 0)
    const groupPointsWon = Math.max(0, result.group_points_won || 0)
    const groupPointsPossible = Math.max(0, result.group_points_possible || 0)

    if (matchWins > matchesPlayed) return { error: 'Match wins cannot exceed matches played' }
    if (groupPointsWon > groupPointsPossible) {
      return { error: 'Group points won cannot exceed group points possible' }
    }

    seenPlayers.add(result.player_id)
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from('padel_tournaments')
    .select('applicable_stages')
    .eq('id', tournamentId)
    .single()

  if (tournamentError || !tournament) {
    return { error: tournamentError?.message || 'Tournament not found' }
  }

  for (const result of submitted) {
    if (!tournament.applicable_stages.includes(result.finishing_position)) {
      return { error: 'A result uses a finishing position that is not enabled for this tournament' }
    }
    if (getPointsForPosition(result.finishing_position) === 0) {
      return { error: 'A result uses an invalid finishing position' }
    }
  }

  const schemaCheck = await supabase.from('padel_tournament_results')
    .select('id, matches_played, match_wins, group_points_won, group_points_possible')
    .limit(1)
  if (schemaCheck.error) {
    return { error: 'SPA Ranking V2 database fields are unavailable. Apply supabase-padel-ranking-v2.sql before saving results: ' + schemaCheck.error.message }
  }

  const { data: existing, error: existingError } = await supabase
    .from('padel_tournament_results')
    .select('id, player_id')
    .eq('tournament_id', tournamentId)
  if (existingError) return { error: existingError.message }

  const keepPlayerIds = new Set(submitted.map((result) => result.player_id))
  const toDelete = (existing || [])
    .filter((row) => !keepPlayerIds.has(row.player_id))
    .map((row) => row.id)

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('padel_tournament_results').delete().in('id', toDelete)
    if (deleteError) return { error: deleteError.message }
  }

  if (submitted.length > 0) {
    const { error: upsertError } = await supabase.from('padel_tournament_results').upsert(
      submitted.map((result) => ({
        tournament_id: tournamentId,
        player_id: result.player_id,
        partner_player_id: result.partner_player_id || null,
        finishing_position: result.finishing_position,
        points_awarded: getPointsForPosition(result.finishing_position),
        matches_played: Math.max(0, result.matches_played || 0),
        match_wins: Math.max(0, result.match_wins || 0),
        group_points_won: Math.max(0, result.group_points_won || 0),
        group_points_possible: Math.max(0, result.group_points_possible || 0),
        notes: result.notes || null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'tournament_id,player_id' }
    )
    if (upsertError) return { error: upsertError.message }
  }

  const [{ data: activePlayers, error: activeError }, { data: allResults, error: resultsError }] = await Promise.all([
    supabase.from('padel_players').select('id').eq('is_active', true),
    supabase
      .from('padel_tournament_results')
      .select(
        'player_id, finishing_position, points_awarded, matches_played, match_wins, group_points_won, group_points_possible'
      ),
  ])

  if (activeError || resultsError) return { error: activeError?.message || resultsError?.message || 'Unable to recompute rankings' }

  const metricsByPlayer = new Map<string, RankingMetrics>()
  for (const player of activePlayers || []) metricsByPlayer.set(player.id, emptyMetrics(player.id))

  for (const row of allResults || []) {
    const metrics = metricsByPlayer.get(row.player_id)
    if (!metrics) continue

    metrics.total_points += row.points_awarded || 0
    metrics.titles += row.finishing_position === 'winner' ? 1 : 0
    metrics.runner_up_finishes += row.finishing_position === 'runner_up' ? 1 : 0
    metrics.matches_played += row.matches_played || 0
    metrics.match_wins += row.match_wins || 0
    metrics.group_points_won += row.group_points_won || 0
    metrics.group_points_possible += row.group_points_possible || 0
  }

  for (const player of activePlayers || []) {
    const total = metricsByPlayer.get(player.id)?.total_points || 0
    const { error } = await supabase
      .from('padel_players')
      .update({ total_points: total, updated_at: new Date().toISOString() })
      .eq('id', player.id)
    if (error) return { error: error.message }
  }

  const ranked = computeDenseRanks([...metricsByPlayer.values()])
  const { error: snapshotError } = await supabase.from('padel_ranking_snapshots').upsert(
    ranked.map((player) => ({
      tournament_id: tournamentId,
      player_id: player.id,
      rank: player.rank,
      total_points: player.total_points,
    })),
    { onConflict: 'tournament_id,player_id' }
  )

  if (snapshotError) return { error: snapshotError.message }

  revalidatePath('/dashboard/padel/results')
  revalidatePath('/dashboard/padel/tournaments/' + tournamentId + '/results')
  revalidatePath('/dashboard/padel/players')
  revalidatePath('/dashboard/padel/rankings')
  revalidatePath('/dashboard/padel')
  revalidatePath('/spa/leaderboard')
  revalidatePath('/spa')
  revalidatePath('/initiatives/sikh-padel-association')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  return { success: true }
}

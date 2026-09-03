'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { computeRanksWithTies } from '@/lib/padel-ranking'

export type TournamentResultInput = {
  finishing_position: string
  player_id: string
  partner_player_id: string | null
  points_awarded: number
  notes?: string | null
}

type ActionResult = { error: string } | { success: true }

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
    seenPlayers.add(r.player_id)
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
          points_awarded: r.points_awarded,
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

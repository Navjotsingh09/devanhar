import { getPublicSupabaseClient } from "@/lib/supabase/public"
import { computeDenseRanks, getMovement, type DenseRankedPlayer, type RankMovement, type RankingMetrics } from "@/lib/padel-ranking"

type PlayerRecord = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  country_code: string
  is_active: boolean
}

type ResultRecord = {
  player_id: string
  finishing_position: string
  points_awarded: number
  matches_played: number
  match_wins: number
  group_points_won: number
  group_points_possible: number
}

export type PublicLeaderboardRow = DenseRankedPlayer<RankingMetrics> & {
  first_name: string
  last_name: string
  photo_url: string | null
  country_code: string
  movement: RankMovement
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

export async function getPublicPadelLeaderboard(): Promise<PublicLeaderboardRow[]> {
  const supabase = getPublicSupabaseClient()

  const [{ data: players }, { data: results }, { data: tournaments }, { data: snapshots }] =
    await Promise.all([
      supabase
        .from("padel_players")
        .select("id, first_name, last_name, photo_url, country_code, is_active")
        .eq("is_active", true),
      supabase
        .from("padel_tournament_results")
        .select(
          "player_id, finishing_position, points_awarded, matches_played, match_wins, group_points_won, group_points_possible"
        ),
      supabase.from("padel_tournaments").select("id, event_date").order("event_date", { ascending: false }),
      supabase.from("padel_ranking_snapshots").select("tournament_id, player_id, rank"),
    ])

  const playerById = new Map<string, PlayerRecord>(
    (players || []).map((player) => [player.id, player as PlayerRecord])
  )
  const metricsById = new Map<string, RankingMetrics>()

  for (const player of players || []) metricsById.set(player.id, emptyMetrics(player.id))

  for (const raw of results || []) {
    const result = raw as ResultRecord
    const metrics = metricsById.get(result.player_id)
    if (!metrics) continue

    metrics.total_points += result.points_awarded || 0
    metrics.titles += result.finishing_position === "winner" ? 1 : 0
    metrics.runner_up_finishes += result.finishing_position === "runner_up" ? 1 : 0
    metrics.matches_played += result.matches_played || 0
    metrics.match_wins += result.match_wins || 0
    metrics.group_points_won += result.group_points_won || 0
    metrics.group_points_possible += result.group_points_possible || 0
  }

  const ranked = computeDenseRanks([...metricsById.values()])

  const snapshotTournamentIds = new Set((snapshots || []).map((snapshot) => snapshot.tournament_id))
  const orderedSnapshotTournaments = (tournaments || []).filter((tournament) =>
    snapshotTournamentIds.has(tournament.id)
  )
  const previousTournamentId = orderedSnapshotTournaments[1]?.id || null

  const previousRankByPlayer = new Map<string, number>()
  if (previousTournamentId) {
    for (const snapshot of snapshots || []) {
      if (snapshot.tournament_id === previousTournamentId) {
        previousRankByPlayer.set(snapshot.player_id, snapshot.rank)
      }
    }
  }

  return ranked.map((rankedPlayer) => {
    const player = playerById.get(rankedPlayer.id)
    return {
      ...rankedPlayer,
      first_name: player?.first_name || "Player",
      last_name: player?.last_name || "",
      photo_url: player?.photo_url || null,
      country_code: player?.country_code || "GB",
      movement: getMovement(
        rankedPlayer.rank,
        previousRankByPlayer.get(rankedPlayer.id) ?? null
      ),
    }
  })
}

export function formatCountryFlag(countryCode: string) {
  const normalized = countryCode.toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return "🏳️"
  return String.fromCodePoint(...[...normalized].map((char) => 127397 + char.charCodeAt(0)))
}

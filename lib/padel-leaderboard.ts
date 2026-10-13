import { getPublicSupabaseClient } from "@/lib/supabase/public"
import {
  computeDenseRanks,
  getMovement,
  type DenseRankedPlayer,
  type RankMovement,
  type RankingMetrics,
} from "@/lib/padel-ranking"

type PlayerRecord = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  country_code: string
  is_active: boolean
}

type BasicPlayerRecord = Omit<PlayerRecord, "country_code"> & {
  total_points?: number | null
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

type BasicResultRecord = Pick<ResultRecord, "player_id" | "finishing_position" | "points_awarded">

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

function fallbackCountryCode(firstName: string, lastName: string) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim().toLocaleLowerCase()

  if (
    fullName === "gagandeep singh lally" ||
    fullName === "manpreet" ||
    fullName === "manpreet singh"
  ) {
    return "NO"
  }

  return "GB"
}

async function loadPlayers() {
  const supabase = getPublicSupabaseClient()

  const basic = await supabase
    .from("padel_players")
    .select("id, first_name, last_name, photo_url, is_active, total_points")
    .eq("is_active", true)

  if (basic.error) throw basic.error

  const nationality = await supabase
    .from("padel_players")
    .select("id, country_code")
    .eq("is_active", true)

  const countryById = new Map<string, string>()
  if (!nationality.error) {
    for (const row of nationality.data || []) {
      if (row.country_code) countryById.set(row.id, row.country_code)
    }
  }

  return (basic.data || []).map((row) => {
    const player = row as BasicPlayerRecord
    return {
      ...player,
      country_code:
        countryById.get(player.id) ||
        fallbackCountryCode(player.first_name, player.last_name),
    } satisfies PlayerRecord & { total_points?: number | null }
  })
}

async function loadResults() {
  const supabase = getPublicSupabaseClient()

  const basic = await supabase
    .from("padel_tournament_results")
    .select("player_id, finishing_position, points_awarded")

  if (basic.error) throw basic.error

  const enhanced = await supabase
    .from("padel_tournament_results")
    .select(
      "player_id, matches_played, match_wins, group_points_won, group_points_possible"
    )

  const enhancedByPlayer = new Map<
    string,
    {
      matches_played: number
      match_wins: number
      group_points_won: number
      group_points_possible: number
    }
  >()

  if (!enhanced.error) {
    for (const row of enhanced.data || []) {
      const current = enhancedByPlayer.get(row.player_id) || {
        matches_played: 0,
        match_wins: 0,
        group_points_won: 0,
        group_points_possible: 0,
      }

      current.matches_played += row.matches_played || 0
      current.match_wins += row.match_wins || 0
      current.group_points_won += row.group_points_won || 0
      current.group_points_possible += row.group_points_possible || 0
      enhancedByPlayer.set(row.player_id, current)
    }
  }

  return {
    basic: (basic.data || []) as BasicResultRecord[],
    enhancedByPlayer,
  }
}

export async function getPublicPadelLeaderboard(): Promise<PublicLeaderboardRow[]> {
  const supabase = getPublicSupabaseClient()

  const [players, resultPayload, tournamentResponse, snapshotResponse] = await Promise.all([
    loadPlayers(),
    loadResults(),
    supabase
      .from("padel_tournaments")
      .select("id, event_date")
      .order("event_date", { ascending: false }),
    supabase
      .from("padel_ranking_snapshots")
      .select("tournament_id, player_id, rank"),
  ])

  const results = resultPayload.basic
  const playerById = new Map(players.map((player) => [player.id, player]))
  const metricsById = new Map<string, RankingMetrics>()

  for (const player of players) {
    const metrics = emptyMetrics(player.id)
    metrics.total_points = player.total_points || 0
    metricsById.set(player.id, metrics)
  }

  const hasStoredTotals = players.some((player) => (player.total_points || 0) > 0)

  for (const result of results) {
    const metrics = metricsById.get(result.player_id)
    if (!metrics) continue

    if (!hasStoredTotals) metrics.total_points += result.points_awarded || 0
    metrics.titles += result.finishing_position === "winner" ? 1 : 0
    metrics.runner_up_finishes += result.finishing_position === "runner_up" ? 1 : 0
  }

  for (const [playerId, enhanced] of resultPayload.enhancedByPlayer.entries()) {
    const metrics = metricsById.get(playerId)
    if (!metrics) continue

    metrics.matches_played = enhanced.matches_played
    metrics.match_wins = enhanced.match_wins
    metrics.group_points_won = enhanced.group_points_won
    metrics.group_points_possible = enhanced.group_points_possible
  }

  const ranked = computeDenseRanks([...metricsById.values()])

  const tournaments = tournamentResponse.data || []
  const snapshots = snapshotResponse.data || []
  const snapshotTournamentIds = new Set(snapshots.map((snapshot) => snapshot.tournament_id))
  const orderedSnapshotTournaments = tournaments.filter((tournament) =>
    snapshotTournamentIds.has(tournament.id)
  )
  const previousTournamentId = orderedSnapshotTournaments[1]?.id || null

  const previousRankByPlayer = new Map<string, number>()
  if (previousTournamentId) {
    for (const snapshot of snapshots) {
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

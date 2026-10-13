// Single source of truth for padel finishing-position points; keep in sync with
// the CHECK constraint + comment in supabase-padel-leaderboard.sql.
export type PadelFinishingPosition =
  | "winner"
  | "runner_up"
  | "third"
  | "fourth"
  | "quarterfinal"
  | "round_of_16"
  | "group_3rd"
  | "group_4th"
  | "group_5th"

export const FINISHING_POSITIONS: Array<{
  value: PadelFinishingPosition
  label: string
  points: number
}> = [
  { value: "winner", label: "Winner", points: 1000 },
  { value: "runner_up", label: "Runner-up", points: 700 },
  { value: "third", label: "3rd place", points: 500 },
  { value: "fourth", label: "4th place", points: 400 },
  { value: "quarterfinal", label: "Quarter-final", points: 250 },
  { value: "round_of_16", label: "Round of 16", points: 150 },
  { value: "group_3rd", label: "Group stage, 3rd", points: 100 },
  { value: "group_4th", label: "Group stage, 4th", points: 50 },
  { value: "group_5th", label: "Group stage, 5th", points: 25 },
]

export function getPositionLabel(value: string): string {
  return FINISHING_POSITIONS.find((p) => p.value === value)?.label || value
}

export function getPointsForPosition(value: string): number {
  return FINISHING_POSITIONS.find((p) => p.value === value)?.points || 0
}

export type RankedPlayer<T extends { id: string; total_points: number }> = T & {
  rank: number
}

/**
 * Legacy competition ranking, retained for older call-sites while SPA Ranking
 * System V2 migrates to computeDenseRanks.
 */
export function computeRanksWithTies<T extends { id: string; total_points: number }>(
  players: T[]
): RankedPlayer<T>[] {
  const sorted = [...players].sort((a, b) => b.total_points - a.total_points)
  let rank = 0
  let lastPoints: number | null = null
  return sorted.map((player, index) => {
    if (lastPoints === null || player.total_points !== lastPoints) {
      rank = index + 1
      lastPoints = player.total_points
    }
    return { ...player, rank }
  })
}

export type RankingMetrics = {
  id: string
  total_points: number
  titles: number
  runner_up_finishes: number
  match_wins: number
  matches_played: number
  group_points_won: number
  group_points_possible: number
}

export type DenseRankedPlayer<T extends RankingMetrics> = T & {
  rank: number
  win_percentage: number
  group_points_won_percentage: number
}

function safeRate(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0
}

function rankingTuple(player: RankingMetrics) {
  return [
    player.total_points,
    player.titles,
    player.runner_up_finishes,
    player.match_wins,
    safeRate(player.match_wins, player.matches_played),
    safeRate(player.group_points_won, player.group_points_possible),
  ] as const
}

function compareRankingMetrics(a: RankingMetrics, b: RankingMetrics) {
  const aTuple = rankingTuple(a)
  const bTuple = rankingTuple(b)

  for (let index = 0; index < aTuple.length; index += 1) {
    if (aTuple[index] !== bTuple[index]) return bTuple[index] - aTuple[index]
  }

  // Deterministic ordering for exact ties without changing their shared rank.
  return a.id.localeCompare(b.id)
}

function hasSameRankingTuple(a: RankingMetrics, b: RankingMetrics) {
  const aTuple = rankingTuple(a)
  const bTuple = rankingTuple(b)
  return aTuple.every((value, index) => value === bTuple[index])
}

/**
 * SPA Ranking System V2 ranking order:
 * 1. Ranking points
 * 2. Titles
 * 3. Runner-up finishes
 * 4. Match wins
 * 5. Match win percentage
 * 6. Group-points-won percentage
 *
 * Dense rank means equal six-level tuples share a rank and the next distinct
 * tuple receives the next integer rank: 1, 1, 2 (not 1, 1, 3).
 */
export function computeDenseRanks<T extends RankingMetrics>(
  players: T[]
): DenseRankedPlayer<T>[] {
  const sorted = [...players].sort(compareRankingMetrics)
  let rank = 0
  let previous: T | null = null

  return sorted.map((player) => {
    if (previous === null || !hasSameRankingTuple(previous, player)) rank += 1
    previous = player

    return {
      ...player,
      rank,
      win_percentage: safeRate(player.match_wins, player.matches_played) * 100,
      group_points_won_percentage:
        safeRate(player.group_points_won, player.group_points_possible) * 100,
    }
  })
}

export type RankMovement = "up" | "down" | "same" | "new"

export function getMovement(currentRank: number, previousRank: number | null): RankMovement {
  if (previousRank == null) return "new"
  if (currentRank < previousRank) return "up"
  if (currentRank > previousRank) return "down"
  return "same"
}

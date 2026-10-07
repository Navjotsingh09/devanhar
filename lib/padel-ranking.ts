// SPA ranking rules.
// Keep finishing-position values in sync with supabase-spa-leaderboard-v2.sql.

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

export const SOURCE_FINISH_CODE_TO_POSITION: Record<string, PadelFinishingPosition> = {
  WIN: "winner",
  RUNNER_UP: "runner_up",
  THIRD: "third",
  FOURTH: "fourth",
  QF: "quarterfinal",
  R16: "round_of_16",
  GROUP_3: "group_3rd",
  GROUP_4: "group_4th",
  GROUP_5: "group_5th",
}

export function getPositionLabel(value: string): string {
  return FINISHING_POSITIONS.find((p) => p.value === value)?.label || value
}

export function getPointsForPosition(value: string): number {
  return FINISHING_POSITIONS.find((p) => p.value === value)?.points || 0
}

export type LeaderboardCriteria = {
  id: string
  ranking_points: number
  titles: number
  runner_up_finishes: number
  match_wins: number
  win_percentage: number
  group_points_won_pct: number
  display_name?: string
}

export type RankedPlayer<T extends LeaderboardCriteria> = T & { rank: number }

/**
 * Spreadsheet source-of-truth ranking:
 * points -> titles -> runner-ups -> match wins -> weighted win % ->
 * aggregate group-points-won %. All descending. Dense rank.
 * Alphabetical display order only applies when all six ranking criteria tie.
 */
export function computeDenseLeaderboardRanks<T extends LeaderboardCriteria>(
  players: T[]
): RankedPlayer<T>[] {
  const sorted = [...players].sort((a, b) => {
    const criteria =
      b.ranking_points - a.ranking_points ||
      b.titles - a.titles ||
      b.runner_up_finishes - a.runner_up_finishes ||
      b.match_wins - a.match_wins ||
      b.win_percentage - a.win_percentage ||
      b.group_points_won_pct - a.group_points_won_pct

    if (criteria !== 0) return criteria
    return (a.display_name || "").localeCompare(b.display_name || "")
  })

  let rank = 0
  let previousKey: string | null = null

  return sorted.map((player) => {
    const key = [
      player.ranking_points,
      player.titles,
      player.runner_up_finishes,
      player.match_wins,
      player.win_percentage,
      player.group_points_won_pct,
    ].join("|")

    if (key !== previousKey) {
      rank += 1
      previousKey = key
    }

    return { ...player, rank }
  })
}

/**
 * Backward-compatible helper for any older screens that only have points.
 * Dense ranking: 100,100,80 => 1,1,2.
 */
export function computeRanksWithTies<T extends { id: string; total_points: number }>(
  players: T[]
): Array<T & { rank: number }> {
  const sorted = [...players].sort((a, b) => b.total_points - a.total_points)
  let rank = 0
  let lastPoints: number | null = null

  return sorted.map((player) => {
    if (lastPoints === null || player.total_points !== lastPoints) {
      rank += 1
      lastPoints = player.total_points
    }
    return { ...player, rank }
  })
}

export type RankMovement = "up" | "down" | "same" | "new"

export function getMovement(currentRank: number, previousRank: number | null): RankMovement {
  if (previousRank == null) return "new"
  if (currentRank < previousRank) return "up"
  if (currentRank > previousRank) return "down"
  return "same"
}

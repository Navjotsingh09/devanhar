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
 * Competition ranking (ties share a rank; the next distinct score skips ahead
 * by the number of tied players), e.g. points 100,100,80 -> ranks 1,1,3.
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

export type RankMovement = "up" | "down" | "same" | "new"

export function getMovement(currentRank: number, previousRank: number | null): RankMovement {
  if (previousRank == null) return "new"
  if (currentRank < previousRank) return "up"
  if (currentRank > previousRank) return "down"
  return "same"
}

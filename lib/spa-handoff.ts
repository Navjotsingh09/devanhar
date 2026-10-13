import handoff from '@/data/spa-handoff-2026.json'

type Row = {
  canonical_player_id?: string | null
  first_name: string
  last_name: string
  rank: number
  total_points: number
  titles: number
  runner_up_finishes: number
  match_wins: number
  matches_played: number
  group_points_won: number
  group_points_possible: number
}

export function checkSPAWorkbookParity(rows: Row[]) {
  const issues: string[] = []
  const actual = new Map(rows.map((row) => [row.canonical_player_id, row]))
  if (rows.length !== handoff.players.length) issues.push(`Expected ${handoff.players.length} ranked players; found ${rows.length}`)
  for (const expected of handoff.players) {
    const row = actual.get(expected.canonical_player_id)
    if (!row) { issues.push(`Missing identity: ${expected.display_name} (${expected.canonical_player_id})`); continue }
    const name = [row.first_name, row.last_name].filter(Boolean).join(' ')
    const values = [row.rank, row.total_points, row.titles, row.runner_up_finishes, row.match_wins,
      row.matches_played, row.group_points_won, row.group_points_possible]
    const wanted = [expected.rank, expected.ranking_points, expected.titles, expected.runner_up_finishes,
      expected.match_wins, expected.matches_played, expected.group_points_scored,
      expected.group_points_scored + expected.group_points_conceded]
    if (name !== expected.display_name || values.some((value, i) => value !== wanted[i])) {
      issues.push(`Workbook mismatch: ${expected.display_name} (${expected.canonical_player_id})`)
    }
  }
  return { passed: issues.length === 0, checked: handoff.players.length, issues }
}

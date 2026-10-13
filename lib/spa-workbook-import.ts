import { FINISHING_POSITIONS } from './padel-ranking'
import { isValidCountryCode } from './countries'

export type SPAImportPlayer = { canonical_player_id: string; display_name: string; country_code?: string }
export type SPAImportResult = {
  result_id: string; canonical_player_id: string; partner_canonical_id: string;
  source_tournament_id: string; finishing_position: string; matches_played: number;
  match_wins: number; group_points_won: number; group_points_possible: number; notes: string;
}
export type SPAWorkbookImport = { players: SPAImportPlayer[]; results: SPAImportResult[] }
const positions: Record<string, string> = {
  WIN: 'winner', RUNNER_UP: 'runner_up', THIRD: 'third', FOURTH: 'fourth',
  QF: 'quarterfinal', R16: 'round_of_16', GROUP_3: 'group_3rd', GROUP_4: 'group_4th', GROUP_5: 'group_5th',
}

export function parseSPAWorkbookSheets(sheets: Record<string, unknown[][]>): SPAWorkbookImport {
  for (const name of ['Leaderboard', 'Player results', 'Points rules', 'Developer notes']) {
    if (!sheets[name]) throw new Error(`Missing workbook tab: ${name}`)
  }
  function records(name: string, firstHeader: string) {
    const rows = sheets[name]; const start = rows.findIndex((row) => row[0] === firstHeader)
    if (start < 0) throw new Error(`${name}: missing ${firstHeader} header`)
    const headers = rows[start].map(String)
    return rows.slice(start + 1).filter((row) => row[0] != null && row[0] !== '')
      .map((row) => Object.fromEntries(headers.map((header, i) => [header, row[i]])))
  }
  const pointRules = records('Points rules', 'finish_code')
  for (const position of FINISHING_POSITIONS) {
    const rule = pointRules.find((rule) => positions[String(rule.finish_code)] === position.value)
    if (!rule || rule.points_per_player !== position.points) throw new Error(`Points rules do not match the official award for ${position.label}`)
  }
  const players = records('Leaderboard', 'rank').filter((row) => row.canonical_player_id).map((row) => ({
    canonical_player_id: String(row.canonical_player_id), display_name: String(row.display_name || ''),
    ...(row.country_code ? { country_code: String(row.country_code).trim().toUpperCase() } : {}),
  }))
  const rawResults = records('Player results', 'result_id')
  const byTeam = new Map<string, typeof rawResults>()
  for (const row of rawResults) {
    const team = `${row.tournament_id}:${row.team_id}`
    byTeam.set(team, [...(byTeam.get(team) || []), row])
  }
  const results = rawResults.map((row) => {
    const team = byTeam.get(`${row.tournament_id}:${row.team_id}`) || []
    if (team.length !== 2) throw new Error(`Team ${row.team_id} must contain exactly two player results`)
    const partner = team.find((r) => r.result_id !== row.result_id)
    const total = Number(row.group_total_points)
    const scored = typeof row.group_points_scored === 'number' ? row.group_points_scored
      : (total + Number(row.group_point_difference)) / 2
    return {
      result_id: String(row.result_id), canonical_player_id: String(row.canonical_player_id),
      partner_canonical_id: String(partner?.canonical_player_id || ''),
      source_tournament_id: String(row.tournament_id), finishing_position: positions[String(row.finish_code)] || '',
      matches_played: Number(row.matches_played), match_wins: Number(row.match_wins),
      group_points_won: scored, group_points_possible: total,
      notes: [String(row.review_note || ''), `Workbook source pair: ${row.source_pair || ''}`,
        row.tournament_id === 'T2' ? 'Group totals use the source workbook assumption: every group game used all 32 points; replace with actual totals if shortened games or walkovers occurred.' : ''].filter(Boolean).join('; '),
    }
  })
  const payload = { players, results }
  validateSPAWorkbookImport(payload)
  return payload
}

export function validateSPAWorkbookImport(payload: SPAWorkbookImport) {
  if (!payload || !Array.isArray(payload.players) || !Array.isArray(payload.results)) throw new Error('Invalid workbook data')
  if (!payload.players.length || payload.players.length > 2000 || !payload.results.length || payload.results.length > 4000) throw new Error('Import must contain 1–2,000 players and 1–4,000 results')
  const key = /^[A-Za-z0-9:_-]{1,100}$/
  const players = new Set<string>()
  for (const p of payload.players) {
    if (!key.test(p.canonical_player_id) || players.has(p.canonical_player_id)) throw new Error('Player identity keys must be valid and unique')
    if (typeof p.display_name !== 'string' || !p.display_name.trim() || p.display_name.length > 150) throw new Error('Every player needs a display name')
    if (p.country_code && !isValidCountryCode(p.country_code)) throw new Error(`Invalid country for ${p.display_name}`)
    players.add(p.canonical_player_id)
  }
  const resultIds = new Set<string>(); const appearances = new Set<string>()
  const byAppearance = new Map(payload.results.map((r) => [`${r.source_tournament_id}:${r.canonical_player_id}`, r]))
  for (const r of payload.results) {
    if (!key.test(r.result_id) || resultIds.has(r.result_id) || !key.test(r.source_tournament_id)) throw new Error('Result keys must be valid and unique')
    resultIds.add(r.result_id)
    if (!players.has(r.canonical_player_id) || !players.has(r.partner_canonical_id) || r.canonical_player_id === r.partner_canonical_id) throw new Error(`Invalid player or partner identity in ${r.result_id}`)
    const appearance = `${r.source_tournament_id}:${r.canonical_player_id}`
    if (appearances.has(appearance)) throw new Error('A player can have only one final result per tournament')
    appearances.add(appearance)
    if (!FINISHING_POSITIONS.some((p) => p.value === r.finishing_position)) throw new Error(`Invalid finish in ${r.result_id}`)
    if ([r.matches_played, r.match_wins, r.group_points_won, r.group_points_possible].some((n) => !Number.isSafeInteger(n) || n < 0 || n > 1000000)) throw new Error(`Invalid match or group statistics in ${r.result_id}`)
    if (r.match_wins > r.matches_played || r.group_points_won > r.group_points_possible) throw new Error(`Impossible match or group statistics in ${r.result_id}`)
    if (typeof r.notes !== 'string' || r.notes.length > 2000) throw new Error('Result notes are too long')
    const partner = byAppearance.get(`${r.source_tournament_id}:${r.partner_canonical_id}`)
    if (!partner || partner.partner_canonical_id !== r.canonical_player_id || partner.finishing_position !== r.finishing_position || partner.match_wins !== r.match_wins || partner.matches_played !== r.matches_played || partner.group_points_won !== r.group_points_won || partner.group_points_possible !== r.group_points_possible) throw new Error(`Partner results do not agree in ${r.result_id}`)
  }
}

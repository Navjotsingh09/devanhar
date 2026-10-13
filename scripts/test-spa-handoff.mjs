import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const fixture = JSON.parse(fs.readFileSync('data/spa-handoff-2026.json', 'utf8'))
function load(path, modules = {}) {
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, { module, exports: module.exports, Intl,
    require(name) { if (!(name in modules)) throw Error(`Unexpected dependency ${name}`); return modules[name] } })
  return module.exports
}
const ranking = load('lib/padel-ranking.ts')
const countries = load('lib/countries.ts')
const parity = load('lib/spa-handoff.ts', { '@/data/spa-handoff-2026.json': fixture })
function leaderboard() {
  const rows = fixture.players.map((p) => ({ id: p.canonical_player_id, canonical_player_id: p.canonical_player_id,
    first_name: p.first_name, last_name: p.last_name, display_name: p.display_name,
    total_points: 0, titles: 0, runner_up_finishes: 0, match_wins: 0, matches_played: 0,
    group_points_won: 0, group_points_possible: 0 }))
  const byId = new Map(rows.map((row) => [row.id, row]))
  for (const r of fixture.results) {
    const p = byId.get(r.canonical_player_id)
    p.total_points += ranking.getPointsForPosition(r.finishing_position)
    p.titles += Number(r.finish_code === 'WIN')
    p.runner_up_finishes += Number(r.finish_code === 'RUNNER_UP')
    p.match_wins += r.match_wins; p.matches_played += r.matches_played
    p.group_points_won += r.group_points_scored; p.group_points_possible += r.group_total_points
  }
  return ranking.computeDenseRanks(rows)
}
test('All 99 live-engine rankings match the handoff, including every tie-break input', () => {
  const report = parity.checkSPAWorkbookParity(leaderboard())
  assert.equal(report.passed, true, report.issues.join('\n'))
  assert.equal(report.checked, 99)
})
test('Complete ties share a dense rank and display alphabetically', () => {
  const rows = leaderboard()
  assert.equal(rows[0].display_name, 'Gavin Samra'); assert.equal(rows[1].display_name, 'Mandeep Singh')
  assert.equal(rows[0].rank, 1); assert.equal(rows[1].rank, 1); assert.equal(rows[2].rank, 2)
})
test('Parity rejects missing identities and changed performance, rather than trusting a row count', () => {
  assert.equal(parity.checkSPAWorkbookParity(leaderboard().slice(1)).passed, false)
  const rows = leaderboard(); rows[0].match_wins -= 1
  assert.equal(parity.checkSPAWorkbookParity(rows).passed, false)
})
test('104 immutable result keys preserve separate Jays and the five confirmed merges', () => {
  assert.equal(new Set(fixture.results.map((r) => r.result_id)).size, 104)
  assert.equal(new Set(fixture.results.map((r) => r.canonical_player_id)).size, 99)
  assert.equal(fixture.players.filter((p) => p.display_name === 'Jay').length, 2)
  assert.equal(fixture.players.filter((p) => p.appearances === 2).length, 5)
  assert.equal(fixture.results.filter((r) => r.tournament_id === 'T2').length, 64)
})
test('Both Norwegian players have confirmed names; every T2 result records its score assumption', () => {
  assert.equal(fixture.players.filter((p) => p.country_code === 'NO').map((p) => p.display_name).sort().join('|'), 'Gagandeep Singh Lally|Manpreet')
  assert.ok(fixture.results.filter((r) => r.tournament_id === 'T2').every((r) => r.notes.includes('assuming every group game used all 32 points')))
})
test('250 country and territory options have distinct flags and reject invented country codes', () => {
  assert.equal(countries.COUNTRIES.length, 250)
  assert.equal(new Set(countries.COUNTRIES.map((c) => c.code)).size, 250)
  for (const c of countries.COUNTRIES) assert.notEqual(countries.formatCountryFlag(c.code), '🏳️')
  assert.equal(countries.formatCountryFlag('IN'), '🇮🇳')
  assert.equal(countries.formatCountryFlag('JP'), '🇯🇵')
  assert.equal(countries.isValidCountryCode('ZZ'), false)
})
test('Authorised staff can save any supported country; unauthorised requests cannot write', async () => {
  let allowed = true; const saved = []; const invalidations = []
  const client = { from(table) { assert.equal(table, 'padel_players'); return {
    update(value) { return { async eq(key, id) { saved.push({ value, key, id }); return { error: null } } } },
    async insert(value) { saved.push({ value }); return { error: null } },
  } } }
  const actions = load('app/dashboard/padel/players/actions.ts', {
    '@/lib/padel-admin': { async checkPadelStaffAccess() { return allowed ? client : null } },
    'next/cache': { revalidatePath(...args) { invalidations.push(args) } }, '@/lib/countries': countries,
  })
  for (const c of countries.COUNTRIES) {
    const result = await actions.updatePlayer('player-id', { first_name: 'Test', last_name: '', country_code: c.code })
    assert.equal(result.success, true); assert.equal(saved.at(-1).value.country_code, c.code)
  }
  assert.ok(invalidations.some(([path]) => path === '/spa/leaderboard'))
  assert.ok(invalidations.some(([path]) => path === '/spa-admin'))
  const count = saved.length
  assert.ok((await actions.updatePlayer('player-id', { first_name: 'Test', last_name: '', country_code: 'ZZ' })).error)
  allowed = false
  assert.ok((await actions.updatePlayer('player-id', { first_name: 'Test', last_name: '', country_code: 'NO' })).error)
  assert.equal(saved.length, count)
})

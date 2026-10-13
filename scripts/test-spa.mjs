import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function loadTypeScript(path) {
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(source, { module, exports: module.exports, URL })
  return module.exports
}
const payment = loadTypeScript('lib/padel-payment.ts')
const ranking = loadTypeScript('lib/padel-ranking.ts')
const metrics = (id, extra = {}) => ({ id, total_points: 100, titles: 0, runner_up_finishes: 0, match_wins: 0, matches_played: 0, group_points_won: 0, group_points_possible: 0, ...extra })

test('Amsterdam uses the exact supplied TotalGiving URL, without invented query parameters', () => {
  const dest = payment.getPadelPaymentDestination({ name: 'SPA | Amsterdam' })
  assert.equal(dest.url, 'https://www.totalgiving.co.uk/appeal/SPAEU/donate')
  assert.equal(dest.provider, 'totalgiving')
})
test('Other events retain their existing checkout; an explicit allowed tournament URL overrides the fallback', () => {
  assert.equal(payment.getPadelPaymentDestination({ name: 'London' }).url, payment.LEGACY_PADEL_PAYMENT_URL)
  assert.equal(payment.getPadelPaymentDestination({ name: 'Amsterdam', payment_url: 'https://www.totalgiving.co.uk/appeal/another/donate' }).url, 'https://www.totalgiving.co.uk/appeal/another/donate')
})
test('Untrusted payment destinations are rejected', () => {
  for (const url of ['javascript:alert(1)', 'http://www.totalgiving.co.uk/appeal/SPAEU/donate', 'https://totalgiving.co.uk.attacker.example/donate', 'https://user:password@www.totalgiving.co.uk/donate']) assert.equal(payment.validatePadelPaymentUrl(url), false)
})
test('Payment notifications cannot reinstate declined, archived, cancelled or rejected applications', () => {
  for (const status of ['declined', 'archived', 'cancelled', 'rejected']) assert.equal(payment.canAutoConfirmPadelRegistration(status), false)
  assert.equal(payment.canAutoConfirmPadelRegistration('payment_pending'), true)
})
test('Application approval alone is not evidence of payment', () => {
  assert.equal(payment.getPadelPaymentStatus({ status: 'approved' }), 'unverified')
  assert.equal(payment.getPadelPaymentStatus({ stripe_pi_status: 'requires_capture' }), 'authorized')
  assert.equal(payment.getPadelPaymentStatus({ payment_status: 'paid' }), 'paid')
  assert.equal(payment.getPadelPaymentStatus({ stripe_pi_status: 'succeeded' }), 'paid')
})
const cases = [
  ['points', { total_points: 101 }, {}],
  ['titles', { titles: 1 }, {}],
  ['runner-up finishes', { runner_up_finishes: 1 }, {}],
  ['match wins', { match_wins: 2, matches_played: 10 }, { match_wins: 1, matches_played: 1 }],
  ['win percentage', { match_wins: 2, matches_played: 3 }, { match_wins: 2, matches_played: 4 }],
  ['group points percentage', { group_points_won: 3, group_points_possible: 4 }, { group_points_won: 3, group_points_possible: 5 }],
]
for (const [name, better, worse] of cases) test(`Six-level engine breaks ties by ${name}`, () => {
  const ordered = ranking.computeDenseRanks([metrics('worse', worse), metrics('better', better)])
  assert.equal(ordered[0].id, 'better')
  assert.equal(ordered[1].rank, 2)
})
test('Exact ties use dense ranks and zero denominators produce finite percentages', () => {
  const rows = ranking.computeDenseRanks([metrics('a'), metrics('b'), metrics('c', { total_points: 50 })])
  assert.equal(rows[0].rank, 1); assert.equal(rows[1].rank, 1); assert.equal(rows[2].rank, 2)
  assert.equal(rows[0].win_percentage, 0); assert.equal(rows[0].group_points_won_percentage, 0)
})

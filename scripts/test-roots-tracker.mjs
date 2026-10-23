import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import {createRequire} from 'node:module'
const require = createRequire(import.meta.url)
function load(path, modules = {}) {
  const module = {exports: {}}
  const compiled = ts.transpileModule(fs.readFileSync(path, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}, reportDiagnostics: true})
  assert.equal(compiled.diagnostics?.length || 0, 0, path)
  vm.runInNewContext(compiled.outputText, {module, exports: module.exports, URL, console: {error() {}}, require: name => name in modules ? modules[name] : require(name)})
  return module.exports
}
const model = load('lib/roots-forms/application-tracker.ts')
const now = new Date('2026-10-25T12:00:00Z')
for (const [created, expected] of [
  ['2026-10-25T00:00:00Z', 'Today'],
  ['2026-10-24T12:00:00Z', '1 day old'],
  ['2026-10-23T12:00:00Z', '2 days old'],
  ['2026-10-24T23:30:00Z', 'Today'],
  ['2026-10-26T12:00:00Z', 'Today'],
  ['invalid', 'Date unavailable'],
]) test(`application age: ${created}`, () => assert.equal(model.applicationAge(created, now), expected))
test('UK calendar days, including spring and autumn DST, not elapsed 24-hour periods', () => {
  assert.equal(model.applicationAge('2026-03-28T23:30:00Z', new Date('2026-03-29T23:15:00Z')), '2 days old')
  assert.equal(model.applicationAge('2026-10-24T22:30:00Z', new Date('2026-10-25T23:15:00Z')), '1 day old')
})
test('decision and payment labels distinguish new, accepted unpaid, paid and declined', () => {
  assert.equal(model.decisionLabels.pending, 'New')
  assert.equal(model.applicationPaymentLabel('not_required', 'pending'), '£50 payable after acceptance')
  assert.equal(model.applicationPaymentLabel('not_required', 'accepted'), 'Awaiting payment')
  assert.equal(model.applicationPaymentLabel('paid', 'accepted'), 'Paid')
  assert.equal(model.applicationPaymentLabel('not_required', 'declined'), 'Not requested')
})
const payment = {reference: 'DM-12345', amount: '50.00', paidOn: '2026-10-24', verified: true}
test('payment validation trims reference and converts pounds to exact pence', () => {
  const result = model.checkedPayment({...payment, reference: ' DM-12345 ', amount: '50.25'}, now)
  assert.equal(result.reference, 'DM-12345'); assert.equal(result.amountPence, 5025); assert.equal(result.paidOn, payment.paidOn)
})
for (const change of [
  {reference: ''}, {reference: 'x'}, {reference: 'x'.repeat(101)}, {reference: '<script>'}, {reference: 'a\nb'},
  {verified: false}, {verified: 'true'}, {amount: '49.99'}, {amount: '0'}, {amount: '50.001'},
  {amount: 'NaN'}, {amount: '1e3'}, {amount: 50}, {amount: '10000.01'}, {paidOn: '2026-02-30'}, {paidOn: '2026-10-26'}, {paidOn: ''},
]) test(`invalid payment rejected: ${JSON.stringify(change)}`, () => assert.throws(() => model.checkedPayment({...payment, ...change}, now)))
test('valid payment date follows the UK day during summer midnight', () => {
  assert.doesNotThrow(() => model.checkedPayment({...payment, paidOn: '2026-07-02'}, new Date('2026-07-01T23:10:00Z')))
})
const formId = '11111111-1111-4111-8111-111111111111', responseId = '22222222-2222-4222-8222-222222222222'
function endpoint(options = {}) {
  const calls = []
  const POST = load('app/api/roots-forms/[id]/responses/[responseId]/payment/route.ts', {
    'next/server': {NextResponse: {json: (body, init) => ({body, status: init?.status || 200})}},
    '@/lib/staff-programme-server': {requireRootsStaff: async () => {
      if (options.denied) throw new Error('Denied')
      return {auth: {getUser: async () => ({data: {user: options.signedOut ? null : {id: 'server-actor'}}, error: options.authError ? {} : null})}}
    }},
    '@/lib/roots-forms/server': {
      sameOrigin: () => !options.crossOrigin,
      readJson: async () => {if (options.badJson) throw new Error('Bad JSON'); return options.body ?? payment},
      formsAdmin: () => {
        calls.push('admin')
        if (options.storageThrows) throw new Error('Not configured')
        return {rpc: async (name, args) => {calls.push({name, args}); return {error: options.error || null}}}
      },
    },
    '@/lib/roots-forms/application-tracker': {checkedPayment: input => model.checkedPayment(input, now)},
  }).POST
  return {calls, run: () => POST({}, {params: Promise.resolve({id: options.id || formId, responseId})})}
}
for (const [options, status] of [
  [{crossOrigin: true}, 403], [{denied: true}, 403], [{signedOut: true}, 401], [{authError: true}, 401],
  [{id: 'bad'}, 404], [{badJson: true}, 400], [{body: {...payment, verified: false}}, 400],
]) test(`payment API denies before service access: ${JSON.stringify(options)}`, async () => {
  const h = endpoint(options); assert.equal((await h.run()).status, status); assert.equal(h.calls.length, 0)
})
test('payment API only uses authenticated actor and approved RPC parameters', async () => {
  const h = endpoint({body: {...payment, p_actor: 'forged-actor', verified_by: 'forged-actor'}})
  assert.equal((await h.run()).status, 200)
  const call = h.calls[1]
  assert.equal(call.name, 'record_roots_application_payment')
  assert.equal(call.args.p_actor, 'server-actor')
  assert.equal(call.args.p_form_id, formId); assert.equal(call.args.p_submission_id, responseId)
  assert.equal(call.args.p_amount_pence, 5000)
  assert.equal(Object.keys(call.args).length, 6)
})
for (const [error, status, text] of [
  [{code: '23505', message: 'private'}, 409, /already/],
  [{message: 'application_not_payable'}, 409, /active, accepted, unpaid/],
  [{message: 'application_not_found'}, 404, /not found/],
  [{message: 'payment_before_application'}, 400, /earlier/],
  [{message: 'invalid_payment'}, 400, /Check/],
  [{code: 'PGRST202', message: 'private'}, 503, /database setup/],
]) test(`payment API error ${error.message}`, async () => {
  const result = await endpoint({error}).run(); assert.equal(result.status, status); assert.match(result.body.error, text); assert.doesNotMatch(result.body.error, /private/)
})
test('missing service configuration reports unconfirmed payment instead of crashing or success', async () => assert.equal((await endpoint({storageThrows: true}).run()).status, 503))

function list(options = {}) {
  const calls = []
  const element = (type, props) => ({type, props})
  const client = {from(table) {
    let head = false
    const call = {table, filters: []}; calls.push(call)
    const chain = {
      select(columns, settings) {call.columns = columns; head = settings?.head; return this},
      eq(key, value) {call.filters.push([key, value]); return this},
      order(key, value) {call.order ||= []; call.order.push([key, value]); return this},
      range(start, end) {call.range = [start, end]; return this},
      maybeSingle: async () => ({data: {id: formId, title: 'Roots', slug: options.otherForm ? 'another-form' : 'roots-residential-camp-registration'}}),
      then(resolve, reject) {return Promise.resolve({data: head ? null : [], count: 12, error: options.countError && head ? {code: 'FAIL'} : null}).then(resolve, reject)},
    }; return chain
  }}
  const Page = load('app/dashboard/roots/forms/[id]/responses/page.tsx', {
    'react/jsx-runtime': {jsx: element, jsxs: element},
    'next/link': {}, 'next/navigation': {notFound() {throw new Error('Not found')}},
    'lucide-react': {}, '@/lib/staff-programme-server': {requireRootsStaff: async () => client},
    '@/lib/roots-forms/response-actions': {responseStates: ['active', 'archived', 'deleted']},
    '@/lib/roots-forms/application-tracker': model, '@/components/roots-forms/response-actions': {},
  }).default
  return {calls, run: () => Page({params: Promise.resolve({id: formId}), searchParams: Promise.resolve(options.query || {})})}
}
test('overview counts scope to the current form and record state; filter before database pagination', async () => {
  const h = list({query: {view: 'archived', decision: 'accepted', page: '2'}}); await h.run()
  const queries = h.calls.filter(call => call.table === 'roots_form_submissions')
  assert.equal(queries.length, 5)
  for (const call of queries) {
    assert.ok(call.filters.some(([key, value]) => key === 'form_id' && value === formId))
    assert.ok(call.filters.some(([key, value]) => key === 'record_state' && value === 'archived'))
    assert.doesNotMatch(call.columns, /\*|answers|schema_snapshot|medical|phone/)
  }
  assert.equal(JSON.stringify(queries[0].range), '[25,49]')
  assert.ok(queries[0].filters.some(([key, value]) => key === 'decision_status' && value === 'accepted'))
  assert.equal(JSON.stringify(queries[0].order.map(([key]) => key)), '["created_at","id"]')
  assert.equal(queries.filter(call => call.filters.some(([key]) => key === 'decision_status')).length, 4)
})
test('bad state, decision and page cannot broaden the data scope', async () => {
  const h = list({query: {view: 'malicious', decision: 'malicious', page: '-1'}}); await h.run()
  const call = h.calls[1]
  assert.ok(call.filters.some(([key, value]) => key === 'record_state' && value === 'active'))
  assert.ok(!call.filters.some(([key]) => key === 'decision_status'))
  assert.equal(JSON.stringify(call.range), '[0,24]')
})
test('other forms do not gain Roots decision overview queries or filters', async () => {
  const h = list({otherForm: true, query: {decision: 'accepted'}}); const tree = await h.run()
  assert.equal(h.calls.length, 2)
  assert.doesNotMatch(JSON.stringify(tree), /Application decisions|New means/)
})
test('overview count failures are explicit, not displayed as zero', async () => {
  const h = list({countError: true}); const tree = JSON.stringify(await h.run())
  assert.match(tree, /Decision counts could not be loaded/)
  assert.match(tree, /Unavailable/)
})
test('SQL uses a locked atomic write, immutable reference uniqueness and service-only execution', () => {
  const sql = fs.readFileSync('docs/roots-application-payments.sql', 'utf8')
  assert.match(sql, /begin;[\s\S]+commit;/)
  assert.match(sql, /for update of s/)
  assert.match(sql, /lower\(btrim\(provider_reference\)\)/)
  assert.match(sql, /primary key references public.roots_form_submissions/)
  assert.match(sql, /record_state <> 'active'[\s\S]+decision_status <> 'accepted'[\s\S]+payment_state = 'paid'/)
  assert.match(sql, /decision_email_state = 'pending'/)
  assert.match(sql, /p_paid_on < \(application.created_at/)
  assert.match(sql, /revoke all on function[\s\S]+from public, anon, authenticated/)
  assert.match(sql, /grant execute on function[\s\S]+to service_role/)
  assert.match(sql, /enable row level security/)
  assert.doesNotMatch(sql, /on conflict|delete from|grant (?:insert|update).*authenticated/i)
  const decision = fs.readFileSync('app/api/roots-forms/[id]/responses/[responseId]/decision/route.ts', 'utf8')
  assert.match(decision, /\.eq\('payment_state', row.payment_state\)/)
})
test('payment and detail UI transpile without syntax errors', () => {
  for (const path of ['components/roots-forms/application-payment.tsx', 'app/dashboard/roots/forms/[id]/responses/[responseId]/page.tsx']) {
    const result = ts.transpileModule(fs.readFileSync(path, 'utf8'), {compilerOptions: {jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022}, reportDiagnostics: true})
    assert.equal(result.diagnostics?.length || 0, 0, path)
  }
})
function paymentPanel(props = {}) {
  const jsx = (type, props) => ({type: typeof type === 'string' ? type : 'component', props})
  const component = load('components/roots-forms/application-payment.tsx', {
    'react/jsx-runtime': {jsx, jsxs: jsx},
    react: {useState: initial => [initial, () => {}]},
    'next/navigation': {useRouter: () => ({refresh() {}})},
    '@/components/ui/button': {Button() {}},
    '@/lib/roots-forms/application-tracker': model,
  }).ApplicationPayment
  return component({formId, responseId, accepted: true, paid: false, active: true, verification: null, setupReady: true, earliestDate: '2026-10-23', latestDate: '2026-10-25', ...props})
}
function nodes(tree, type) {
  if (!tree || typeof tree !== 'object') return []
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, type))
  return [...(tree.type === type ? [tree] : []), ...nodes(tree.props?.children, type)]
}
test('missing payment setup disables every entry control and explains the blocker', () => {
  const tree = paymentPanel({setupReady: false})
  assert.match(JSON.stringify(tree), /database setup is not installed or could not be loaded/)
  assert.equal(nodes(tree, 'input').length, 4)
  assert.ok(nodes(tree, 'input').every(input => input.props.disabled === true))
  assert.equal(nodes(tree, 'component')[0].props.disabled, true)
})
test('only active accepted unpaid applications offer payment entry', () => {
  assert.equal(nodes(paymentPanel(), 'form').length, 1)
  for (const props of [{accepted: false}, {active: false}, {paid: true}]) assert.equal(nodes(paymentPanel(props), 'form').length, 0)
})
test('saved verification shows provider evidence and staff audit without allowing edits', () => {
  const tree = paymentPanel({paid: true, verification: {provider_reference: 'DM-TEST', amount_pence: 5000, paid_on: '2026-10-24', verified_at: '2026-10-24T12:00:00Z', verified_by: 'staff-audit-id'}})
  const text = JSON.stringify(tree)
  for (const expected of [/Staff verified/, /DM-TEST/, /50\.00/, /staff-audit-id/, /2026-10-24/]) assert.match(text, expected)
  assert.equal(nodes(tree, 'form').length, 0)
})
test('legacy paid state is not misrepresented as staff-verified evidence', () => {
  const text = JSON.stringify(paymentPanel({paid: true}))
  assert.match(text, /No staff-verification record is available/)
  assert.doesNotMatch(text, /Paid · Staff verified/)
})

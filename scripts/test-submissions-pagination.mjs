import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
function load(path, modules = {}) {
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, { module, exports: module.exports, URLSearchParams, URL, Response, Request, Object, console, require: name => name in modules ? modules[name] : require(name) })
  return module.exports
}
const model = load('lib/crm/submissions.ts')
function database(total = 1000, fail = false) {
  const calls = []
  const client = { from(table) {
    calls.push(['from', table]); let selected, range, filters = [], ascending = false
    const chain = {
      select(columns, options) { selected = columns.split(','); calls.push(['select', columns, options]); return this },
      eq(key, value) { filters.push([key, value]); calls.push(['eq', key, value]); return this },
      or(value) { calls.push(['or', value]); return this },
      order(key, options) { if (key !== 'id') ascending = options.ascending; calls.push(['order', key, options]); return this },
      range(start, end) { range = [start, end]; calls.push(['range', start, end]); return this },
      then(resolve, reject) {
        if (fail) return Promise.resolve({ error: { message: 'private database detail' } }).then(resolve, reject)
        const source = model.sources[table]
        const start = range[0], end = Math.min(total - 1, range[1])
        const rows = []
        for (let i = start; i <= end; i++) {
          const id = ascending ? i + 1 : total - i
          const row = { id, [source.names[0]]: `Name ${id}`, [source.email]: `person${id}@example.test`, [source.status]: 'new', [source.date]: '2026-10-20T12:00:00Z' }
          // Only selected columns should be retrieved in the first place.
          rows.push(Object.fromEntries(selected.map(key => [key, row[key]])))
        }
        return Promise.resolve({ data: rows, count: total, error: null }).then(resolve, reject)
      },
    }
    return chain
  } }
  return { client, calls }
}
for (const source of Object.keys(model.sources)) test(`${source}: single dataset, exactly 25 minimal records`, async () => {
  const db = database()
  const result = await model.loadSubmissionList(db.client, model.listParams({ source }))
  assert.equal(result.rows.length, 25); assert.equal(result.count, 1000)
  assert.equal(db.calls.filter(x => x[0] === 'from').length, 1)
  assert.deepEqual(db.calls.find(x => x[0] === 'range').slice(1), [0, 24])
  const columns = db.calls.find(x => x[0] === 'select')[1]
  assert.doesNotMatch(columns, /\*|stripe|reference|phone|notes|medical|form_data|message/)
  assert.equal(Object.keys(result.rows[0]).join(','), 'id,name,email,status,date')
})
test('page 2 uses database range, with stable date/id order and no duplicates on fixed data', async () => {
  const db = database()
  const first = await model.loadSubmissionList(db.client, model.listParams({}))
  const second = await model.loadSubmissionList(db.client, model.listParams({ page: '2' }))
  assert.equal(new Set([...first.rows, ...second.rows].map(row => row.id)).size, 50)
  assert.deepEqual(db.calls.filter(x => x[0] === 'range').at(-1).slice(1), [25, 49])
  assert.deepEqual(db.calls.filter(x => x[0] === 'order').map(x => x[1]), ['created_at', 'id', 'created_at', 'id'])
})
test('payload row count stays bounded as total grows from 100 to 100000', async () => {
  for (const total of [100, 10000, 100000]) assert.equal((await model.loadSubmissionList(database(total).client, model.listParams({}))).rows.length, 25)
})
test('search and status are applied on the server before the range', async () => {
  const db = database()
  await model.loadSubmissionList(db.client, model.listParams({ source: 'camp_applications', q: 'Nav', status: 'approved', order: 'oldest', page: '2' }))
  assert.match(db.calls.find(x => x[0] === 'or')[1], /first_name.ilike.%Nav%/)
  assert.deepEqual(db.calls.find(x => x[0] === 'eq'), ['eq', 'status', 'approved'])
  assert.equal(db.calls.find(x => x[0] === 'order')[2].ascending, true)
  assert.ok(db.calls.findIndex(x => x[0] === 'eq') < db.calls.findIndex(x => x[0] === 'range'))
})
test('forged table names, malformed pages and filter grammar cannot expand queries', () => {
  assert.equal(model.listParams({ source: 'auth.users' }).source, 'form_submissions')
  assert.equal(model.isSource('__proto__'), false)
  for (const page of ['-1', '0', 'NaN', 'Infinity', '1e6', '100000000']) assert.equal(model.listParams({ page }).page, 1)
  assert.equal(model.listParams({ page: '999999' }).page, 10000)
  const p = model.listParams({ q: 'x%,id.gt.0)(', status: 'new,or(id.gt.0)' })
  assert.doesNotMatch(p.q, /[%(),]/); assert.doesNotMatch(p.status, /[(),.]/)
  assert.equal(model.listParams({ source: 'camp_applications' }, 'recovery_payment_ledger').source, 'recovery_payment_ledger')
})
test('pagination links retain source/search/status/order and use correct recovery route', () => {
  const url = new URL(model.listHref(model.listParams({ source: 'camp_applications', q: 'Nav', status: 'approved', order: 'oldest' }), { page: 2 }, '/dashboard/recovery-payments'), 'https://test.invalid')
  assert.equal(url.pathname, '/dashboard/recovery-payments'); assert.equal(url.searchParams.get('page'), '2')
  for (const [key, value] of [['q', 'Nav'], ['status', 'approved'], ['order', 'oldest']]) assert.equal(url.searchParams.get(key), value)
})
test('query failure is explicit and does not disclose raw database error', async () => {
  await assert.rejects(() => model.loadSubmissionList(database(1000, true).client, model.listParams({})), error => /Unable to load/.test(error.message) && !error.message.includes('private'))
})
let fixture
const createClient = async () => fixture.client
const access = load('lib/crm/submission-access.ts', { 'server-only': {}, '@/lib/supabase/server': { createClient } })
function auth(options = {}) {
  const calls = []
  fixture = { calls, client: {
    auth: { getUser: async () => ({ data: { user: options.signedOut ? null : { id: 'actor' } }, error: options.authError ? {} : null }) },
    from(table) { calls.push(table); return { select: () => ({ eq: () => ({ single: async () => ({ data: options.noProfile ? null : { role: options.role || 'staff' }, error: options.profileError ? {} : null }), maybeSingle: async () => ({ data: { camp: options.camp || 'vidyala-interest' }, error: null }), then: resolve => Promise.resolve({ data: options.nullGrants ? null : (options.programmes || []).map(programme => ({ programme })), error: options.grantError ? {} : null }).then(resolve) }) }) } },
  } }
  return fixture
}
for (const options of [{ signedOut: true }, { authError: true }, { noProfile: true }, { role: 'content_manager' }, { role: 'vacancies_only' }, { role: 'unrecognised' }, { profileError: true }, { grantError: true }, { nullGrants: true }, { programmes: ['family'] }]) test(`CRM actions deny before data/side effects: ${JSON.stringify(options)}`, async () => {
  auth(options); await assert.rejects(() => access.requireSubmissionAccess('form_submissions', '1'))
  assert.ok(fixture.calls.every(table => ['admin_profiles', 'staff_programme_access'].includes(table)))
})
for (const role of ['staff', 'admin', 'super_admin']) test(`preserves existing general ${role} CRM access`, async () => {
  auth({ role }); assert.equal((await access.requireSubmissionAccess()).user.id, 'actor')
})
test('preserves scoped Vidyala row actions but denies other records, global and bulk access', async () => {
  auth({ programmes: ['vidyala'] }); await access.requireSubmissionAccess('vidyala_applications', '1'); await access.requireSubmissionAccess('register_interest', '1')
  await assert.rejects(() => access.requireSubmissionAccess()); await assert.rejects(() => access.requireSubmissionAccess('camp_applications', '1'))
  auth({ programmes: ['vidyala'], camp: 'singhs-camp' }); await assert.rejects(() => access.requireSubmissionAccess('register_interest', '1'))
})
test('runtime table allowlist refuses action source tampering', async () => {
  auth(); await assert.rejects(() => access.requireSubmissionAccess('admin_profiles', '1')); assert.equal(fixture.calls.length, 0)
})
const detail = load('lib/crm/submission-detail.ts', { 'server-only': {}, './submissions': model })
test('detail fetch is restricted to a single requested record and never scans Stripe', async () => {
  const calls = []
  const client = { from: table => { calls.push(['from', table]); return { select: columns => { calls.push(['select', columns]); return { eq: (key, id) => { calls.push(['eq', key, id]); return { maybeSingle: async () => ({ data: { id, full_name: 'Test', email: 'test@example.test', status: 'new', created_at: '2026-10-20', form_data: {} }, error: null }) } } } } } } }
  const result = await detail.loadSubmissionDetail(client, 'form_submissions', '123')
  assert.equal(result.submission.id, '123'); assert.equal(calls.filter(x => x[0] === 'from').length, 1)
  assert.deepEqual(calls.at(-1), ['eq', 'id', '123'])
  await assert.rejects(() => detail.loadSubmissionDetail(client, 'form_submissions', '123,or(id.gt.0)'))
})
test('pages guard reads and list links do not prefetch detail records', () => {
  for (const file of ['app/dashboard/submissions/page.tsx', 'app/dashboard/recovery-payments/page.tsx', 'app/dashboard/submissions/[source]/[id]/page.tsx']) {
    const source = fs.readFileSync(file, 'utf8'); assert.ok(source.indexOf('await requireGeneralStaff()') < source.indexOf('await loadSubmission'))
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/)
  }
  const component = fs.readFileSync('components/dashboard/submissions-list.tsx', 'utf8')
  assert.equal((component.match(/<Link /g) || []).length, (component.match(/<Link prefetch=\{false\}/g) || []).length)
})
const blockedModules = {
  '@/lib/crm/submission-access': { requireSubmissionAccess: async () => { throw new Error('Denied by CRM permission guard') } },
  '@/lib/padel-admin': { checkPadelStaffAccess: async () => null },
  'next/cache': { revalidatePath: () => { throw new Error('Unexpected side effect') } },
}
for (const path of ['@/lib/camp-resume-token', '@/lib/camp-applicant-emails', '@/lib/vidyala-emails', '@/lib/padel-registration-emails', '@/lib/spn-emails']) blockedModules[path] = new Proxy({}, { get: () => () => { throw new Error('Unexpected external side effect') } })
const actions = load('app/dashboard/submissions/actions.ts', blockedModules)
for (const [name, args] of [
  ['updateSubmissionStatus', ['1', 'approved']], ['updateSubmissionNotes', ['1', 'note']], ['assignSubmission', ['1', '2']],
  ['captureApplicationPayment', ['1']], ['cancelApplicationPayment', ['1']], ['capturePadelPayment', ['1']], ['cancelPadelPayment', ['1']],
  ['archiveSubmission', ['1']], ['resendPaymentLink', ['1']], ['reconcileApplicationWithStripe', ['1']],
  ['sendAllPaymentLinks', []], ['getSendableApplicants', []], ['getRecentCampActivity', []], ['captureAllPayments', []],
  ['approveVidyalaApplication', ['1']], ['declineVidyalaApplication', ['1']], ['approveSpnSubmission', ['1']], ['declineSpnSubmission', ['1']],
  ['deleteSubmission', ['1']], ['sendVidyalaMessage', [{ id: '1', sourceTable: 'register_interest', subject: 'Test', message: 'Test' }]],
]) test(`actual server action refuses denied actor before external effects: ${name}`, async () => {
  await assert.rejects(() => actions[name](...args), error => /Denied by CRM|Unauthorized|Only authorised SPA staff/.test(error.message))
})
let exportAllowed = true
let exportCalls = 0
const exporter = load('app/api/crm/submissions/export/route.ts', {
  '@/lib/staff-programme-server': { requireGeneralStaff: async () => { if (!exportAllowed) throw new Error('Denied'); return {} } },
  '@/lib/crm/programme-records': load('lib/crm/programme-records.ts', { './submissions': model }),
  '@/lib/crm/submissions': { ...model, loadSubmissionList: async (_client, params) => { exportCalls++; assert.equal(params.page, 2); return { rows: [{ name: '=SUM(1,2)', email: 'test@example.test', status: 'new', date: '2026-10-20' }], count: 1000 } } },
})
test('CSV export is page-scoped, private, formula-safe and permission checked', async () => {
  const response = await exporter.GET(new Request('https://test.invalid/api/crm/submissions/export?page=2'))
  assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /no-store/)
  assert.match(await response.text(), /"'=SUM\(1,2\)"/); assert.equal(exportCalls, 1)
  exportAllowed = false
  assert.equal((await exporter.GET(new Request('https://test.invalid/api/crm/submissions/export?page=2'))).status, 403)
  assert.equal(exportCalls, 1)
})
function rangeFailure({ code = 'PGRST103', count = 747, countError = false } = {}) {
  const calls = []
  return { calls, client: { from(table) {
    calls.push(['from', table]); let head = false
    const chain = {
      select(columns, options) { head = !!options?.head; calls.push(['select', columns, options]); return this },
      eq(key, value) { calls.push(['eq', key, value]); return this }, or(value) { calls.push(['or', value]); return this },
      ilike(key, value) { calls.push(['ilike', key, value]); return this },
      order() { return this }, range(start, end) { calls.push(['range', start, end]); return this },
      then(resolve, reject) { return Promise.resolve(head ? { data: null, count, error: countError ? { code: '42501' } : null } : { data: null, count: null, error: { code, message: 'internal error' } }).then(resolve, reject) },
    }
    return chain
  } } }
}
test('out-of-range PGRST103 returns an empty list with an exact count, not an outage', async () => {
  const db = rangeFailure()
  const result = await model.loadSubmissionList(db.client, model.listParams({ source: 'recovery_payment_ledger', page: '99999' }))
  assert.equal(result.rows.length, 0); assert.equal(result.count, 747)
  assert.equal(db.calls.filter(c => c[0] === 'from').length, 2)
  assert.equal(db.calls.filter(c => c[0] === 'range').length, 1)
  const counted = db.calls.filter(c => c[0] === 'select').at(-1)
  assert.equal(counted[1], 'id'); assert.equal(counted[2].head, true)
})
test('range recovery count uses the same status/search/programme scope as the failed range', async () => {
  const db = rangeFailure({ count: 8 })
  await model.loadSubmissionList(db.client, model.listParams({ source: 'recovery_payment_ledger', page: '30', q: 'Test', status: 'paid' }), { descriptionContains: 'Padel' })
  assert.equal(db.calls.filter(c => c[0] === 'eq' && c[1] === 'payment_status' && c[2] === 'paid').length, 2)
  assert.equal(db.calls.filter(c => c[0] === 'or').length, 2)
  assert.equal(db.calls.filter(c => c[0] === 'ilike' && c[2] === '%Padel%').length, 2)
})
for (const options of [{ code: 'PGRST000' }, { code: '42501' }, { countError: true }, { count: null }, { count: 1000000 }]) test(`real failure is not disguised as empty data: ${JSON.stringify(options)}`, async () => {
  const db = rangeFailure(options)
  await assert.rejects(() => model.loadSubmissionList(db.client, model.listParams({ page: '2' })), /Unable to load/)
})
test('range error on the first page remains an explicit failure', async () => {
  const db = rangeFailure({ count: 0 })
  await assert.rejects(() => model.loadSubmissionList(db.client, model.listParams({})), /Unable to load/)
  assert.equal(db.calls.filter(c => c[0] === 'from').length, 1)
})
const programmes = load('lib/crm/programme-records.ts', { './submissions': model })
for (const programme of ['padel', 'roots']) test(`${programme}: fixed dataset, bounded rows, scoped recovered evidence and matching CSV links`, async () => {
  const live = programmes.programmeList(programme, { source: 'auth.users', page: '2' })
  assert.equal(live.params.source, programme === 'padel' ? 'padel_registrations' : 'roots_bookings')
  const recovered = programmes.programmeList(programme, { source: 'recovery_payment_ledger', page: '2', q: 'Test', status: 'Paid' })
  assert.equal(recovered.scope.descriptionContains, programme === 'padel' ? 'Padel' : 'Roots Residential')
  assert.match(recovered.exportHref, new RegExp('programme='+programme))
  assert.equal(new URL(recovered.exportHref, 'https://test.invalid').searchParams.get('q'), 'Test')
  assert.equal(recovered.recordHref({ id: '1' }), `/dashboard/${programme}/recovered/1`)
  const db = database();
  // Existing fixture only needs this extra server filter recorded here.
  const original = db.client.from.bind(db.client)
  db.client.from = table => { const chain = original(table); chain.ilike = (key, value) => { db.calls.push(['ilike', key, value]); return chain }; return chain }
  const result = await model.loadSubmissionList(db.client, recovered.params, recovered.scope)
  assert.equal(result.rows.length, 25)
  assert.equal(db.calls.filter(c=>c[0]==='from').length, 1)
  assert.equal(db.calls.find(c=>c[0]==='ilike')[1], 'description')
})
test('friendly statuses preserve raw filter values; Clear filters resets order too', () => {
  assert.equal(model.statusLabel('payment_pending'), 'Awaiting Payment')
  assert.equal(model.statusLabel('in_progress'), 'In Progress')
  assert.equal(model.statusLabel('custom_state'), 'Custom State')
  const component = fs.readFileSync('components/dashboard/submissions-list.tsx', 'utf8')
  assert.match(component, /<RecordStatus status=\{row.status\}/)
  assert.match(fs.readFileSync('components/dashboard/record-status.tsx', 'utf8'), /statusLabel\(status\)/)
  assert.match(component, /page: 1, q: '', status: '', direction: 'newest'/)
  assert.equal(model.listParams({ status: 'archived' }).status, 'archived')
})
test('programme CSV forces live table or scoped evidence and rejects invalid programme without data calls', async () => {
  let observed
  const route=load('app/api/crm/submissions/export/route.ts',{
    '@/lib/staff-programme-server':{requireGeneralStaff:async()=>({})},
    '@/lib/crm/programme-records':programmes,
    '@/lib/crm/submissions':{...model,loadSubmissionList:async(_c,params,scope)=>{observed={params,scope};return {rows:[],count:0}}},
  })
  assert.equal((await route.GET(new Request('https://test.invalid/api/crm/submissions/export?programme=roots&source=auth.users&page=2'))).status,200)
  assert.equal(observed.params.source,'roots_bookings')
  assert.equal((await route.GET(new Request('https://test.invalid/api/crm/submissions/export?programme=padel&source=recovery_payment_ledger&page=2'))).status,200)
  assert.equal(observed.scope.descriptionContains,'Padel')
  observed=null
  assert.equal((await route.GET(new Request('https://test.invalid/api/crm/submissions/export?programme=__proto__'))).status,400)
  assert.equal(observed,null)
})

test('selected-record Back link restores validated list state and ignores arbitrary return destinations', async () => {
  const page = load('app/dashboard/submissions/[source]/[id]/page.tsx', {
    'next/link': { __esModule: true, default: 'a' },
    'next/navigation': { notFound() { throw new Error('not found') } },
    '@/lib/staff-programme-server': { requireGeneralStaff: async () => ({ fixture: true }) },
    '@/lib/crm/submissions': model,
    '@/lib/crm/submission-detail': { validRecordId: detail.validRecordId, loadSubmissionDetail: async () => ({ submission: null, row: { id: '123' } }) },
    '@/components/dashboard/submissions-table': { SubmissionsTable: () => null },
    '@/components/dashboard/record-status': { RecordStatus: () => null },
  })
  const rendered = await page.default({ params: Promise.resolve({ source: 'form_submissions', id: '123' }), searchParams: Promise.resolve({ page: '2', q: 'fixture', status: 'archived', order: 'oldest', source: 'auth.users', returnTo: 'https://example.org' }) })
  const children = rendered.props.children.flat(Infinity).filter(Boolean)
  const back = children.find(child => child.props?.href)
  assert.equal(back.props.href, '/dashboard/submissions?source=form_submissions&page=2&q=fixture&status=archived&order=oldest')
})

for(const role of ['admin','super_admin'])test(`${role} retains full CRM access with a legacy programme assignment`,async()=>{auth({role,programmes:['family']});assert.equal((await access.requireSubmissionAccess('form_submissions','1')).user.id,'actor')})

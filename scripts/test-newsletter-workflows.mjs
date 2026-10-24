import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { loadTypeScript as load } from './helpers/load-typescript.mjs'

const NextResponse = class extends Response { static json(data, init) { return Response.json(data, init) } }
const id = '00000000-0000-4000-8000-000000000001'
function fixture(options = {}) {
  const calls = []
  const result = { data: [], count: 0, error: null, ...options.result }
  const query = { then: resolve => Promise.resolve(result).then(resolve) }
  for (const method of ['select', 'order', 'ilike', 'eq', 'not', 'is', 'range', 'limit', 'update', 'maybeSingle']) {
    query[method] = (...args) => { calls.push([method, ...args]); return query }
  }
  const context = {
    user: { id }, authError: null,
    profile: { data: { role: 'admin' }, error: null }, grants: { data: [], error: null },
    client: { from: table => { calls.push(['from', table]); return query } },
    ...options.context,
  }
  const route = load('app/api/cms/subscribers/route.ts', {
    'next/server': { NextResponse },
    '@/lib/crm/request-staff': { getRequestStaff: async () => context },
    '@/lib/newsletter-unsubscribe': { unsubscribeToken: () => 'test-token' },
    '@/lib/cms/service': { cmsService: () => { if (options.activityThrows) throw new Error('Test logging unavailable'); return { from: () => ({ insert: async () => ({ error: options.activityError ?? null }) }) } } },
  })
  return { route, calls }
}
const request = (body, origin = 'https://example.test') => new Request('https://example.test/api/cms/subscribers', {
  method: 'PATCH', headers: { origin }, body: JSON.stringify(body),
})

for (const [name, context, status] of [
  ['signed out', { user: null }, 401],
  ['profile failure', { profile: { data: null, error: {} } }, 503],
  ['grants failure', { grants: { data: null, error: {} } }, 503],
  ['general staff without newsletter scope', { profile: { data: { role: 'staff' } } }, 403],
  ['Content Manager with a legacy newsletter grant', { profile: { data: { role: 'content_manager' } }, grants: { data: [{ programme: 'newsletter' }] } }, 403],
]) test(`subscriber reads refuse ${name} before accessing records`, async () => {
  const { route, calls } = fixture({ context })
  assert.equal((await route.GET(new Request('https://example.test/api/cms/subscribers'))).status, status)
  assert.equal(calls.length, 0)
})

test('newsletter-scoped staff retain subscriber access', async () => {
  const { route } = fixture({ context: { profile: { data: { role: 'staff' } }, grants: { data: [{ programme: 'newsletter' }] } } })
  assert.equal((await route.GET(new Request('https://example.test/api/cms/subscribers'))).status, 200)
})

test('source, consent, status and page filters reach the database together', async () => {
  const { route, calls } = fixture()
  assert.equal((await route.GET(new Request('https://example.test/api/cms/subscribers?page=2&source=legacy&consent=unknown&status=active&q=parent'))).status, 200)
  for (const expected of [['eq', 'source', 'legacy'], ['is', 'consent_at', null], ['eq', 'status', 'active'], ['range', 25, 49], ['ilike', 'email', '%parent%']]) {
    assert.ok(calls.some(call => JSON.stringify(call) === JSON.stringify(expected)))
  }
})

for (const query of ['page=1.5', 'page=0', 'status=invalid', 'source=unknown', 'consent=yes']) test(`invalid subscriber filter is refused: ${query}`, async () => {
  const { route, calls } = fixture()
  assert.equal((await route.GET(new Request(`https://example.test/api/cms/subscribers?${query}`))).status, 400)
  assert.equal(calls.length, 0)
})

test('database outages are not reported as permission denials or empty lists', async () => {
  const { route } = fixture({ result: { error: new Error('Test database failure'), data: null } })
  assert.equal((await route.GET(new Request('https://example.test/api/cms/subscribers'))).status, 503)
})

test('CSV preserves unknown legacy consent rather than inventing a signup date', async () => {
  const { route } = fixture({ result: { data: [{ id, email: 'parent@example.test', name: '=unsafe', source: 'legacy', status: 'active', created_at: '2020-01-01', consent_at: null, consent_statement: null, subscribed_at: null, unsubscribed_at: null }], count: 1 } })
  const response = await route.GET(new Request('https://example.test/api/cms/subscribers?export=csv'))
  const csv = await response.text()
  assert.equal(response.status, 200)
  assert.ok(csv.includes('Consent recorded,Consent statement'))
  assert.ok(csv.includes("\"'=unsafe\""))
  assert.ok(csv.includes('"2020-01-01","","","",""'))
  assert.equal(response.headers.get('cache-control'), 'private,no-store')
})

test('exports refuse unknown or excessive totals rather than silently truncating', async () => {
  for (const [count, status] of [[null, 503], [10001, 413]]) {
    const { route } = fixture({ result: { count } })
    assert.equal((await route.GET(new Request('https://example.test/api/cms/subscribers?export=csv'))).status, status)
  }
})

test('staff cannot restore withdrawn consent', async () => {
  const { route, calls } = fixture()
  assert.equal((await route.PATCH(request({ id, status: 'active', expectedStatus: 'unsubscribed' }))).status, 409)
  assert.equal(calls.length, 0)
})

test('cross-origin changes never access subscriber records', async () => {
  const { route, calls } = fixture()
  assert.equal((await route.PATCH(request({ id, status: 'unsubscribed', expectedStatus: 'active' }, 'https://evil.test'))).status, 403)
  assert.equal(calls.length, 0)
})

test('consent withdrawal uses expected status and reports logging failures without asking for resubmission', async () => {
  for (const options of [{ activityError: new Error('Test log failure') }, { activityThrows: true }]) {
    const { route, calls } = fixture({ result: { data: { id } }, ...options })
    const response = await route.PATCH(request({ id, status: 'unsubscribed', expectedStatus: 'active' }))
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.success, true)
    assert.ok(body.warning)
    assert.ok(calls.some(call => JSON.stringify(call) === JSON.stringify(['eq', 'status', 'active'])))
  }
})

test('the follow-up migration never backfills consent or historical signup dates', () => {
  const sql = fs.readFileSync('supabase/migrations/20261023163000_newsletter_consent_evidence.sql', 'utf8')
  assert.ok(sql.includes('alter column subscribed_at drop default'))
  assert.ok(sql.includes('add column if not exists consent_at timestamptz'))
  assert.ok(!/\b(update|delete|truncate)\b/i.test(sql))
})

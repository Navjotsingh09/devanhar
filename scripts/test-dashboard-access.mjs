import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
function load(path, modules = {}) {
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, { module, exports: module.exports, URL, Headers, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fake' } }, require: name => name in modules ? modules[name] : require(name) })
  return module.exports
}
const navigation = load('lib/dashboard-navigation.ts')
const access = load('lib/staff-programme-access.ts')
let fixture
const { updateSession } = load('lib/supabase/middleware.ts', {
  '@/lib/staff-programme-access': access,
  '@supabase/ssr': { createServerClient: (_url, _key, config) => ({
    auth: { getSession: async () => {
      if (fixture.refresh) config.cookies.setAll([{ name: 'session', value: 'fresh', options: { httpOnly: true, path: '/', sameSite: 'lax' } }])
      return { data: { session: fixture.user ? { user: fixture.user } : null } }
    } },
    from: () => ({ select: () => ({ eq: async () => ({ data: fixture.programmes.map(programme => ({ programme })), error: fixture.grantError ? {} : null }) }) }),
  }) },
})
function setup(path, options = {}) {
  fixture = { user: { id: 'user', email: 'staff@devanhaar.com', app_metadata: {} }, programmes: [], ...options }
  const request = new (require('next/server').NextRequest)(`https://devanhaar.vercel.app${path}`, { method: options.method || 'GET', headers: { cookie: 'session=old' } })
  return updateSession(request)
}
test('login return destinations cannot redirect outside the dashboard', () => {
  for (const value of ['https://evil.test/dashboard', '//evil.test/dashboard', '/dashboard/../../auth/login', '/dashboard\\evil', '/spa-admin', '/dashboardish', '/dashboard\n']) assert.equal(navigation.dashboardReturnPath(value), '/dashboard')
  assert.equal(navigation.dashboardReturnPath('/dashboard/website/pages?tab=all'), '/dashboard/website/pages?tab=all')
})
test('signed-out deep links preserve the destination and do not cache', async () => {
  const response = await setup('/dashboard/website/pages?tab=all', { user: null })
  const url = new URL(response.headers.get('location'))
  assert.equal(url.pathname, '/auth/login'); assert.equal(url.searchParams.get('next'), '/dashboard/website/pages?tab=all')
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
})
test('login stays reachable for a session rejected by the dashboard layout', async () => {
  const response = await setup('/auth/login?error=access_denied')
  assert.equal(response.headers.get('location'), null)
  assert.equal(response.headers.get('x-middleware-next'), '1')
})
test('signed-in password recovery remains reachable', async () => {
  assert.equal((await setup('/auth/update-password')).headers.get('location'), null)
})
test('refreshed cookies are forwarded to the server render', async () => {
  const response = await setup('/dashboard', { refresh: true })
  assert.match(response.headers.get('x-middleware-request-cookie'), /session=fresh/)
  assert.equal(response.cookies.get('session').value, 'fresh')
})
test('refreshed cookies and their options survive a redirect', async () => {
  const response = await setup('/dashboard', { refresh: true, programmes: ['family'] })
  assert.equal(new URL(response.headers.get('location')).pathname, '/dashboard/family-initiative')
  assert.equal(response.cookies.get('session').value, 'fresh')
  assert.equal(response.cookies.get('session').httpOnly, true)
})
test('failed grant checks show a recoverable sign-in page for navigation', async () => {
  const response = await setup('/dashboard/website', { grantError: true })
  const url = new URL(response.headers.get('location'))
  assert.equal(url.pathname, '/auth/login'); assert.equal(url.searchParams.get('error'), 'access_check_failed')
})
test('failed grant checks still deny API requests', async () => {
  assert.equal((await setup('/api/cms/sfi', { method: 'POST', grantError: true })).status, 503)
})
test('programme accounts cannot enter the global CMS or mutate its API', async () => {
  assert.equal(new URL((await setup('/dashboard/website', { programmes: ['family'] })).headers.get('location')).pathname, '/dashboard/family-initiative')
  assert.equal((await setup('/api/cms/sfi', { method: 'POST', programmes: ['family'] })).status, 403)
})

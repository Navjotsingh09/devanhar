import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'

// Exercise the real route handlers and shared guard without credentials,
// network requests, storage writes or a database. Node 24 matches CI.
const key = Symbol.for('devanhaar.blog-access-test')
const moduleUrl = (source) => `data:text/javascript,${encodeURIComponent(source)}`
const stubState = 'globalThis[Symbol.for("devanhaar.blog-access-test")]'
const root = new URL('../', import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const stubs = {
      'server-only': 'export {}',
      '@/lib/supabase/server': `export async function createClient() { return ${stubState}.client }`,
      '@supabase/supabase-js': `export function createClient() {
        const state = ${stubState}; state.privilegedClients++; return state.admin
      }`,
      'next/server': 'export const NextRequest = Request; export const NextResponse = { json: (body, init) => Response.json(body, init) }',
      'next/cache': 'export function revalidatePath() {}',
    }
    if (specifier in stubs) return { url: moduleUrl(stubs[specifier]), shortCircuit: true }
    if (specifier === '@/lib/blog-staff-server') {
      return { url: new URL('lib/blog-staff-server.ts', root).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

const routes = [
  { name: 'save', method: 'POST', path: 'app/api/blog/route.ts', body: {
    slug: 'test-post', title: 'Test post', pillar: 'Develop', status: 'draft', content: 'Test content',
  } },
  { name: 'delete', method: 'DELETE', path: 'app/api/blog/[slug]/route.ts' },
  { name: 'remove cover', method: 'DELETE', path: 'app/api/blog/cover/route.ts', body: { slug: 'test-post' } },
  { name: 'legacy cleanup', method: 'DELETE', path: 'app/api/blog/legacy-cleanup/route.ts' },
]
for (const route of routes) route.handler = (await import(new URL(route.path, root)))[route.method]

function fixture(options = {}) {
  const state = { privilegedClients: 0, writes: [], lookups: [] }
  state.client = {
    auth: { getUser: async () => ({
      data: { user: options.signedOut ? null : { id: 'staff-123' } },
      error: options.authError ? { message: 'Auth unavailable' } : null,
    }) },
    from(table) {
      state.lookups.push(table)
      const result = table === 'admin_profiles'
        ? { data: options.missingProfile ? null : { role: options.role ?? 'staff' }, error: options.profileError ?? null }
        : { data: options.nullGrants ? null : (options.grants ?? []), error: options.grantsError ?? null }
      return {
        select() { return this }, eq() { return this },
        maybeSingle: async () => result,
        then(resolve, reject) { return Promise.resolve(result).then(resolve, reject) },
      }
    },
  }
  state.admin = {
    from(table) {
      const chain = {
        select() { return this }, eq() { return this }, in() { return this },
        insert(payload) { state.writes.push({ table, action: 'insert', payload }); return this },
        update(payload) { state.writes.push({ table, action: 'update', payload }); return this },
        delete() { state.writes.push({ table, action: 'delete' }); return this },
        single: async () => ({ data: { id: 'post-123' }, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        then(resolve, reject) { return Promise.resolve({ data: [], error: null }).then(resolve, reject) },
      }
      return chain
    },
    storage: { from() { throw new Error('Empty image lists must not trigger storage deletion') } },
  }
  globalThis[key] = state
  return state
}

async function invoke(route, body = route.body) {
  const request = new Request('https://example.test/api/blog', {
    method: route.method,
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  })
  return route.handler(request, { params: Promise.resolve({ slug: 'test-post' }) })
}

// Required by the existing service client factory; these are deliberately fake.
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.test'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-not-a-key'

const denied = [
  ['signed out', { signedOut: true }, 401],
  ['authentication error', { authError: true }, 401],
  ['missing profile', { missingProfile: true }, 403],
  ['profile lookup error', { profileError: { message: 'Unavailable' } }, 403],
  ['programme lookup error', { grantsError: { message: 'Unavailable' } }, 403],
  ['missing programme result', { nullGrants: true }, 403],
  ['vacancies-only account', { role: 'vacancies_only' }, 403],
  ['unknown role', { role: 'content_manager' }, 403],
  ['programme staff', { grants: [{ programme: 'kaurs' }] }, 403],
]

try {
  for (const route of routes) {
    for (const [name, options, status] of denied) {
      test(`${route.name}: blocks ${name} before privileged access`, async () => {
        const state = fixture(options)
        const response = await invoke(route)
        assert.equal(response.status, status)
        assert.equal(state.privilegedClients, 0)
        assert.deepEqual(state.writes, [])
        if (!options.signedOut && !options.authError) {
          assert.deepEqual(state.lookups, ['admin_profiles', 'staff_programme_access'])
        }
      })
    }
    for (const [role, grants] of [['staff',[]],['admin',[]],['super_admin',[]],['admin',[{programme:'family'}]],['super_admin',[{programme:'newsletter'}]]]) {
      test(`${route.name}: retains access for general ${role}/${grants.length}`, async () => {
        const state = fixture({ role, grants })
        const response = await invoke(route)
        assert.equal(response.status, 200)
        assert.equal(state.privilegedClients, 1)
        assert.ok(state.writes.some(write => write.table === 'blog_posts'))
      })
    }
  }
  test('save: preserves the existing draft and published payloads', async () => {
    for (const status of ['draft', 'published']) {
      const state = fixture()
      const response = await invoke(routes[0], { ...routes[0].body, status })
      assert.equal(response.status, 200)
      assert.equal(state.writes[0].payload.status, status)
      assert.equal(state.writes[0].payload.author_id, 'staff-123')
    }
  })
  test.after(() => { hooks.deregister(); delete globalThis[key] })
} catch (error) {
  hooks.deregister()
  throw error
}

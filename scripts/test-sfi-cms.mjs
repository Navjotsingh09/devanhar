import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { createHash } from 'node:crypto'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const require = createRequire(import.meta.url)
function load(path, modules) {
  return loadSource(fs.readFileSync(path, 'utf8'), modules)
}
function loadSource(source, modules) {
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, { module, exports: module.exports, URL, Date, console, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'fake' } }, require: name => name in modules ? modules[name] : require(name) })
  return module.exports
}
const model = load('lib/cms/sfi-content.ts', { './sfi-default.json': JSON.parse(fs.readFileSync('lib/cms/sfi-default.json', 'utf8')) })
const sample = () => JSON.parse(JSON.stringify(model.defaultSfiContent))
const uuid = suffix => `00000000-0000-4000-8000-${String(suffix).padStart(12, '0')}`
let fixture
const server = load('lib/cms/sfi-server.ts', {
  'server-only': {}, './sfi-content': model,
  '@/lib/supabase/server': { createClient: async () => fixture.session },
  '@supabase/supabase-js': { createClient: () => { fixture.privileged++; return fixture.db } },
})
const routes = load('app/api/cms/sfi/route.ts', {
  'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
  'next/cache': { revalidatePath: path => fixture.revalidated.push(path) },
  '@/lib/cms/sfi-server': server, '@/lib/cms/sfi-content': model,
})

function setup(options = {}) {
  const page = options.noPage ? null : { id: uuid(1), slug: 'sfi', draft_revision_id: uuid(3), published_revision_id: uuid(2), updated_at: '2026-10-20T10:00:00Z' }
  const live = sample(); live.hero.title = 'Published title'
  const draft = sample(); draft.hero.title = 'Draft title'
  fixture = {
    page, privileged: 0, writes: [], revalidated: [], options,
    revisions: [{ id: uuid(2), page_id: uuid(1), revision_number: 1, body: JSON.stringify(live) }, { id: uuid(3), page_id: uuid(1), revision_number: 2, body: JSON.stringify(draft) }],
  }
  function client(privileged) {
    return {
      auth: { getUser: async () => ({ data: { user: options.signedOut ? null : { id: uuid(10) } }, error: options.authError ? { code: 'error' } : null }) },
      rpc: async (name, payload) => {
        assert.equal(name, 'cms_create_page')
        fixture.writes.push({ table: 'cms_pages', action: 'create' })
        fixture.page = { id: uuid(1), slug: 'sfi', draft_revision_id: uuid(4), published_revision_id: null }
        fixture.revisions = [{ id: uuid(4), page_id: uuid(1), revision_number: 1, body: payload.p_body }]
        return { data: uuid(1), error: null }
      },
      from(table) {
        let filters = [], operation = 'select', payload, cap
        const chain = {
          select() { return this }, eq(key, value) { filters.push([key, value]); return this },
          is(key, value) { filters.push([key, value]); return this },
          order() { return this }, limit(value) { cap = value; return this },
          insert(value) { operation = 'insert'; payload = value; return this },
          update(value) { operation = 'update'; payload = value; return this },
          async run(single) {
            if (table === 'admin_profiles') return { data: options.missingProfile ? null : { role: options.role ?? 'admin' }, error: options.profileError ? { code: 'error' } : null }
            if (table === 'staff_programme_access') return { data: options.grants ?? [], error: options.grantsError ? { code: 'error' } : null }
            if (table === 'cms_page_assignments') return { data: options.assignment ?? null, error: null }
            if (table === 'activity_log') { fixture.writes.push({ table, action: operation, payload }); return { data: null, error: null } }
            if (options.dbError) return { data: null, error: { code: 'error' } }
            if (table === 'cms_page_revisions' && operation === 'insert') {
              fixture.writes.push({ table, action: operation, payload })
              const revision = { id: uuid(4 + fixture.revisions.length), ...payload }
              fixture.revisions.push(revision)
              return { data: revision, error: null }
            }
            if (table === 'cms_pages' && operation === 'update') {
              if (options.concurrentChange) fixture.page.draft_revision_id = uuid(99)
              const matches = filters.every(([key, value]) => fixture.page?.[key] === value)
              if (!matches) return { data: null, error: null }
              Object.assign(fixture.page, payload)
              fixture.writes.push({ table, action: operation, payload })
              return { data: { id: fixture.page.id }, error: null }
            }
            const rows = (table === 'cms_pages' ? (fixture.page ? [fixture.page] : []) : fixture.revisions.slice().sort((a, b) => b.revision_number - a.revision_number))
              .filter(row => filters.every(([key, value]) => row[key] === value)).slice(0, cap)
            return { data: single ? rows[0] ?? null : rows, error: null }
          },
          single() { return this.run(true) }, maybeSingle() { return this.run(true) },
          then(resolve, reject) { return this.run(false).then(resolve, reject) },
        }
        return chain
      },
    }
  }
  fixture.session = client(false); fixture.db = client(true)
  return fixture
}
const head = () => ({ pageId: fixture.page?.id ?? null, draftId: fixture.page?.draft_revision_id ?? null, publishedId: fixture.page?.published_revision_id ?? null })
const failStatus = status => error => error.status === status

test('defaults retain the existing five events and six FAQs', () => {
  assert.equal(model.sfiSchema.safeParse(sample()).success, true)
  assert.equal(sample().events.length, 5); assert.equal(sample().faqs.length, 6)
})
test('the shared renderer preserves the original public text, links, headings and images', () => {
  const modules = {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/components/navbar': { Navbar: () => React.createElement('nav', null, 'Website navigation') },
    '@/components/footer-section': { FooterSection: () => React.createElement('footer', null, 'Website footer') },
    '@/components/ui/button': { Button: ({ children }) => React.createElement('span', null, children) },
  }
  // Fingerprints captured from main ef0e756 before extracting the renderer.
  // Keep the baseline independent of Git history so shallow CI clones work.
  const hash = value => createHash('sha256').update(value).digest('hex')
  const NewPage = load('components/cms/sfi-page-content.tsx', modules).SfiPageContent
  const newHtml = renderToStaticMarkup(React.createElement(NewPage, { content: sample() }))
  const normalizeText = html => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  assert.equal(hash(normalizeText(newHtml)), '66f125053154fbb4cdd8348f86a43a6742637484218e18efcffe82a37789b4f7')
  const baselines = [
    [/href="[^"]+"/g, '13a8bf236f8b6f9fc7ca40138f41f6ba1c0378ee4c1fd51450a2088ae4cb4c48'],
    [/src="[^"]+"/g, '5a7da0c792105ef4471086011aed8ee7a237e65438547e0764e7af96acea2d19'],
    [/alt="[^"]+"/g, '2310d2d7beeeab7f20e45e66a1cf73e6f7ef770b13a93387bce479db346f54fc'],
  ]
  for (const [pattern, expected] of baselines) assert.equal(hash(JSON.stringify(newHtml.match(pattern))), expected)
})
test('unsafe links, invalid images, blank content and duplicate sections are rejected', () => {
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '/\\evil', 'https://user:pass@example.com', '/test\n']) {
    const content = sample(); content.events[0].href = href
    assert.equal(model.sfiSchema.safeParse(content).success, false, href)
  }
  for (const change of [c => c.hero.image = 'https://example.com/pic.jpg', c => c.hero.title = '', c => c.sectionOrder = ['events', 'events', 'faq', 'community']]) {
    const content = sample(); change(content); assert.equal(model.sfiSchema.safeParse(content).success, false)
  }
})
test('public reads only the published pointer, even when a newer draft exists', async () => {
  setup(); assert.equal((await server.getPublishedSfiContent()).hero.title, 'Published title')
})
test('public reads fall back to the original page for missing/invalid content or database errors', async () => {
  setup({ noPage: true }); assert.equal((await server.getPublishedSfiContent()).hero.title, sample().hero.title)
  setup({ dbError: true }); assert.equal((await server.getPublishedSfiContent()).hero.title, sample().hero.title)
  setup(); fixture.revisions[0].body = 'invalid'; assert.equal((await server.getPublishedSfiContent()).hero.title, sample().hero.title)
})
for (const [name, options, status] of [
  ['signed out', { signedOut: true }, 401], ['auth failure', { authError: true }, 401],
  ['missing profile', { missingProfile: true }, 403], ['profile failure', { profileError: true }, 403],
  ['assignment lookup failure', { grantsError: true }, 403], ['general staff', { role: 'staff' }, 403],
  ['scoped staff', { role: 'staff', grants: [{ programme: 'family' }] }, 403],
  ['unassigned content manager', { role: 'content_manager' }, 403],
]) test(`blocks ${name} before privileged access`, async () => {
  const state = setup(options)
  await assert.rejects(server.sfiContext('edit'), failStatus(status))
  assert.equal(state.privileged, 0); assert.equal(state.writes.length, 0)
})
test('assigned view-only users cannot edit, and editors cannot publish', async () => {
  setup({ role: 'content_manager', assignment: { can_view: true, can_edit: false, can_publish: false } })
  assert.equal((await server.sfiContext()).permissions.view, true)
  await assert.rejects(server.sfiContext('edit'), failStatus(403))
  setup({ role: 'content_manager', assignment: { can_view: true, can_edit: true, can_publish: false } })
  await server.sfiContext('edit'); await assert.rejects(server.sfiContext('publish'), failStatus(403))
})
test('save creates a separate immutable revision and preserves the published pointer/content', async () => {
  setup(); const expected = head(); const content = sample(); content.hero.title = 'New draft'
  await server.changeSfiContent('save', content, expected)
  assert.equal(fixture.page.published_revision_id, expected.publishedId)
  assert.notEqual(fixture.page.draft_revision_id, expected.draftId)
  assert.equal((await server.getPublishedSfiContent()).hero.title, 'Published title')
})
test('a stale save is rejected without inserting a revision', async () => {
  setup(); const expected = { ...head(), draftId: uuid(999) }
  await assert.rejects(server.changeSfiContent('save', sample(), expected), failStatus(409))
  assert.equal(fixture.writes.length, 0)
})
test('a concurrent head change cannot be overwritten after a revision insert', async () => {
  setup({ concurrentChange: true }); const expected = head()
  await assert.rejects(server.changeSfiContent('save', sample(), expected), failStatus(409))
  assert.equal(fixture.page.draft_revision_id, uuid(99))
  assert.equal(fixture.page.published_revision_id, expected.publishedId)
  assert.equal(fixture.writes.some(write => write.table === 'cms_pages'), false)
})
test('publishing advances only to the saved reviewed draft and retains old revisions', async () => {
  setup(); const expected = head(); const content = JSON.parse(fixture.revisions[1].body)
  await server.changeSfiContent('publish', content, expected)
  assert.equal(fixture.page.published_revision_id, expected.draftId)
  assert.equal(fixture.page.draft_revision_id, null)
  assert.equal((await server.getPublishedSfiContent()).hero.title, 'Draft title')
  assert.equal(fixture.revisions.length, 2)
})
test('unsaved content cannot be published and public content stays intact', async () => {
  setup(); await assert.rejects(server.changeSfiContent('publish', sample(), head()), failStatus(409))
  assert.equal((await server.getPublishedSfiContent()).hero.title, 'Published title')
})
test('initial save creates only a draft, with no published pointer', async () => {
  setup({ noPage: true }); await server.changeSfiContent('save', sample(), head())
  assert.equal(fixture.page.published_revision_id, null)
  assert.ok(fixture.page.draft_revision_id)
})
test('API blocks cross-origin requests and invalid content without writes', async () => {
  setup()
  let response = await routes.POST(new Request('https://example.test/api/cms/sfi', { method: 'POST', headers: { origin: 'https://evil.test' }, body: '{}' }))
  assert.equal(response.status, 403)
  response = await routes.POST(new Request('https://example.test/api/cms/sfi', { method: 'POST', headers: { origin: 'https://example.test' }, body: '{}' }))
  assert.equal(response.status, 400)
  assert.equal(fixture.writes.length, 0)
})

for(const role of ['admin','super_admin'])test(`${role} may edit SFI with legacy programme assignments`,async()=>{setup({role,grants:[{programme:'family'}]});assert.equal((await server.sfiContext('publish')).permissions.publish,true)})

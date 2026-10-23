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
const sfi = load('lib/cms/sfi-content.ts', { './sfi-default.json': JSON.parse(fs.readFileSync('lib/cms/sfi-default.json', 'utf8')) })
const settings=load('lib/cms/site-settings.ts',{'./site-settings-default.json':JSON.parse(fs.readFileSync('lib/cms/site-settings-default.json','utf8')),'./sfi-content':sfi})
const copySchema=load('lib/cms/copy-schema.ts',{'./site-settings':settings,'./sfi-content':sfi})
const migrated=JSON.parse(fs.readFileSync('lib/cms/migrated-pages.json','utf8'))
const model = load('lib/cms/page-content.ts', { './home-default.json': JSON.parse(fs.readFileSync('lib/cms/home-default.json', 'utf8')), './sfi-content': sfi,'./site-settings':settings,'./copy-schema':copySchema,'./migrated-pages.json':migrated })
const migration=load('lib/cms/migrated-content.ts',{'./migrated-pages.json':migrated,'./page-content':model})
const sample = () => JSON.parse(JSON.stringify(model.defaultHomeContent))
const uuid = suffix => `00000000-0000-4000-8000-${String(suffix).padStart(12, '0')}`
let fixture
const server = load('lib/cms/page-server.ts', {
  'server-only': {}, './sfi-content': sfi, './page-content': model,'./site-settings':settings,'./migrated-content':migration,
  '@/lib/supabase/server': { createClient: async () => fixture.session },
  '@supabase/supabase-js': { createClient: () => { fixture.privileged++; return fixture.db } },
})
const routes = load('app/api/cms/pages/[slug]/route.ts', {
  'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
  'next/cache': { revalidatePath: path => fixture.revalidated.push(path),revalidateTag:()=>{} },
  '@/lib/cms/page-server': server, '@/lib/cms/sfi-content': sfi, '@/lib/cms/page-content': model,
})

function setup(options = {}) {
  const page = options.noPage ? null : { id: uuid(1), slug: 'home', draft_revision_id: uuid(3), published_revision_id: uuid(2), updated_at: '2026-10-20T10:00:00Z' }
  const live = sample(); live.title = 'Published title'
  const draft = sample(); draft.title = 'Draft title'
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
        fixture.page = { id: uuid(1), slug: 'home', draft_revision_id: uuid(4), published_revision_id: null }
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

test('public reads only the published pointer, even when a newer draft exists', async () => {
  setup(); assert.equal((await server.getPublishedPageContent('home')).title, 'Published title')
})
test('public reads fall back to the original page for missing/invalid content or database errors', async () => {
  setup({ noPage: true }); assert.equal((await server.getPublishedPageContent('home')).title, sample().title)
  setup({ dbError: true }); assert.equal((await server.getPublishedPageContent('home')).title, sample().title)
  setup(); fixture.revisions[0].body = 'invalid'; assert.equal((await server.getPublishedPageContent('home')).title, sample().title)
})
for (const [name, options, status] of [
  ['signed out', { signedOut: true }, 401], ['auth failure', { authError: true }, 401],
  ['missing profile', { missingProfile: true }, 403], ['profile failure', { profileError: true }, 403],
  ['assignment lookup failure', { grantsError: true }, 403], ['general staff', { role: 'staff' }, 403],
  ['scoped staff', { role: 'staff', grants: [{ programme: 'family' }] }, 403],
  ['unassigned content manager', { role: 'content_manager' }, 403],
]) test(`blocks ${name} before privileged access`, async () => {
  const state = setup(options)
  await assert.rejects(server.pageContext('home', 'edit'), failStatus(status))
  assert.equal(state.privileged, 0); assert.equal(state.writes.length, 0)
})
test('assigned view-only users cannot edit, and editors cannot publish', async () => {
  setup({ role: 'content_manager', assignment: { can_view: true, can_edit: false, can_publish: false } })
  assert.equal((await server.pageContext('home')).permissions.view, true)
  await assert.rejects(server.pageContext('home', 'edit'), failStatus(403))
  setup({ role: 'content_manager', assignment: { can_view: true, can_edit: true, can_publish: false } })
  await server.pageContext('home', 'edit'); await assert.rejects(server.pageContext('home', 'publish'), failStatus(403))
})
test('save creates a separate immutable revision and preserves the published pointer/content', async () => {
  setup(); const expected = head(); const content = sample(); content.title = 'New draft'
  await server.changePageContent('home', 'save', content, expected)
  assert.equal(fixture.page.published_revision_id, expected.publishedId)
  assert.notEqual(fixture.page.draft_revision_id, expected.draftId)
  assert.equal((await server.getPublishedPageContent('home')).title, 'Published title')
})
test('a stale save is rejected without inserting a revision', async () => {
  setup(); const expected = { ...head(), draftId: uuid(999) }
  await assert.rejects(server.changePageContent('home', 'save', sample(), expected), failStatus(409))
  assert.equal(fixture.writes.length, 0)
})
test('a concurrent head change cannot be overwritten after a revision insert', async () => {
  setup({ concurrentChange: true }); const expected = head()
  await assert.rejects(server.changePageContent('home', 'save', sample(), expected), failStatus(409))
  assert.equal(fixture.page.draft_revision_id, uuid(99))
  assert.equal(fixture.page.published_revision_id, expected.publishedId)
  assert.equal(fixture.writes.some(write => write.table === 'cms_pages'), false)
})
test('publishing advances only to the saved reviewed draft and retains old revisions', async () => {
  setup(); const expected = head(); const content = JSON.parse(fixture.revisions[1].body)
  await server.changePageContent('home', 'publish', content, expected)
  assert.equal(fixture.page.published_revision_id, expected.draftId)
  assert.equal(fixture.page.draft_revision_id, null)
  assert.equal((await server.getPublishedPageContent('home')).title, 'Draft title')
  assert.equal(fixture.revisions.length, 2)
})
test('unsaved content cannot be published and public content stays intact', async () => {
  setup(); await assert.rejects(server.changePageContent('home', 'publish', sample(), head()), failStatus(409))
  assert.equal((await server.getPublishedPageContent('home')).title, 'Published title')
})
test('initial save creates only a draft, with no published pointer', async () => {
  setup({ noPage: true }); await server.changePageContent('home', 'save', sample(), head())
  assert.equal(fixture.page.published_revision_id, null)
  assert.ok(fixture.page.draft_revision_id)
})
test('API blocks cross-origin requests and invalid content without writes', async () => {
  setup()
  let response = await routes.POST(new Request('https://example.test/api/cms/sfi', { method: 'POST', headers: { origin: 'https://evil.test' }, body: '{}' }), { params: Promise.resolve({ slug: 'home' }) })
  assert.equal(response.status, 403)
  response = await routes.POST(new Request('https://example.test/api/cms/sfi', { method: 'POST', headers: { origin: 'https://example.test' }, body: '{}' }), { params: Promise.resolve({ slug: 'home' }) })
  assert.equal(response.status, 400)
  assert.equal(fixture.writes.length, 0)
})

for(const role of ['admin','super_admin'])test(`${role} may edit the homepage with legacy programme assignments`,async()=>{setup({role,grants:[{programme:'family'}]});assert.equal((await server.pageContext('home', 'publish')).permissions.publish,true)})

test('a Content Manager with legacy programme grants still needs and can use a page assignment',async()=>{setup({role:'content_manager',grants:[{programme:'family'}],assignment:{can_view:true,can_edit:true,can_publish:false}});await server.pageContext('home', 'edit');await assert.rejects(server.pageContext('home', 'publish'),failStatus(403));setup({role:'content_manager',grants:[{programme:'family'}]});await assert.rejects(server.pageContext('home', 'view'),failStatus(403))})

test('draft-only custom pages stay unavailable to public readers', async () => {
  setup({ noPage: true }); assert.equal(await server.getPublishedPageContent('page-private-test'), null)
  await server.changePageContent('page-private-test', 'save', sample(), head())
  fixture.page.slug = 'page-private-test'
  assert.equal(await server.getPublishedPageContent('page-private-test'), null)
})
test('restoring an earlier revision creates a private snapshot and preserves live content', async () => {
  setup(); const before = head()
  await server.restorePageRevision('home', uuid(2), before)
  assert.equal(fixture.page.published_revision_id, before.publishedId)
  assert.notEqual(fixture.page.draft_revision_id, before.draftId)
  assert.equal(fixture.revisions.length, 3)
  assert.equal((await server.getPageEditorState('home')).content.title, 'Published title')
})
test('restoring another page revision is refused without writes', async () => {
  setup(); fixture.revisions[0].page_id = uuid(777)
  await assert.rejects(server.restorePageRevision('home', uuid(2), head()), failStatus(404))
  assert.equal(fixture.writes.length, 0)
})
test('page schemas reject unsafe links, duplicate IDs, invalid images and blank content', () => {
  for (const change of [c => c.title = '  ', c => c.sections[0].data.primary.href = 'javascript:alert(1)', c => c.sections[0].data.slides[0].image = '//evil.test/x', c => c.sections[1].id = c.sections[0].id, c => c.sections.forEach(s => s.hidden = true)]) {
    const content = sample(); change(content); assert.equal(model.pageContentSchema.safeParse(content).success, false)
  }
  for (const slug of ['sfi','../home','page-','page-ABC','page-a/b']) assert.equal(model.cmsSlugSchema.safeParse(slug).success, false)
})
test('every reusable section template is valid', () => {
  for (const [type, data] of Object.entries(model.blockTemplates)) assert.equal(model.sectionSchema.safeParse({ id: type, type, hidden: false, data }).success, true, type)
})
const nativeModules = {
  '@/lib/cms/copy-node':{applyPageCopy:node=>node,registerCopyComponent:()=>{}},
  '@/components/cms/page-copy-provider':{usePageCopy:()=>({})},
  './site-settings-provider':{SiteSettingsProvider:({children})=>children},
  './content-sections':{ManagedProjects:()=>null,ManagedEvents:()=>null},
  'next/link': { __esModule: true, default: ({children, ...props}) => React.createElement('a', props, children) },
  'next/image': { __esModule: true, default: ({src, alt}) => React.createElement('img', {src, alt}) },
  '@/components/ui/button': { Button: ({children}) => React.createElement('span', null, children) },
  '@/components/open-registration-notices': { OpenRegistrationNotices: () => React.createElement('aside', null, 'Live registration notices') },
  '@number-flow/react': { __esModule: true, default: ({value, suffix}) => React.createElement('span', null, `${value}${suffix}`) },
  '@/lib/blog': { blogPosts: [{slug:'test',pillar:'Develop',description:'Example article',readTime:'2 min'}] },
}
for(const [file, name, type] of [
  ['hero-option-a','HeroOptionA','homeHero'],['pillars-section','PillarsSection','pillars'],['platform-section','PlatformSection','platform'],['projects-section','ProjectsSection','impact'],['media-section','MediaSection','social'],
]) test(`${name} retains default text, images and links when fed the homepage CMS defaults`,()=>{
  const Component=load(`components/${file}.tsx`,nativeModules)[name]
  const render=content=>renderToStaticMarkup(React.createElement(Component,{content}))
  const original=render(undefined), configured=render(sample().sections.find(s=>s.type===type).data)
  assert.equal(configured.replace(/\s+/g,' '),original.replace(/\s+/g,' '))
})
test('renderer respects section order and hidden sections while keeping shared navigation and footer',()=>{
  const mappings=[['hero-option-a','HeroOptionA'],['pillars-section','PillarsSection'],['platform-section','PlatformSection'],['projects-section','ProjectsSection'],['media-section','MediaSection'],['faq-section','FAQSection']]
  const modules={...nativeModules,'@/components/navbar':{Navbar:()=>React.createElement('nav',null,'NAV')},'@/components/footer-section':{FooterSection:()=>React.createElement('footer',null,'FOOTER')},'@/components/scroll-animations':{ScrollAnimations:()=>null}}
  for(const [file,name] of mappings)modules[`@/components/${file}`]={[name]:()=>React.createElement('div',null,name)}
  const Renderer=load('components/cms/page-renderer.tsx',modules).CmsPageRenderer
  const content=sample();content.sections.reverse();content.sections.find(s=>s.type==='pillars').hidden=true
  const html=renderToStaticMarkup(React.createElement(Renderer,{content}))
  assert.ok(html.indexOf('NAV')<html.indexOf('FAQSection'))
  assert.ok(html.indexOf('FAQSection')<html.indexOf('HeroOptionA'))
  assert.ok(html.indexOf('HeroOptionA')<html.indexOf('FOOTER'))
  assert.ok(!html.includes('PillarsSection'))
})
test('valid save and publish requests return updated editor state and revalidate only on publish',async()=>{
  setup()
  const request=(action,content)=>new Request('https://example.test/api/cms/pages/home',{method:'POST',headers:{origin:'https://example.test'},body:JSON.stringify({action,content,expected:head()})})
  const params={params:Promise.resolve({slug:'home'})}
  let response=await routes.POST(request('save',sample()),params)
  assert.equal(response.status,200);assert.equal(fixture.revalidated.length,0)
  response=await routes.POST(request('publish',sample()),params)
  assert.equal(response.status,200);assert.deepEqual(fixture.revalidated,['/'])
})
test('discarding a draft preserves immutable history and published content',async()=>{
  setup();const before=head()
  await server.changePageVisibility('home','discard',before)
  assert.equal(fixture.page.draft_revision_id,null)
  assert.equal(fixture.page.published_revision_id,before.publishedId)
  assert.equal(fixture.revisions.length,2)
  assert.equal((await server.getPublishedPageContent('home')).title,'Published title')
})
test('unpublishing a custom page retains its draft and makes the public page unavailable',async()=>{
  setup();fixture.page.slug='page-test';const before=head()
  await server.changePageVisibility('page-test','unpublish',before)
  assert.equal(fixture.page.draft_revision_id,before.draftId)
  assert.equal(fixture.page.published_revision_id,null)
  assert.equal(await server.getPublishedPageContent('page-test'),null)
})
test('homepage cannot be unpublished and view-only users cannot discard drafts',async()=>{
  setup();await assert.rejects(server.changePageVisibility('home','unpublish',head()),failStatus(400))
  setup({role:'content_manager',assignment:{can_view:true,can_edit:false,can_publish:false}})
  await assert.rejects(server.changePageVisibility('home','discard',head()),failStatus(403))
  assert.equal(fixture.writes.length,0)
})

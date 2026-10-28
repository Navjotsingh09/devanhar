import test from 'node:test'
import assert from 'node:assert/strict'
import {loadTypeScript as load} from './helpers/load-typescript.mjs'
const metadata=load('lib/blog-metadata.ts')
test('article metadata rejects unsafe destinations and fills older revision defaults',()=>{
 assert.equal(metadata.parseArticleMetadata(undefined).noIndex,false)
 for(const value of [{socialImage:'javascript:alert(1)'},{relatedLinks:[{label:'Read',href:'//evil.test'}]},{relatedLinks:[{label:'Read',href:'https://evil.test'}]}])assert.equal(metadata.articleMetadataSchema.safeParse(value).success,false)
 assert.equal(metadata.articleMetadataSchema.parse({relatedLinks:[{label:'Programme',href:'/projects/example'}]}).relatedLinks.length,1)
})
test('article metadata is written only after schema support is verified, including clearing previous values',()=>{
 const model=load('lib/blog-draft-content.ts'),input=model.blogInputSchema.parse({slug:'example',title:'Example',pillar:'Develop',date:'2026-10-27',status:'draft',expectedDraft:null,expectedUpdated:null,requestMetadata:true})
 assert.equal(model.hasArticleMetadata(input),true);assert.equal('cms_metadata' in model.blogRevisionBody(input,false),false);assert.equal(model.blogRevisionBody(input,true).cms_metadata.seoTitle,'')
})
test('article API refuses unsupported metadata before saving or publishing',async()=>{
 let writes=0;const route=load('app/api/blog/route.ts',{'next/server':{NextResponse:{json:(v,i)=>Response.json(v,i)}},'next/cache':{revalidatePath:()=>{}},'@/lib/blog-staff-server':{getBlogStaff:async()=>({user:{id:'staff'},allowed:true,client:{from:()=>({select(){return this},limit:async()=>({error:{code:'42703'}})}),rpc:()=>{writes++}}})}})
 const response=await route.POST(new Request('https://example.test/api/blog',{method:'POST',headers:{origin:'https://example.test'},body:JSON.stringify({slug:'example',title:'Example',pillar:'Develop',date:'2026-10-27',status:'draft',expectedDraft:null,expectedUpdated:null,metadata:{seoTitle:'New SEO'}})}));assert.equal(response.status,503);assert.equal(writes,0)
})
function draftFixture(role='content_manager',programmes=[]){const queries=[];const client={rpc:async()=>({data:[],error:null}),from(table){const q={table,ranges:[]};queries.push(q);const rows=table==='cms_pages'?[{id:'page',slug:'home',draft_revision_id:'page-draft',updated_at:'2026-10-27T09:00:00Z'}]:table==='cms_page_revisions'?[{id:'page-draft',title:'Private homepage draft'}]:table==='cms_entries'?[{id:'event',kind:'event',slug:'example-event',draft_revision_id:'entry-draft',published_revision_id:'live',updated_at:'2026-10-27T10:00:00Z'}]:table==='cms_entry_revisions'?[{id:'entry-draft',title:'Private event draft'}]:table==='blog_posts'?[{id:'article',slug:'example-article',title:'Public title',draft_revision_id:'article-draft',status:'published',updated_at:'2026-10-27T11:00:00Z'}]:table==='blog_post_revisions'?[{id:'article-draft',title:'Private article draft'}]:[];return{select(){return this},not(){return this},is(){return this},eq(){return this},order(){return this},in(){return this},range(a,b){q.ranges.push([a,b]);return this},then(resolve,reject){return Promise.resolve({data:rows,error:null,count:30}).then(resolve,reject)}}}};const server=load('lib/cms/drafts-server.ts',{'@/lib/crm/request-staff':{getRequestStaff:async()=>({client,user:{id:'staff'},authError:null,profile:{data:{role},error:null},grants:{data:programmes,error:null}})}});return{server,queries}}
test('assigned Content Managers only query CMS drafts and every list is bounded',async()=>{
 const f=draftFixture(),state=await f.server.loadDraftWorkspace('all',2);assert.equal(state.items.length,2);assert.equal(state.items[0].title,'Private event draft');assert.equal(state.hasNext,false);assert.ok(!f.queries.some(q=>q.table.startsWith('blog')));for(const q of f.queries.filter(q=>q.ranges.length))assert.deepEqual(q.ranges,[[25,49]])
})
test('administrator drafts include saved article titles and the correct preview route',async()=>{
 const f=draftFixture('super_admin'),state=await f.server.loadDraftWorkspace('all',1);assert.equal(state.items[0].title,'Private article draft');assert.equal(state.items[0].preview,'/cms-preview/insights/example-article');assert.equal(state.items[0].live,true)
})
test('programme staff do not fetch general CMS or blog drafts',async()=>{
 const f=draftFixture('staff',[{programme:'roots'}]),state=await f.server.loadDraftWorkspace('all',1);assert.equal(state.items.length,0);assert.equal(f.queries.length,0)
})

test('published article listings retain installed featured and SEO metadata',async()=>{
 const row={id:'post',slug:'example',title:'Example',excerpt:'Summary',pillar:'Develop',status:'published',created_at:'2026-10-27T12:00:00Z',updated_at:'2026-10-27T12:00:00Z',cms_metadata:{featured:true,seoTitle:'Search title'}}
 const db=load('lib/blog-db.ts',{'next/cache':{unstable_cache:fn=>fn},'./cms/service':{cmsService:()=>({from:()=>{let value;return{select(columns){value={...row};if(!columns.includes('cms_metadata'))delete value.cms_metadata;return this},eq(){return this},is(){return this},order(){return this},then(resolve,reject){return Promise.resolve({data:[value],error:null}).then(resolve,reject)}}}})}})
 const posts=await db.getPublishedBlogPosts();assert.equal(posts[0].metadata.featured,true);assert.equal(posts[0].metadata.seoTitle,'Search title')
})

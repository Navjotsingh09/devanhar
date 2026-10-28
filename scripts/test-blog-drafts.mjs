import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require=createRequire(import.meta.url)
function load(path,modules={}) {
 const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
 const module={exports:{}}
 vm.runInNewContext(js,{module,exports:module.exports,URL,Date,console,require:name=>name in modules?modules[name]:require(name)})
 return module.exports
}
const sfi=load('lib/cms/sfi-content.ts',{'./sfi-default.json':JSON.parse(fs.readFileSync('lib/cms/sfi-default.json','utf8'))})
const metadata=load('lib/blog-metadata.ts',{'./cms/sfi-content':sfi})
const model=load('lib/blog-draft-content.ts',{'./cms/sfi-content':sfi,'./blog-metadata':metadata})
const input=()=>({slug:'sample-article',title:'A new draft',description:'Summary',content:'Private text',pillar:'Develop',status:'draft',date:'2026-10-22',expectedDraft:null,expectedUpdated:null})
let writes=[],revalidated=[],rpcError=null
const routes=load('app/api/blog/route.ts',{
 'next/server':{NextResponse:{json:(body,init)=>Response.json(body,init)}},
 'next/cache':{revalidatePath:path=>revalidated.push(path),revalidateTag:()=>{}},
 '@/lib/blog-staff-server':{getBlogStaff:async()=>({user:{id:'actor'},allowed:true,client:{rpc:async(name,args)=>{writes.push({name,args});return{data:'id',error:rpcError}}}})},
 '@/lib/blog-draft-content':model,
})
const request=body=>new Request('https://example.test/api/blog',{method:'POST',headers:{origin:'https://example.test'},body:JSON.stringify(body)})
function reset(){writes=[];revalidated=[];rpcError=null}
test('article validation rejects blank names, unsafe images and invalid dates',()=>{
 for(const change of [v=>v.title='  ',v=>v.slug='../article',v=>v.coverImage='javascript:alert(1)',v=>v.date='2026-02-31',v=>v.date='2026-99-99']){const v=input();change(v);assert.equal(model.blogInputSchema.safeParse(v).success,false)}
})
test('draft save uses the transactional draft RPC and never invalidates public routes',async()=>{
 reset();const response=await routes.POST(request(input()));assert.equal(response.status,200)
 assert.equal(writes[0].name,'blog_write_revision');assert.equal(writes[0].args.p_publish,false)
 assert.deepEqual(revalidated,['/dashboard/blog']);assert.equal(writes[0].args.p_body.content,'Private text')
})
test('publish invalidates homepage and article paths after successful RPC',async()=>{
 reset();const response=await routes.POST(request({...input(),status:'published'}));assert.equal(response.status,200)
 assert.equal(writes[0].args.p_publish,true);assert.deepEqual(revalidated,['/dashboard/blog','/','/insights','/insights/sample-article'])
})
test('stale revisions return 409 without public invalidation',async()=>{
 reset();rpcError={code:'40001',message:'Someone changed this article.'};const response=await routes.POST(request(input()))
 assert.equal(response.status,409);assert.equal(revalidated.length,0)
})
test('cross-origin writes, URL changes and invalid payloads fail before RPC',async()=>{
 reset();const r=new Request('https://example.test/api/blog',{method:'POST',headers:{origin:'https://evil.test'},body:JSON.stringify(input())})
 assert.equal((await routes.POST(r)).status,403)
 assert.equal((await routes.POST(request({...input(),originalSlug:'other-article'}))).status,400)
 assert.equal((await routes.POST(request({...input(),date:'bad-date'}))).status,400)
 assert.equal(writes.length,0)
})
test('public readers never query private revisions or replace the live title with draft text',async()=>{
 const tables=[]
 const row={id:'id',slug:'sample-article',title:'Live title',excerpt:'Live excerpt',content:'Live body',pillar:'Develop',status:'published',created_at:'2026-10-22T12:00:00Z',updated_at:'2026-10-22T12:00:00Z',draft_revision_id:'private-id'}
 const db=load('lib/blog-db.ts',{'./blog-staff-server':{},'./blog-metadata':metadata,'next/cache':{unstable_cache:fn=>fn},'@/lib/supabase/server':{createClient:()=>{throw Error('Private client used for public read')}},'./cms/service':{cmsService:()=>({from:table=>{tables.push(table);return {select(){return this},eq(){return this},is(){return this},order(){return this},maybeSingle:async()=>({data:row,error:null}),then(resolve,reject){return Promise.resolve({data:[row],error:null}).then(resolve,reject)}}}})}})
 assert.equal((await db.getPublishedBlogPostBySlug('sample-article')).title,'Live title')
 assert.equal((await db.getPublishedBlogPosts())[0].title,'Live title')
 assert.deepEqual(tables,['blog_posts','blog_posts'])
})
test('cover removal and article archive do not delete shared media',()=>{
 for(const file of ['app/api/blog/cover/route.ts','app/api/blog/[slug]/route.ts'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/\.storage|\.delete\(/)
 assert.doesNotMatch(fs.readFileSync('components/dashboard/blog-manager.tsx','utf8'),/legacy-cleanup|window\.location\.reload/)
})

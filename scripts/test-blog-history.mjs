import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
let user={id:'actor'},allowed=true,writes=[],invalidated=[],rpcError=null
const module={exports:{}}
const source=ts.transpileModule(fs.readFileSync('app/api/blog/[slug]/history/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
const modules={
 'next/server':{NextResponse:{json:(body,init)=>Response.json(body,init)}},
 'next/cache':{revalidatePath:path=>invalidated.push(path)},
 '@/lib/blog-staff-server':{getBlogStaff:async()=>({user,allowed,client:{rpc:async(name,args)=>{writes.push({name,args});return{error:rpcError}}}})},
}
vm.runInNewContext(source,{module,exports:module.exports,URL,require:name=>name in modules?modules[name]:require(name)})
const route=module.exports
const input=()=>({revisionId:'10000000-0000-4000-8000-000000000001',expectedDraft:null,expectedUpdated:'2026-10-23T09:00:00Z'})
const request=(body=input(),origin='https://site.test')=>new Request('https://site.test/api/blog/article/history',{method:'POST',headers:{origin},body:JSON.stringify(body)})
const params={params:Promise.resolve({slug:'article'})}
function reset(){user={id:'actor'};allowed=true;writes=[];invalidated=[];rpcError=null}
test('article restoration uses the revision RPC and invalidates only private editor routes',async()=>{
 reset();const response=await route.POST(request(),params)
 assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private, no-store/)
 assert.equal(writes[0].name,'blog_restore_revision');assert.equal(writes[0].args.p_revision,input().revisionId)
 assert.deepEqual(invalidated,['/dashboard/blog','/dashboard/blog/article/edit'])
})
test('unauthenticated and unauthorized restoration is refused before database access',async()=>{
 reset();user=null;assert.equal((await route.POST(request(),params)).status,401)
 user={id:'actor'};allowed=false;assert.equal((await route.POST(request(),params)).status,403)
 assert.equal(writes.length,0)
})
test('cross-origin, malformed revision, forged article body and stale inputs are refused',async()=>{
 reset();assert.equal((await route.POST(request(input(),'https://other.test'),params)).status,403)
 for(const body of [{...input(),revisionId:'bad'},{...input(),content:'forged body'},{...input(),expectedUpdated:null}])assert.equal((await route.POST(request(body),params)).status,400)
 assert.equal(writes.length,0)
})
test('database stale and permission refusal do not invalidate any routes',async()=>{
 for(const [code,status] of [['40001',409],['42501',403],['22023',400],['08000',503]]){
  reset();rpcError={code};assert.equal((await route.POST(request(),params)).status,status);assert.deepEqual(invalidated,[])
 }
})

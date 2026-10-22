import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const policy={exports:{}};vm.runInNewContext(compile('lib/staff-programme-access.ts'),{module:policy,exports:policy.exports})
function setup({role='staff',programmes=[],failure,authError,profileMissing=false,user=true}={}) {
 const calls=[]
 const client={auth:{async getUser(){calls.push('getUser');return {data:{user:user?{id:'verified',email:'staff@devanhaar.com',app_metadata:{role:'super_admin'}}:null},error:authError?{}:null}}},from(table){calls.push(table);return {select(){return {eq(){return table==='admin_profiles'?{maybeSingle:async()=>({data:profileMissing?null:{role},error:failure==='profile'?{}:null})}:Promise.resolve({data:programmes.map(programme=>({programme})),error:failure==='grants'?{}:null})}}}}}}
 const response=(status=200,body)=>({status,body,headers:new Headers(),cookies:{set(){},getAll:()=>[]}})
 const next={NextResponse:{next:()=>response(),json:(body,options)=>response(options.status,body),redirect:url=>response(307,String(url))}}
 const module={exports:{}}
 vm.runInNewContext(compile('lib/supabase/middleware.ts'),{module,exports:module.exports,Headers,URL,Promise,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://fixture.invalid',NEXT_PUBLIC_SUPABASE_ANON_KEY:'fixture'}},require:name=>name==='@/lib/staff-programme-access'?policy.exports:name==='@supabase/ssr'?{createServerClient:()=>client}:next})
 return {calls,run:async(path,method='GET')=>{const url=new URL('https://site.invalid'+path);url.clone=()=>new URL(url);return module.exports.updateSession({headers:new Headers(),cookies:{getAll:()=>[],set(){}},nextUrl:url,method})}}
}
test('public pages do not make auth or permission requests',async()=>{const s=setup();assert.equal((await s.run('/about')).status,200);assert.deepEqual(s.calls,[])})
for(const role of ['admin','super_admin']) for(const programmes of [[],['family']]) test(`${role} opens all programmes with ${programmes}`,async()=>{for(const path of ['/dashboard/kaurs','/dashboard/vidyala','/dashboard/newsletter','/dashboard/roots']){const s=setup({role,programmes});assert.equal((await s.run(path)).status,200);assert.equal(s.calls[0],'getUser')}})
test('staff metadata cannot override fresh database role',async()=>{const s=setup({role:'staff',programmes:['family']});assert.equal((await s.run('/dashboard/roots','POST')).status,403);assert.equal((await s.run('/dashboard/roots')).body,'https://site.invalid/dashboard/family-initiative')})
for(const failure of ['profile','grants'])test(`lookup ${failure} failure denies private route`,async()=>{const s=setup({failure});assert.equal((await s.run('/api/cms/sfi','POST')).status,503)})
test('auth failure does not query profiles even with a returned user object',async()=>{const s=setup({authError:true});assert.equal((await s.run('/dashboard')).status,307);assert.deepEqual(s.calls,['getUser'])})
test('vacancies role comes from database instead of token metadata',async()=>{const s=setup({role:'vacancies_only'});assert.equal((await s.run('/dashboard/users')).body,'https://site.invalid/dashboard/vacancies');assert.equal((await s.run('/dashboard/users','POST')).status,403)})
test('Content Manager cannot load operational data or call operational APIs',async()=>{const s=setup({role:'content_manager'});assert.equal((await s.run('/dashboard/submissions')).body,'https://site.invalid/dashboard/website');assert.equal((await s.run('/api/wolfrun/admin','POST')).status,403);assert.equal((await s.run('/api/cms/sfi','POST')).status,200)})

test('legacy operational grants do not block explicitly assigned Content Manager APIs or enable CRM access',async()=>{const s=setup({role:'content_manager',programmes:['family']});assert.equal((await s.run('/api/cms/sfi','POST')).status,200);assert.equal((await s.run('/dashboard/website/sfi')).status,200);assert.equal((await s.run('/api/admin/reconcile-stripe','POST')).status,403);assert.equal((await s.run('/dashboard/submissions')).body,'https://site.invalid/dashboard/website')})

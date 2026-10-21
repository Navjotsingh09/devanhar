import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
function load(path, modules) {
  const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const module={exports:{}}
  vm.runInNewContext(js,{module,exports:module.exports,console,require:name=>name in modules?modules[name]:require(name)})
  return module.exports
}
const user={id:'fixture'}
const context=(changes={})=>({client:{},user,authError:null,profile:{data:{role:'staff'},error:null},grants:{data:[],error:null},...changes})
const redirect=path=>{throw new Error('redirect:'+path)}
function guards(value){ const getRequestStaff=async()=>value
 return { general:load('lib/staff-programme-server.ts',{'server-only':{},'@/lib/supabase/server':{},'@/lib/crm/request-staff':{getRequestStaff},'next/navigation':{redirect}}).requireGeneralStaff,
 padel:load('lib/padel-admin.ts',{'@/lib/supabase/server':{},'@/lib/crm/request-staff':{getRequestStaff},'next/navigation':{redirect}}).requirePadelStaff }
}
for(const role of ['staff','admin','super_admin']) test(`shared context preserves general/Padel access for ${role}`,async()=>{
 const value=context({profile:{data:{role},error:null}});const g=guards(value);assert.equal(await g.general(),value.client);assert.equal(await g.padel(),value.client)
})
for(const [name,changes] of Object.entries({signedOut:{user:null},authFailure:{authError:{}},noProfile:{profile:{data:null,error:null}},profileFailure:{profile:{data:{role:'staff'},error:{}}},cmsOnly:{profile:{data:{role:'content_manager'},error:null}},vacanciesOnly:{profile:{data:{role:'vacancies_only'},error:null}},scoped:{grants:{data:[{programme:'family'}],error:null}},grantFailure:{grants:{data:[],error:{}}},missingGrants:{grants:{data:null,error:null}}})) test(`general guard refuses ${name}`,async()=>{await assert.rejects(guards(context(changes)).general())})
for(const [name,grants] of Object.entries({scoped:{data:[{programme:'family'}],error:null},failure:{data:[],error:{}},missing:{data:null,error:null}})) test(`Padel guard refuses ${name} before membership lookup`,async()=>{let queried=false;const client={from(){queried=true;throw new Error('unexpected membership query')}};await assert.rejects(guards(context({client,grants})).padel(),/redirect:/);assert.equal(queried,false)})
test('verified context starts profile and programme reads concurrently',async()=>{
 const events=[];let release;const barrier=new Promise(resolve=>{release=resolve})
 const client={auth:{getUser:async()=>{events.push('auth');return{data:{user},error:null}}},from(table){events.push(table);if(events.length===3)release();return{select:()=>({eq:()=>table==='admin_profiles'?{single:async()=>{await barrier;return{data:{role:'staff'},error:null}}}:barrier.then(()=>({data:[],error:null}))})}}}
 const {getRequestStaff}=load('lib/crm/request-staff.ts',{'server-only':{},react:{cache:fn=>fn},'@/lib/supabase/server':{createClient:async()=>client}})
 const result=await getRequestStaff();assert.equal(result.user,user);assert.equal(events[0],'auth');assert.deepEqual(events.slice(1).sort(),['admin_profiles','staff_programme_access'])
})
for(const fail of [false,true]) test(`unverified user performs no account reads (${fail?'auth error':'signed out'})`,async()=>{
 const client={auth:{getUser:async()=>({data:{user:fail?user:null},error:fail?{}:null})},from(){throw new Error('must not query account before verified user')}}
 const {getRequestStaff}=load('lib/crm/request-staff.ts',{'server-only':{},react:{cache:fn=>fn},'@/lib/supabase/server':{createClient:async()=>client}})
 assert.equal((await getRequestStaff()).user,null)
})
test('actions outside RSC render read fresh access on each invocation',async()=>{
 let role='staff';let reads=0
 const client={auth:{getUser:async()=>({data:{user},error:null})},from(table){reads++;return{select:()=>({eq:()=>table==='admin_profiles'?{single:async()=>({data:{role},error:null})}:Promise.resolve({data:[],error:null})})}}}
 // React cache does not memoize calls outside a Server Component render.
 const request=load('lib/crm/request-staff.ts',{'server-only':{},react:{cache:fn=>fn},'@/lib/supabase/server':{createClient:async()=>client}})
 const gate=load('lib/staff-programme-server.ts',{'server-only':{},'@/lib/supabase/server':{},'@/lib/crm/request-staff':request,'next/navigation':{redirect}}).requireGeneralStaff
 await gate();role='content_manager';await assert.rejects(gate());assert.equal(reads,4)
})

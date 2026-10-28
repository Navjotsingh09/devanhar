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
 return { general:load('lib/staff-programme-server.ts',{'server-only':{},'@/lib/supabase/server':{},'@/lib/crm/request-staff':{getRequestStaff},'next/navigation':{redirect}}).requireGeneralStaff }
}
for(const role of ['staff','admin','super_admin']) test(`shared context preserves general CRM access for ${role}`,async()=>{
 const value=context({profile:{data:{role},error:null}});const g=guards(value);assert.equal(await g.general(),value.client)
})
for(const [name,changes] of Object.entries({signedOut:{user:null},authFailure:{authError:{}},noProfile:{profile:{data:null,error:null}},profileFailure:{profile:{data:{role:'staff'},error:{}}},cmsOnly:{profile:{data:{role:'content_manager'},error:null}},vacanciesOnly:{profile:{data:{role:'vacancies_only'},error:null}},scoped:{grants:{data:[{programme:'family'}],error:null}},grantFailure:{grants:{data:[],error:{}}},missingGrants:{grants:{data:null,error:null}}})) test(`general guard refuses ${name}`,async()=>{await assert.rejects(guards(context(changes)).general())})
function spaFixture({signedIn=true,authError=null,membership={user_id:'fixture',role:'super_admin'},membershipError=null}={}){
 const reads=[],filters=[];let active=true,created=0
 const client={auth:{getUser:async()=>({data:{user:signedIn?user:null},error:authError})},from(table){reads.push(table);return{select(){return this},eq(key,value){filters.push([key,value]);return this},maybeSingle:async()=>({data:active?membership:null,error:membershipError})}}}
 const gate=load('lib/padel-admin.ts',{'@/lib/supabase/server':{createClient:async()=>{created++;return client}},'next/navigation':{redirect}})
 return{gate,client,reads,filters,revoke:()=>{active=false},created:()=>created}
}
for(const opts of [{signedIn:false},{authError:{message:'expired'}},{membership:null},{membershipError:{message:'unavailable'}}])test(`SPA membership gate fails closed: ${JSON.stringify(opts)}`,async()=>{
 const f=spaFixture(opts);assert.equal(await f.gate.checkPadelStaffAccess(),null);await assert.rejects(f.gate.requirePadelStaff(),/redirect:\/spa-admin\/login/)
 if(opts.signedIn===false||opts.authError)assert.equal(f.reads.length,0)
})
test('active SPA access uses the signed-in client and checks active super-admin membership',async()=>{
 const f=spaFixture();assert.equal(await f.gate.checkPadelStaffAccess(f.client),f.client);assert.equal(f.created(),0);assert.deepEqual(f.reads,['spa_members']);assert.deepEqual(f.filters,[['user_id','fixture'],['is_active',true],['role','super_admin']])
})
test('SPA membership revocation applies on the next protected request',async()=>{
 const f=spaFixture();assert.equal(await f.gate.requirePadelStaff(),f.client);f.revoke();await assert.rejects(f.gate.requirePadelStaff(),/redirect:/)
})
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

for(const role of ['staff','admin','super_admin'])test(`general CRM ${role} profile does not grant SPA access without membership`,async()=>{
 const f=spaFixture({membership:null});f.client.auth.getUser=async()=>({data:{user:{...user,user_metadata:{role},app_metadata:{}}},error:null});assert.equal(await f.gate.checkPadelStaffAccess(),null);assert.deepEqual(f.reads,['spa_members'])
})

function rootsGuard(value){return load('lib/staff-programme-server.ts',{'server-only':{},'@/lib/supabase/server':{},'@/lib/crm/request-staff':{getRequestStaff:async()=>value},'next/navigation':{redirect}}).requireRootsStaff}
for(const role of ['staff','admin','super_admin'])test(`Roots gate accepts ${role} with Roots scope`,async()=>{const value=context({profile:{data:{role},error:null},grants:{data:[{programme:'roots'}],error:null}});assert.equal(await rootsGuard(value)(),value.client)})
for(const [name,changes]of Object.entries({otherProgramme:{grants:{data:[{programme:'family'}],error:null}},cms:{profile:{data:{role:'content_manager'},error:null},grants:{data:[{programme:'roots'}],error:null}},signedOut:{user:null},failedAuth:{authError:{}},failedProfile:{profile:{data:null,error:{}}},failedGrants:{grants:{data:null,error:{}}}}))test(`Roots gate refuses ${name}`,async()=>{await assert.rejects(rootsGuard(context(changes))())})
test('Roots scope cannot use the general CRM gate',async()=>{await assert.rejects(guards(context({grants:{data:[{programme:'roots'}],error:null}})).general())})

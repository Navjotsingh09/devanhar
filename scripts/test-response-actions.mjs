import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
function load(path,modules={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:n=>n in modules?modules[n]:require(n)});return module.exports}
const actions=load('lib/roots-forms/response-actions.ts')
for(const [action,state,next] of [['archive','active','archived'],['delete','active','deleted'],['delete','archived','deleted'],['restore','archived','active'],['restore','deleted','active']])test(`${action} ${state} becomes ${next}`,()=>assert.equal(actions.responseTransition(action,state),next))
for(const [action,state] of [['archive','deleted'],['archive','archived'],['restore','active'],['delete','deleted'],['purge','active'],['delete','unknown']])test(`reject invalid transition ${action}/${state}`,()=>assert.throws(()=>actions.responseTransition(action,state)))
const formId='11111111-1111-4111-8111-111111111111',responseId='22222222-2222-4222-8222-222222222222',userId='staff-fixture'
function harness({denied=false,origin=true,changed=false,authError=false}={}){const writes=[],filters=[];const client={auth:{getUser:async()=>({data:{user:authError?null:{id:userId}},error:authError?{}:null})},from(table){assert.equal(table,'roots_form_submissions');const chain={update(patch){writes.push(patch);return chain},eq(k,v){filters.push([k,v]);return chain},select(){return chain},maybeSingle:async()=>({data:changed?null:{id:responseId,record_state:writes[0].record_state},error:null})};return chain}};const route=load('app/api/roots-forms/[id]/responses/[responseId]/route.ts',{'next/server':{NextResponse:Response},'@/lib/staff-programme-server':{requireRootsStaff:async()=>{if(denied)throw new Error('not allowed');return client}},'@/lib/roots-forms/server':{sameOrigin:()=>origin,readJson:r=>r.json()},'@/lib/roots-forms/response-actions':actions});return {post:route.PATCH,writes,filters}}
const request=body=>new Request('https://example.org/api/roots-forms/'+formId+'/responses/'+responseId,{method:'PATCH',body:JSON.stringify(body)})
const params={params:Promise.resolve({id:formId,responseId})}
test('successful update is scoped to both IDs and expected state; no answers or payments are changed',async()=>{const h=harness(),result=await h.post(request({action:'archive',expectedState:'active',answers:{forged:true},payment_state:'paid'}),params);assert.equal(result.status,200);assert.deepEqual(h.filters,[['form_id',formId],['id',responseId],['record_state','active']]);assert.deepEqual(Object.keys(h.writes[0]).sort(),['record_state','state_changed_at','state_changed_by']);assert.equal(h.writes[0].state_changed_by,userId)})
for(const option of [{denied:true},{origin:false},{authError:true}])test('unauthorised action creates no update: '+JSON.stringify(option),async()=>{const h=harness(option),result=await h.post(request({action:'delete',expectedState:'active'}),params);assert.ok([401,403].includes(result.status));assert.equal(h.writes.length,0)})
test('stale page returns a conflict without reporting success',async()=>{const h=harness({changed:true}),result=await h.post(request({action:'archive',expectedState:'active'}),params);assert.equal(result.status,409)})
test('invalid IDs and invalid actions cause no updates',async()=>{for(const [body,p] of [[{action:'purge',expectedState:'active'},params],[{action:'delete',expectedState:'active'},{params:Promise.resolve({id:'bad',responseId})}]]){const h=harness(),result=await h.post(request(body),p);assert.ok([400,404].includes(result.status));assert.equal(h.writes.length,0)}})
test('payment label explains the no-payment state',()=>assert.equal(actions.paymentLabel('not_required'),'No payment required'))

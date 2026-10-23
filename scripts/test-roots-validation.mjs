import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require=createRequire(import.meta.url)
function load(path,modules={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,console,URL,Buffer,process,require:n=>n in modules?modules[n]:n==='stripe'?{default:class{constructor(){throw new Error('Validation failures must not start Stripe checkout')}}}:require(n)});return module.exports}
const schema=load('lib/roots-forms/schema.ts')
const {rootsCampTemplate}=load('lib/roots-forms/template.ts',{'./schema':schema})
const slug='roots-residential-camp-registration'
const camp=schema.campDefinition(rootsCampTemplate(),slug)
const now=new Date('2026-10-22T12:00:00Z')
const valid={child_name:'Test child',child_dob:'2012-10-22',child_address:'Test address',parent_name:'Test guardian',parent_email:'test@example.org',parent_phone:'07700 900123',emergency_one_name:'First contact',emergency_one_relationship:'Parent',emergency_one_phone:'+44 7700 900123',emergency_two_name:'Second contact',emergency_two_relationship:'Parent',emergency_two_phone:'0044 7700 900123',heard_about:'Website',transport_required:'No',activity_consent:'Yes',camp_rules:true,guardian_confirmation:true}
for(const dob of ['2014-10-22','2013-10-23','2009-10-23','2010-10-22'])test(`accept eligible age ${dob}`,()=>assert.equal(schema.validateAnswers(camp,{...valid,child_dob:dob},now).child_dob,dob))
for(const dob of ['2024-01-01','2014-10-23','2009-10-22','2000-01-01','2026-02-30'])test(`refuse invalid age/date ${dob}`,()=>assert.throws(()=>schema.validateAnswers(camp,{...valid,child_dob:dob},now)))
for(const key of ['child_name','child_address','parent_name','emergency_one_relationship'])test(`trim and reject spaces in ${key}`,()=>assert.throws(()=>schema.validateAnswers(camp,{...valid,[key]:'   '},now),/Complete/))
for(const value of ['abc','123','+1 202 555 0123','077009001234','07700abc123'])for(const key of ['parent_phone','emergency_one_phone','emergency_two_phone'])test(`reject ${key}: ${value}`,()=>assert.throws(()=>schema.validateAnswers(camp,{...valid,[key]:value},now),/UK phone/))
for(const value of ['07700900123','0121 496 0123','+44 (7700) 900-123','0044 7700 900123'])test(`accept UK number ${value}`,()=>assert.equal(schema.validateAnswers(camp,{...valid,parent_phone:value},now).parent_phone,value))
test('reject incomplete email domain',()=>assert.throws(()=>schema.validateAnswers(camp,{...valid,parent_email:'test@x'},now),/email/))
test('normalise saved text and reject blank repeated names',()=>{assert.equal(schema.validateAnswers(camp,{...valid,child_name:' Test child '},now).child_name,'Test child');assert.throws(()=>schema.validateAnswers(camp,{...valid,room_companions:[{child_name:'  ',parent_name:'Test'}]},now),/Complete/)})
test('apply age policy to already published forms without changing other forms',()=>{const saved={...camp,fields:camp.fields.map(f=>{const {minAge,maxAge,...old}=f;return old})};assert.equal(schema.campDefinition(saved,slug).fields.find(f=>f.id==='child_dob').minAge,12);assert.equal(schema.campDefinition(saved,'other-form'),saved)})
test('Roots applications request payment after acceptance, not through upfront Stripe checkout',()=>{const saved={...camp,payment:{enabled:true,amountPence:7500,currency:'gbp'}};assert.equal(schema.campDefinition(saved,slug).payment.enabled,false);assert.equal(schema.campDefinition(saved,'other-form').payment.amountPence,7500)})
test('age bounds handle leap days',()=>{const f=camp.fields.find(f=>f.id==='child_dob');const bounds=schema.dateBounds(f,new Date('2028-02-29T12:00:00Z'));assert.equal(bounds.min,'2011-03-01');assert.equal(bounds.max,'2016-02-29')})
function endpoint(){let writes=0;const client={from(){return{select(){return this},eq(){return this},maybeSingle:async()=>({data:{id:'fixture',published_schema:camp,published_version:1,accepting:true}})}},rpc(){writes++;throw new Error('Unexpected write')}};const route=load('app/forms/[slug]/submit/route.ts',{'next/server':{NextResponse:Response},'@/lib/roots-forms/schema':schema,'@/lib/roots-forms/server':{formsAdmin:()=>client,sameOrigin:()=>true,readJson:r=>r.json(),paymentReady:()=>false}});return {post:route.POST,writes:()=>writes}}
for(const change of [{child_dob:'2024-01-01'},{child_name:'   '},{parent_email:'test@x'},{emergency_one_phone:'abc'}])test(`submit API rejects bypass without creating response: ${Object.keys(change)[0]}`,async()=>{const h=endpoint();const result=await h.post(new Request('https://example.org/forms/'+slug+'/submit',{method:'POST',body:JSON.stringify({answers:{...valid,...change},website:'',requestKey:'11111111-1111-4111-8111-111111111111'})}),{params:Promise.resolve({slug})});assert.equal(result.status,400);assert.equal(h.writes(),0);assert.ok((await result.json()).error)})

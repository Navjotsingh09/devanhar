import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require=createRequire(import.meta.url)
const input={pageId:'00000000-0000-4000-8000-000000000001',userId:'00000000-0000-4000-8000-000000000002',view:true,edit:true,publish:false}
function setup({role='admin',user=true,authError=false,profileError=false,grantsError=false,rpcError=null}={}){const calls=[];const revalidated=[];const client={rpc:async(name,args)=>{calls.push({name,args});return{error:rpcError}}};const context={client,user:user?{id:'actor'}:null,authError,profile:{data:{role},error:profileError},grants:{data:[],error:grantsError}};const module={exports:{}};const source=ts.transpileModule(fs.readFileSync('app/dashboard/website/assignments/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(source,{module,exports:module.exports,require:n=>n==='@/lib/crm/request-staff'?{getRequestStaff:async()=>context}:n==='next/cache'?{revalidatePath:p=>revalidated.push(p)}:require(n)});return{save:module.exports.saveContentAssignment,calls,revalidated}}
for(const opts of [{role:'staff'},{role:'content_manager'},{role:'vacancies_only'},{user:false},{authError:true},{profileError:true},{grantsError:true}])test(`assignments deny unauthorized context ${JSON.stringify(opts)}`,async()=>{const s=setup(opts);assert.ok((await s.save(input)).error);assert.equal(s.calls.length,0)})
for(const bad of [{...input,userId:'invalid'},{...input,view:false},{...input,edit:false,publish:true},{...input,publish:'true'}])test(`invalid assignment cannot reach database: ${JSON.stringify(bad)}`,async()=>{const s=setup();assert.ok((await s.save(bad)).error);assert.equal(s.calls.length,0)})
for(const role of ['admin','super_admin'])test(`${role} saves only the requested assignment through the guarded RPC`,async()=>{const s=setup({role});assert.equal((await s.save(input)).error,undefined);assert.equal(s.calls.length,1);assert.equal(s.calls[0].name,'cms_set_page_assignment');assert.deepEqual(JSON.parse(JSON.stringify(s.calls[0].args)),{p_page_id:input.pageId,p_user_id:input.userId,p_can_view:true,p_can_edit:true,p_can_publish:false});assert.equal(s.revalidated.length,2)})
test('RPC refusal is shown and does not report successful assignment',async()=>{const s=setup({rpcError:{code:'42501'}});assert.ok((await s.save(input)).error);assert.equal(s.revalidated.length,0)})

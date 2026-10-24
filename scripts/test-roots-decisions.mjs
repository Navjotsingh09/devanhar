import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import {createRequire} from 'node:module'
const require = createRequire(import.meta.url)
function load(path, modules, env = {RESEND_API_KEY:'test-only'}, globals = {}) {
  const module = {exports:{}}
  const compiled = ts.transpileModule(fs.readFileSync(path,'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}, reportDiagnostics:true,
  })
  assert.equal(compiled.diagnostics?.length || 0, 0, path)
  vm.runInNewContext(compiled.outputText, {module,exports:module.exports,URL,console:{error(){}},process:{env},...globals,require:name=>name in modules?modules[name]:require(name)})
  return module.exports
}
function mailer({error=false,throws=false,missingId=false,env}={}) {
  const emails = []
  const helper = load('lib/roots-forms/decision-email.ts', {
    'server-only':{},
    resend:{Resend:class {emails={send:async(message,options)=>{
      emails.push({message,options})
      if(throws)throw new Error('Network failed')
      return {data:missingId?null:{id:'mail-id'},error:error?{message:'Provider rejected'}:null}
    }}}},
  },env)
  return {...helper,emails}
}
const applicant = {reference:'22222222-2222-4222-8222-222222222222',revision:1,to:'guardian@example.org',parentName:'Test guardian',childName:'Test child'}
test('acceptance congratulates, states December dates and £50, and uses the exact supplied checkout',async()=>{
  const h=mailer();await h.sendRootsDecisionEmail({...applicant,decision:'accepted'})
  const {message,options}=h.emails[0]
  assert.match(message.subject,/Congratulations/)
  assert.match(message.html,/19th to 21st December 2026/)
  assert.match(message.text,/£50/)
  assert.ok(message.html.includes(`href="${h.rootsCheckout}"`))
  assert.match(message.text,/Application reference: 22222222/)
  for(const content of [message.text,message.html]){
    assert.match(content,/Would you like to add a Message\?/)
    assert.match(content,/Your Message/)
    assert.match(content,/paste the application reference/)
    assert.match(content,/match your payment to your application/)
  }
  assert.equal(options.idempotencyKey,`roots-decision-${applicant.reference}-1-accepted`)
})
test('decline apologises and never contains a payment request or checkout',async()=>{
  const h=mailer();await h.sendRootsDecisionEmail({...applicant,decision:'declined'})
  const {message}=h.emails[0]
  assert.match(message.text,/sorry.*unable to offer a place/)
  assert.doesNotMatch(message.html+message.text,/nowdonate|£50|Pay .*now|To secure|Your Message|Application reference/)
})
test('paid acceptance congratulates without requesting another payment',async()=>{
  const h=mailer();await h.sendRootsDecisionEmail({...applicant,decision:'accepted',paid:true})
  assert.match(h.emails[0].message.text,/No further payment/)
  assert.doesNotMatch(h.emails[0].message.html,/nowdonate/)
  assert.doesNotMatch(h.emails[0].message.text,/Your Message|Application reference/)
})
test('email HTML escapes applicant-provided content',async()=>{
  const h=mailer();await h.sendRootsDecisionEmail({...applicant,childName:'<img src=x>',parentName:'<script>x</script>',decision:'accepted'})
  assert.doesNotMatch(h.emails[0].message.html,/<script>|<img /)
  assert.match(h.emails[0].message.html,/&lt;img/)
})
for(const option of [{error:true},{throws:true},{missingId:true},{env:{}}])test('email failure is explicit: '+JSON.stringify(option),async()=>{
  const h=mailer(option);await assert.rejects(h.sendRootsDecisionEmail({...applicant,decision:'accepted'}))
})

const formId='11111111-1111-4111-8111-111111111111',responseId=applicant.reference
function endpoint(options={}) {
  const writes=[],emails=[],filters=[]
  const row={id:responseId,answers:{parent_email:applicant.to,parent_name:applicant.parentName,child_name:applicant.childName},record_state:'active',payment_state:'not_required',decision_status:'pending',decision_revision:0,decision_email_state:'not_sent',...options.row}
  const client={from(table) {
    let patch,stage
    const query={
      select(){return query},eq(k,v){filters.push([k,v]);return query},
      update(value){patch=value;writes.push(value);stage=value.decision_email_state;return query},
      async maybeSingle(){
        if(table==='roots_forms')return {data:{slug:options.otherForm?'other-form':'roots-residential-camp-registration'}}
        if(!patch)return {data:row,error:options.readError?{}:null}
        if(stage==='pending')return {data:options.stale?null:{id:responseId},error:options.saveError?{}:null}
        return {data:{id:responseId},error:options.auditError?{}:null}
      },
      then(resolve){return query.maybeSingle().then(resolve)},
    };return query
  }}
  const handler=load('app/api/roots-forms/[id]/responses/[responseId]/decision/route.ts',{
    'next/server':{NextResponse:Response},
    '@/lib/staff-programme-server':{requireRootsStaff:async()=>{if(options.denied)throw new Error('Denied');return {auth:{getUser:async()=>({data:{user:options.authError?null:{id:'staff'}},error:options.authError?{}:null})}}}},
    '@/lib/roots-forms/server':{formsAdmin:()=>client,sameOrigin:()=>!options.wrongOrigin,readJson:request=>request.json()},
    '@/lib/roots-forms/decision-email':{sendRootsDecisionEmail:async(input)=>{emails.push(input);if(options.emailError)throw new Error('Email failed');return 'mail-id'}},
  },options.noKey?{}:undefined).POST
  return {writes,emails,filters,post:(body={decision:'accepted',expectedRevision:0})=>handler(new Request('https://example.org',{method:'POST',body:JSON.stringify(body)}),{params:Promise.resolve({id:formId,responseId})})}
}
for(const decision of ['accepted','declined'])test('saved '+decision+' decision triggers its email with authoritative application data',async()=>{
  const h=endpoint(),response=await h.post({decision,expectedRevision:0,to:'forged@example.org',amount:1})
  assert.equal(response.status,200)
  assert.equal(h.emails[0].decision,decision);assert.equal(h.emails[0].to,applicant.to)
  assert.equal(h.writes[0].decision_revision,1);assert.equal(h.writes[0].decision_by,'staff')
  assert.equal(h.writes[1].decision_email_state,'sent')
  assert.ok(h.filters.some(([k,v])=>k==='form_id'&&v===formId))
  assert.ok(h.filters.some(([k,v])=>k==='id'&&v===responseId))
  for(const patch of h.writes)for(const key of ['answers','payment_state','amount_pence'])assert.ok(!(key in patch))
})
for(const options of [{denied:true},{wrongOrigin:true},{authError:true},{noKey:true},{otherForm:true},{readError:true},{row:{record_state:'deleted'}},{row:{decision_revision:1}},{row:{answers:{}}},{row:{decision_status:'accepted',decision_email_state:'sent'}}])test('refuse unsafe decision without writes or emails: '+JSON.stringify(options),async()=>{
  const h=endpoint(options),response=await h.post()
  assert.ok(response.status>=400);assert.equal(h.writes.length,0);assert.equal(h.emails.length,0)
})
for(const options of [{stale:true},{saveError:true}])test('failed database save never sends email: '+JSON.stringify(options),async()=>{
  const h=endpoint(options);assert.ok((await h.post()).status>=400);assert.equal(h.emails.length,0)
})
test('provider failure preserves saved decision, records failure, and returns explicit error',async()=>{
  const h=endpoint({emailError:true}),response=await h.post()
  assert.equal(response.status,502);assert.equal(h.writes[0].decision_status,'accepted');assert.equal(h.writes[1].decision_email_state,'failed')
  assert.match((await response.json()).error,/Decision saved.*not confirmed/)
})
test('retry uses the same decision revision and provider key',async()=>{
  const h=endpoint({row:{decision_status:'accepted',decision_revision:2,decision_email_state:'failed'}})
  assert.equal((await h.post({decision:'accepted',expectedRevision:2})).status,200);assert.equal(h.emails[0].revision,2)
})
test('pending notification cannot be replaced with opposite decision',async()=>{
  const h=endpoint({row:{decision_status:'accepted',decision_revision:1,decision_email_state:'pending'}})
  assert.equal((await h.post({decision:'declined',expectedRevision:1})).status,409);assert.equal(h.writes.length,0)
})
test('paid applicant cannot be declined',async()=>{
  const h=endpoint({row:{payment_state:'paid'}});assert.equal((await h.post({decision:'declined',expectedRevision:0})).status,409);assert.equal(h.writes.length,0)
})
test('email accepted but database delivery audit failure is not reported as success',async()=>{
  const h=endpoint({auditError:true});assert.equal((await h.post()).status,503);assert.equal(h.emails.length,1)
})
test('invalid decision and revision cannot reach a database write',async()=>{
  for(const body of [null,[],{decision:'other',expectedRevision:0},{decision:'accepted',expectedRevision:-1},{decision:'accepted',expectedRevision:'0'}]){
    const h=endpoint();assert.equal((await h.post(body)).status,400);assert.equal(h.writes.length,0)
  }
})
function legacy(options={}) {
  const writes=[],emails=[]
  const booking={id:responseId,status:'pending',payment_status:'unpaid',parent_email:applicant.to,parent_first_name:'Test',parent_last_name:'guardian',camper_first_name:'Test',camper_last_name:'child',...options.booking}
  const client={from(){let patch,selected;const query={
    select(value){selected=value;return query},eq(){return query},
    update(value){patch=value;writes.push(value);return query},
    single:async()=>({data:selected==='activity_log'?{activity_log:[]}:booking,error:options.readError?{}:null}),
    maybeSingle:async()=>({data:options.stale?null:{id:responseId},error:options.saveError?{}:null}),
    then(resolve){return Promise.resolve({data:{id:responseId},error:options.logError?{}:null}).then(resolve)},
  };return query}}
  const actions=load('app/dashboard/roots/actions.ts',{
    '@supabase/supabase-js':{createClient:()=>{assert.ok(!options.denied);return client}},
    '@/lib/staff-programme-server':{requireRootsStaff:async()=>{if(options.denied)throw new Error('Denied')}},
    'next/cache':{revalidatePath(){}},
    '@/lib/roots-forms/decision-email':{rootsFee:50,rootsCheckout:'https://www.nowdonate.com/checkout/c310lyzo928zs9su12k6',sendRootsDecisionEmail:async(input)=>{emails.push(input);if(options.emailError)throw new Error('Email failed');return 'mail-id'}},
  },options.noKey?{}:undefined)
  return {actions,writes,emails}
}
for(const decision of ['accepted','declined'])test('legacy '+decision+' also triggers the shared notification',async()=>{
  const h=legacy();const result=await(decision==='accepted'?h.actions.confirmRootsBooking(responseId,50):h.actions.declineRootsBooking(responseId))
  assert.equal(result.ok,true);assert.equal(h.emails[0].decision,decision)
  for(const patch of h.writes)assert.ok(!('payment_status' in patch))
  assert.equal(h.writes[0].status,decision==='accepted'?'confirmed':'declined')
})
for(const options of [{noKey:true},{saveError:true},{stale:true},{booking:{payment_status:'paid'}}])test('legacy failures prevent notification: '+JSON.stringify(options),async()=>{
  for(const decision of ['accepted','declined']){
    const h=legacy(options);const result=await(decision==='accepted'?h.actions.confirmRootsBooking(responseId,50):h.actions.declineRootsBooking(responseId))
    assert.equal(result.ok,false);assert.equal(h.emails.length,0)
  }
})
test('legacy provider failure reports status saved but email failed',async()=>{
  const h=legacy({emailError:true}),result=await h.actions.confirmRootsBooking(responseId,50)
  assert.equal(result.ok,false);assert.match(result.error,/Acceptance saved.*email was not sent/);assert.equal(h.writes[0].status,'confirmed')
})
test('legacy permissions are checked before privileged database access',async()=>{
  const h=legacy({denied:true});await assert.rejects(h.actions.confirmRootsBooking(responseId,50),/Denied/);assert.equal(h.writes.length,0)
})
test('legacy price is exactly £50 and no arbitrary amount reaches the email',async()=>{
  for(const amount of [75,0,-50,NaN,Infinity]){
    const h=legacy(),result=await h.actions.confirmRootsBooking(responseId,amount);assert.equal(result.ok,false);assert.equal(h.writes.length,0)
  }
})
test('legacy audit failure after delivery is explicitly surfaced',async()=>{
  const h=legacy({logError:true});await assert.rejects(h.actions.declineRootsBooking(responseId),/activity log could not be saved/);assert.equal(h.emails.length,1)
})
test('public Roots copy is consistent and only the booking sidebar shows its price',()=>{
  const page=fs.readFileSync('app/initiatives/roots-residential/page.tsx','utf8')
  const hero=fs.readFileSync('components/roots/roots-hero.tsx','utf8')
  const shared=fs.readFileSync('components/roots/roots-shared-data.ts','utf8')
  assert.doesNotMatch(page+hero+shared,/£75|pound;75|Current price|13[–-]16|four.day|Four Days|August/)
  assert.doesNotMatch(page.slice(0,page.indexOf('<section id="booking-form"')),/£\d|pound;\d/)
  assert.doesNotMatch(hero+shared,/£\d|pound;\d/)
  assert.match(page,/12–16/);assert.match(page,/>3 days</);assert.match(page,/£50/)
  assert.match(hero,/19–21 December 2026/);assert.match(shared,/three-day/)
})
test('changed Roots TSX components have no syntax errors',()=>{
  for(const path of ['components/roots-forms/application-decision.tsx','components/roots/roots-bookings-table.tsx','components/roots/roots-booking-form.tsx','app/dashboard/roots/forms/[id]/responses/[responseId]/page.tsx','app/initiatives/roots-residential/page.tsx']){
    const result=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022},reportDiagnostics:true})
    assert.equal(result.diagnostics?.length||0,0,path)
  }
})

function formHarness({slug='roots-residential-camp-registration',reply,preview=false,validationError}={}) {
  const slots=[],calls=[],redirects=[]
  let cursor=0,uuid=0,resetCount=0,focusCount=0
  const element=(type,props)=>({type,props:props||{}})
  const hooks={
    Fragment:'Fragment',
    useState(initial){const index=cursor++;if(!(index in slots))slots[index]=initial;return [slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value}]},
    useRef(initial){const index=cursor++;if(!(index in slots))slots[index]={current:initial};return slots[index]},
    useEffect(){},
  }
  const dialogs=Object.fromEntries(['Dialog','DialogClose','DialogContent','DialogDescription','DialogFooter','DialogHeader','DialogTitle'].map(key=>[key,key]))
  const {FormRenderer}=load('components/roots-forms/form-renderer.tsx',{
    react:hooks,'react/jsx-runtime':{jsx:element,jsxs:element,Fragment:'Fragment'},
    'lucide-react':{Plus:'Plus',Trash2:'Trash2',FileText:'FileText',ArrowRight:'ArrowRight'},
    '@/components/ui/dialog':dialogs,
    '@/lib/roots-forms/schema':{visible:()=>true,dateBounds:()=>({}),validateAnswers(){if(validationError)throw new Error(validationError)}},
  },{},{
    crypto:{randomUUID:()=>`request-${++uuid}`},
    window:{location:{assign:url=>redirects.push(url)}},
    fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return reply?await reply():{ok:true,json:async()=>({receivedUrl:`/forms/${slug}/received?ref=fixture`})}},
  })
  const definition={title:'Test form',description:'',payment:{enabled:false,amountPence:0},fields:[{id:'child_name',label:'Child name',type:'text',required:true,help:'',documentUrl:''}]}
  function find(node,type) {
    if(!node||typeof node!=='object')return
    if(node.type===type)return node
    for(const child of [node.props?.children].flat(Infinity)){const match=find(child,type);if(match)return match}
  }
  function render() {
    cursor=0
    const tree=FormRenderer({definition,slug,preview})
    const form=find(tree,'form')
    form.props.ref.current={reset(){resetCount++},querySelector(){return {focus(){focusCount++}}}}
    return {tree,form,dialog:find(tree,'Dialog'),input:find(tree,'input'),content:find(tree,'DialogContent')}
  }
  return {render,calls,redirects,get resetCount(){return resetCount},get focusCount(){return focusCount}}
}
test('Roots success shows popup only after save, clears answers, and stays on the page',async()=>{
  const h=formHarness()
  h.render().input.props.onChange({target:{value:'TEST child'}})
  await h.render().form.props.onSubmit({preventDefault(){}})
  const view=h.render()
  assert.equal(view.dialog.props.open,true);assert.equal(h.redirects.length,0)
  assert.equal(h.calls[0].body.answers.child_name,'TEST child')
  assert.equal(view.input.props.value,'');assert.equal(h.resetCount,1)
  let prevented=false
  view.content.props.onCloseAutoFocus({preventDefault(){prevented=true}})
  assert.equal(prevented,true);assert.equal(h.focusCount,1)
  view.dialog.props.onOpenChange(false)
  assert.equal(h.render().dialog.props.open,false)
  h.render().input.props.onChange({target:{value:'Second TEST child'}})
  await h.render().form.props.onSubmit({preventDefault(){}})
  assert.equal(h.calls.length,2);assert.notEqual(h.calls[0].body.requestKey,h.calls[1].body.requestKey)
})
test('pending submissions and open confirmation cannot submit duplicate requests',async()=>{
  let resolve
  const h=formHarness({reply:()=>new Promise(done=>{resolve=done})})
  const event={preventDefault(){}},first=h.render().form.props.onSubmit(event)
  assert.equal(h.render().dialog.props.open,false)
  await h.render().form.props.onSubmit(event)
  assert.equal(h.calls.length,1)
  resolve({ok:true,json:async()=>({receivedUrl:'/forms/roots-residential-camp-registration/received?ref=fixture'})})
  await first
  await h.render().form.props.onSubmit(event)
  assert.equal(h.calls.length,1)
})
test('failed saves keep answers and retry key, show error, and never open success',async()=>{
  const h=formHarness({reply:async()=>({ok:false,json:async()=>({error:'Submission could not be saved.'})})})
  h.render().input.props.onChange({target:{value:'Preserved TEST child'}})
  await h.render().form.props.onSubmit({preventDefault(){}})
  const view=h.render()
  assert.equal(view.dialog.props.open,false);assert.equal(view.input.props.value,'Preserved TEST child')
  assert.ok(JSON.stringify(view.tree).includes('Submission could not be saved.'));assert.equal(h.resetCount,0)
  await view.form.props.onSubmit({preventDefault(){}})
  assert.equal(h.calls[0].body.requestKey,h.calls[1].body.requestKey)
})
test('invalid answers and previews never show a saved-success popup or send requests',async()=>{
  for(const options of [{validationError:'Complete child name.'},{preview:true}]){
    const h=formHarness(options)
    await h.render().form.props.onSubmit({preventDefault(){}})
    assert.equal(h.render().dialog.props.open,false);assert.equal(h.calls.length,0)
  }
})
test('other forms retain receipt redirects and paid forms retain checkout redirects',async()=>{
  for(const [options,url] of [
    [{slug:'other-form'},'/forms/other-form/received?ref=fixture'],
    [{reply:async()=>({ok:true,json:async()=>({checkoutUrl:'https://checkout.stripe.com/c/pay/fixture'})})},'https://checkout.stripe.com/c/pay/fixture'],
  ]){
    const h=formHarness(options);await h.render().form.props.onSubmit({preventDefault(){}})
    assert.equal(h.redirects[0],url);assert.equal(h.render().dialog.props.open,false)
  }
})
test('malformed success and unsafe checkout URLs show errors without success or navigation',async()=>{
  for(const body of [{},{receivedUrl:'https://example.org/received'},{checkoutUrl:'https://example.org/pay'}]){
    const h=formHarness({reply:async()=>({ok:true,json:async()=>body})})
    await h.render().form.props.onSubmit({preventDefault(){}})
    assert.equal(h.render().dialog.props.open,false);assert.equal(h.redirects.length,0);assert.equal(h.resetCount,0)
  }
})

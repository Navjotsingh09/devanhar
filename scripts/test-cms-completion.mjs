import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {loadTypeScript as load} from './helpers/load-typescript.mjs'
const settings=load('lib/cms/site-settings.ts')
const pages=load('lib/cms/migrated-content.ts')
const models=load('lib/cms/page-content.ts')
const {copyValues}=load('lib/cms/copy-schema.ts')
const Link=({children,...props})=>React.createElement('a',props,children)
const Image=props=>React.createElement('img',props)
const {applyPageCopy,registerCopyComponent}=load('lib/cms/copy-node.tsx',{'next/link':{__esModule:true,default:Link},'next/image':{__esModule:true,default:Image}})
const NextResponse=class extends Response{static json(data,init){return Response.json(data,init)}}
const req=(url,body,origin=new URL(url).origin)=>new Request(url,{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)})

test('navigation defaults preserve the current menus, brand assets and safe destinations',()=>{
 assert.ok(settings.siteSettingsSchema.safeParse(settings.defaultSiteSettings).success)
 assert.equal(settings.defaultSiteSettings.brand.darkLogo,'/logos/main-black-transparent.png')
 assert.equal(settings.defaultSiteSettings.brand.lightLogo,'/logos/main-white-transparent.png')
 assert.equal(settings.defaultSiteSettings.navigation.projects.filter(p=>p.title==='Wrestling Academy').length,1)
 for(const bad of ['javascript:alert(1)','//evil.test','https://user:pass@evil.test/x']){const s=structuredClone(settings.defaultSiteSettings);s.navigation.links[0].href=bad;assert.equal(settings.siteSettingsSchema.safeParse(s).success,false)}
})
test('uploaded media URLs are accepted while arbitrary hosts and scripts are refused',()=>{
 assert.equal(settings.assetSchema.safeParse('https://example.supabase.co/storage/v1/object/public/site-images/library/file.png').success,true)
 for(const bad of ['javascript:alert(1)','//evil.test/x','https://evil.test/logo.png'])assert.equal(settings.assetSchema.safeParse(bad).success,false)
})
for(const[slug,page]of Object.entries(pages.migratedPages))test(`${slug}: editor default validates and points to the existing public route`,()=>{
 const content=pages.migratedDefault(slug)
 assert.ok(models.pageContentSchema.safeParse(content).success)
 assert.equal(models.pagePath(slug),page.path)
 assert.equal(pages.validMigratedContent(slug,content),true)
 if(content.sections[0].type==='pageCopy'){
  assert.equal(Object.keys(copyValues(content.sections[0].data.fields)).length,0)
  if(content.sections[0].data.fields.length){const changed=structuredClone(content);changed.sections[0].data.fields[0].source='Different source';assert.equal(pages.validMigratedContent(slug,changed),false)}
 }
})
test('empty copy returns the exact same React tree',()=>{const tree=React.createElement('div',{className:'page'},'Original');assert.equal(applyPageCopy(tree,{}),tree)})
test('copy changes preserve classes, styles, form values, event handlers, keys and escaping',()=>{
 const click=()=>{},tree=React.createElement('main',{className:'Original',style:{color:'red'}},React.createElement('h1',{key:'heading'},'Original'),React.createElement('input',{value:'Original',name:'Original',onChange:click}),React.createElement('button',{onClick:click},'Submit'))
 const changed=applyPageCopy(tree,{Original:'<script>bad</script>',Submit:'Send'})
 assert.equal(changed.props.className,'Original');assert.equal(changed.props.style,tree.props.style)
 assert.equal(changed.props.children[0].key,'heading');assert.equal(changed.props.children[1].props.value,'Original');assert.equal(changed.props.children[1].props.onChange,click);assert.equal(changed.props.children[2].props.onClick,click)
 const html=renderToStaticMarkup(changed);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'))
})
test('nested data props are applied by their owning component, avoiding chained text replacement',()=>{
 function Card({title,cmsCopy={}}){return applyPageCopy(React.createElement('h2',null,title),cmsCopy)}
 registerCopyComponent(Card)
 const copy={Original:'Second',Second:'Third'},tree=applyPageCopy(React.createElement(Card,{title:'Original'}),copy)
 assert.equal(tree.props.title,'Original');assert.equal(renderToStaticMarkup(tree),'<h2>Second</h2>')
})
test('approved links and image sources update without altering other props',()=>{
 const tree=React.createElement('div',null,React.createElement(Link,{href:'/old'},'Read'),React.createElement(Image,{src:'/old.jpg',alt:'Old description'})),html=renderToStaticMarkup(applyPageCopy(tree,{'/old':'/new','/old.jpg':'/new.jpg','Old description':'New description'}))
 assert.ok(html.includes('href="/new"'));assert.ok(html.includes('src="/new.jpg"'));assert.ok(html.includes('alt="New description"'))
})
test('page-copy schemas reject malicious edited destinations and allow original legacy links',()=>{
 const schema=load('lib/cms/copy-schema.ts').pageCopySchema
 assert.ok(schema.safeParse({fields:[{key:'0000000000000000',kind:'link',source:'mailto:contact@devanhaar.com',value:'mailto:contact@devanhaar.com'}]}).success)
 for(const value of ['javascript:alert(1)','//evil.test/x'])assert.equal(schema.safeParse({fields:[{key:'0000000000000000',kind:'link',source:'/contact',value}]}).success,false)
})
test('media inputs validate types, size, metadata and folder paths',()=>{
 const {mediaStart}=load('lib/cms/media.ts'),sample={mime:'application/pdf',size:100,label:'Camp rules',alt_text:'',category:'roots'}
 assert.equal(mediaStart.safeParse(sample).success,true)
 for(const change of [{mime:'image/svg+xml'},{size:50*1024*1024+1},{category:'../private'},{label:'   '}])assert.equal(mediaStart.safeParse({...sample,...change}).success,false)
})
test('media operations require the same origin before any privileged client is created',async()=>{
 let calls=0;const route=load('app/api/cms/media/route.ts',{'next/server':{NextResponse},'@/lib/cms/media-server':{mediaContext:()=>{calls++;throw new Error('Should not run')}}})
 const response=await route.POST(req('https://example.test/api/cms/media',{action:'start'},'https://evil.test'));assert.equal(response.status,403);assert.equal(calls,0)
})
test('media reads fail closed without an authorized CMS session',async()=>{
 const EntryError=load('lib/cms/entries/server.ts',{'@/lib/crm/request-staff':{getRequestStaff:()=>null},'next/cache':{unstable_cache:fn=>fn}}).EntryError
 const route=load('app/api/cms/media/route.ts',{'next/server':{NextResponse},'@/lib/cms/entries/server':{EntryError},'@/lib/cms/media-server':{mediaContext:()=>{throw new EntryError('Forbidden',403)}}})
 assert.equal((await route.GET(new Request('https://example.test/api/cms/media'))).status,403)
})
test('newsletter validates normalized email and explicit consent',()=>{
 const schema=load('lib/newsletter.ts').subscribeSchema
 assert.deepEqual(JSON.parse(JSON.stringify(schema.parse({email:'  Parent@Example.COM ',consent:true,website:''}))),{email:'parent@example.com',consent:true,website:''})
 for(const value of [{email:'test@x',consent:true},{email:'a@example.com',consent:false},{email:'a@example.com',consent:true,website:'spam'}])assert.equal(schema.safeParse(value).success,false)
})
test('subscription success requires a successful durable write',async()=>{
 let saved;const route=load('app/api/newsletter/route.ts',{'next/server':{NextResponse},'@/lib/cms/service':{cmsService:()=>({from:table=>({upsert:async value=>{saved={table,value};return{error:null}}})})}})
 const response=await route.POST(req('https://example.test/api/newsletter',{email:' Parent@Example.COM ',consent:true}));assert.equal(response.status,200);assert.equal(saved.table,'newsletter_subscriptions');assert.equal(saved.value.email,'parent@example.com');assert.equal(saved.value.status,'active')
 const failed=load('app/api/newsletter/route.ts',{'next/server':{NextResponse},'@/lib/cms/service':{cmsService:()=>({from:()=>({upsert:async()=>({error:new Error('DB down')})})})}})
 assert.equal((await failed.POST(req('https://example.test/api/newsletter',{email:'a@example.com',consent:true}))).status,503)
})
test('subscription rejects cross-origin requests without writing',async()=>{
 let calls=0;const route=load('app/api/newsletter/route.ts',{'next/server':{NextResponse},'@/lib/cms/service':{cmsService:()=>{calls++}}})
 assert.equal((await route.POST(req('https://example.test/api/newsletter',{email:'a@example.com',consent:true},'https://evil.test'))).status,403);assert.equal(calls,0)
})
test('unsubscribe tokens bind the exact subscriber and resist tampering',()=>{
 const old=process.env.NEWSLETTER_TOKEN_SECRET;process.env.NEWSLETTER_TOKEN_SECRET='test-only-unsubscribe-key'
 try{const token=load('lib/newsletter-unsubscribe.ts'),id='00000000-0000-4000-8000-000000000001',signed=token.unsubscribeToken(id,'parent@example.com');assert.equal(token.verifyUnsubscribeToken(signed).id,id);assert.equal(token.verifyUnsubscribeToken(signed+'x'),null);assert.equal(token.verifyUnsubscribeToken('x.'+signed.split('.')[1]),null);assert.equal(token.verifyUnsubscribeToken('x'.repeat(1001)),null)}finally{if(old===undefined)delete process.env.NEWSLETTER_TOKEN_SECRET;else process.env.NEWSLETTER_TOKEN_SECRET=old}
})
test('unsubscribe never changes data for an invalid token',async()=>{
 let writes=0;const route=load('app/api/newsletter/unsubscribe/route.ts',{'next/server':{NextResponse},'@/lib/newsletter-unsubscribe':{verifyUnsubscribeToken:()=>null},'@/lib/cms/service':{cmsService:()=>{writes++}}})
 assert.equal((await route.POST(req('https://example.test/api/newsletter/unsubscribe',{token:'invalid'}))).status,400);assert.equal(writes,0)
})
test('legacy image removal cannot delete shared storage or image records',async()=>{
 const route=load('app/api/images/route.ts',{'next/server':{NextResponse},'@/lib/supabase/server':{createClient:()=>{throw new Error('No destructive call allowed')}}})
 assert.equal((await route.DELETE()).status,409)
})
test('public copy reads stay cached and do not inspect cookies or request headers',()=>{
 const source=fs.readFileSync('lib/cms/copy-server.ts','utf8');assert.ok(source.includes('unstable_cache'));assert.ok(!source.includes('next/headers'));assert.ok(!source.includes('getPageEditorState'))
})
test('contact enquiries persist even when the client does not request optional storage',async()=>{
 const old={url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY,resend:process.env.RESEND_API_KEY};process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-key';delete process.env.RESEND_API_KEY
 let record
 try{const route=load('app/api/contact/route.ts',{'next/server':{NextResponse},'@/lib/booking-device':{detectBookingDevice:()=> 'test'},'@supabase/supabase-js':{createClient:()=>({from:()=>({insert:async rows=>{record=rows[0];return{error:null}}})})}})
 const response=await route.POST(req('https://example.test/api/contact',{name:'Test enquiry',email:'test@example.com',message:'Stored safely',save_submission:false})),body=await response.json();assert.equal(response.status,200);assert.equal(record.message,'Stored safely');assert.equal(body.success,true);assert.equal(body.notificationSent,false)
 }finally{for(const[env,val]of [['NEXT_PUBLIC_SUPABASE_URL',old.url],['SUPABASE_SERVICE_ROLE_KEY',old.key],['RESEND_API_KEY',old.resend]])if(val===undefined)delete process.env[env];else process.env[env]=val}
})
test('contact failures do not claim a submission was stored',async()=>{
 const old={url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY};process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-key'
 try{const route=load('app/api/contact/route.ts',{'next/server':{NextResponse},'@/lib/booking-device':{detectBookingDevice:()=> 'test'},'@supabase/supabase-js':{createClient:()=>({from:()=>({insert:async()=>({error:new Error('Storage unavailable')})})})}})
 const response=await route.POST(req('https://example.test/api/contact',{name:'Test enquiry',email:'test@example.com',message:'Must not disappear'}));assert.equal(response.status,500);assert.ok((await response.json()).error)
 }finally{for(const[env,val]of [['NEXT_PUBLIC_SUPABASE_URL',old.url],['SUPABASE_SERVICE_ROLE_KEY',old.key]])if(val===undefined)delete process.env[env];else process.env[env]=val}
})

test('legacy branding revisions receive safe defaults and invalid theme values are refused',()=>{
 const old=structuredClone(settings.defaultSiteSettings);delete old.brand.design;delete old.brand.favicon;delete old.defaultSeo
 const parsed=settings.siteSettingsSchema.parse(old);assert.equal(parsed.brand.design.font,'System');assert.equal(parsed.brand.favicon,'/favicon.ico')
 for(const change of [{primary:'url(evil)'},{borderRadius:200},{font:'Injected'}]){const value=structuredClone(settings.defaultSiteSettings);Object.assign(value.brand.design,change);assert.equal(settings.siteSettingsSchema.safeParse(value).success,false)}
})
test('page visibility and social metadata default safely for older saved revisions',()=>{
 const old=structuredClone(models.defaultHomeContent);delete old.visibility;delete old.seo.socialTitle;delete old.seo.socialDescription;delete old.seo.socialImage
 const parsed=models.pageContentSchema.parse(old);assert.equal(parsed.visibility,'public');assert.equal(parsed.seo.socialImage,'')
})
test('media reusable URLs retain the asset identity across file versions',()=>{
 const media=load('lib/cms/media.ts'),base={id:'00000000-0000-4000-8000-000000000001',section:'library',storage_path:'library/u/old.jpg',url:'https://example.supabase.co/old.jpg'}
 assert.ok(media.mediaReuseUrl(base).includes(`/media/file/${base.id}/`));assert.ok(media.mediaReuseUrl({...base,storage_path:'library/u/new.jpg'}).includes(`/media/file/${base.id}/`));assert.equal(media.mediaReuseUrl({...base,section:'hero'}),base.url)
})
function subscriberFixture(denied=false){let writes=0,updates;const client={auth:{getUser:async()=>({data:{user:{id:'staff'}},error:null})}};const db={from:()=>({update(value){writes++;updates=value;return{eq(){return this},select(){return this},maybeSingle:async()=>({data:{id:'contact'},error:null})}},insert:async()=>({error:null})})};const route=load('app/api/cms/subscribers/route.ts',{'next/server':{NextResponse},'@/lib/staff-programme-server':{requireProgramme:async()=>{if(denied)throw Error('denied');return client}},'@/lib/cms/service':{cmsService:()=>db}});return{route,count:()=>writes,updates:()=>updates}}
test('subscriber consent withdrawal uses a guarded server write and removes consent',async()=>{
 const f=subscriberFixture(),request=req('https://example.test/api/cms/subscribers',{id:'00000000-0000-4000-8000-000000000001',status:'unsubscribed',expectedStatus:'active'}),result=await f.route.PATCH(request);assert.equal(result.status,200);assert.equal(f.count(),1);assert.equal(f.updates().consent,false)
})
test('subscriber operators cannot restore consent and denied accounts cannot write',async()=>{
 const body={id:'00000000-0000-4000-8000-000000000001',status:'active',expectedStatus:'unsubscribed'},allowed=subscriberFixture(),denied=subscriberFixture(true)
 assert.equal((await allowed.route.PATCH(req('https://example.test/api/cms/subscribers',body))).status,409);assert.equal(allowed.count(),0)
 assert.equal((await denied.route.PATCH(req('https://example.test/api/cms/subscribers',{...body,status:'unsubscribed'}))).status,403);assert.equal(denied.count(),0)
})
test('enquiry edits reject stale saves and invalid assignment input',async()=>{
 const workflow=load('lib/crm/enquiry-workflow.ts'),id='00000000-0000-4000-8000-000000000001',body={id,status:'in_progress',assignedTo:null,notes:' Work ',expectedUpdated:'2026-10-23T10:00:00Z'}
 assert.equal(workflow.enquiryWorkflowSchema.parse(body).notes,'Work');assert.equal(workflow.enquiryWorkflowSchema.safeParse({...body,assignedTo:'anything'}).success,false)
 const route=load('app/dashboard/submissions/workflow-actions.ts',{'next/cache':{revalidatePath:()=>{}},'@/lib/crm/submission-access':{requireSubmissionAccess:async()=>({user:{id},supabase:{from:()=>({update(){return this},eq(){return this},select(){return this},maybeSingle:async()=>({data:null,error:null})})}})}})
 assert.match((await route.saveEnquiryWorkflow(body)).error,/changed/)
})

test('media replacement preserves history, rejects stale updates and derives restored URLs from storage',async()=>{
 const id='00000000-0000-4000-8000-000000000001',user='00000000-0000-4000-8000-000000000002',path=`library/${user}/00000000-0000-4000-8000-000000000003.jpg`,stamp='2026-10-23T10:00:00Z',asset={id,url:'https://example.supabase.co/old.jpg',storage_path:path,section:'library',uploaded_by:user,updated_at:stamp,media_versions:[{url:'https://evil.test/file.jpg',storage_path:path}]};let updated,invalidations=0
 const db={from:table=>{if(table==='activity_log')return{insert:async()=>({error:null})};let writing=false;return{select(){return this},eq(){return this},update(value){writing=true;updated=value;return this},maybeSingle:async()=>({data:writing?{id}:asset,error:null})}},storage:{from:()=>({list:async()=>({data:[{name:path.split('/').pop(),metadata:{mimetype:'image/jpeg',size:100}}],error:null}),getPublicUrl:p=>({data:{publicUrl:'https://example.supabase.co/storage/'+p}})})}}
 const route=load('app/api/cms/media/route.ts',{'next/server':{NextResponse},'next/cache':{revalidateTag:()=>invalidations++,unstable_cache:fn=>fn},'@/lib/cms/media-server':{mediaContext:async()=>({db,user:{id:user},isAdmin:true}),mediaReferences:async()=>[]}})
 assert.equal((await route.POST(req('https://example.test/api/cms/media',{action:'replace',id,path,expectedUpdated:'2026-10-22T10:00:00Z'}))).status,409);assert.equal(updated,undefined)
 assert.equal((await route.POST(req('https://example.test/api/cms/media',{action:'replace',id,path,expectedUpdated:stamp}))).status,200);assert.equal(updated.media_versions[0].url,asset.url);assert.equal(invalidations,1)
 assert.equal((await route.POST(req('https://example.test/api/cms/media',{action:'restoreVersion',id,version:0,expectedUpdated:stamp}))).status,200);assert.ok(updated.url.startsWith('https://example.supabase.co/storage/'));assert.ok(!updated.url.includes('evil'))
})

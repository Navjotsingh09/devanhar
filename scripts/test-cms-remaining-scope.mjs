import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {loadTypeScript as load} from './helpers/load-typescript.mjs'
const Link=({children,...props})=>React.createElement('a',props,children),Image=props=>React.createElement('img',props)
const {applyPageCopy}=load('lib/cms/copy-node.tsx',{'next/link':{__esModule:true,default:Link},'next/image':{__esModule:true,default:Image}})
const native=(id,group='0000000000000001',hidden=false,locked=false)=>({id,group,label:id,hidden,locked})
const node=(id,text)=>React.createElement('section',{'data-cms-section':id,key:id},text)
test('native page controls reorder existing siblings and preserve untouched nodes and handlers',()=>{
 const a='1000000000000001',b='1000000000000002',click=()=>{},tree=React.createElement('main',null,node(a,'First'),React.createElement('button',{key:'action',onClick:click},'Action'),node(b,'Second'))
 const changed=applyPageCopy(tree,{__cms:true,replacements:{First:'Edited'},nativeSections:[native(b),native(a)],additions:[]})
 assert.equal(changed.props.children[0].props['data-cms-section'],b);assert.equal(changed.props.children[2].props.children,'Edited');assert.equal(changed.props.children[1].props.onClick,click);assert.equal(changed.props.children[1].key,'action')
})
test('native page controls keep protected forms visible and do not move sections across layout groups',()=>{
 const a='1000000000000001',b='1000000000000002',tree=React.createElement('main',null,node(a,'Form'),node(b,'Other group'))
 const changed=applyPageCopy(tree,{__cms:true,replacements:{},nativeSections:[native(b,'0000000000000002'),native(a,undefined,true,true)],additions:[]})
 assert.equal(changed.props.children[0].props.children,'Form');assert.ok(renderToStaticMarkup(changed).includes('Other group'))
})
test('native hiding removes only the selected editable section',()=>{
 const a='1000000000000001',b='1000000000000002',tree=React.createElement('main',null,node(a,'Hide me'),node(b,'Keep me'))
 const html=renderToStaticMarkup(applyPageCopy(tree,{__cms:true,replacements:{},nativeSections:[native(a,undefined,true),native(b)],additions:[]}));assert.ok(!html.includes('Hide me'));assert.ok(html.includes('Keep me'))
})
test('migrated pages allow reusable additions while rejecting forged native identifiers and locked form changes',()=>{
 const model=load('lib/cms/migrated-content.ts'),blocks=load('lib/cms/page-content.ts'),slug=Object.keys(model.migratedPages).find(s=>model.migratedPages[s].nativeSections?.some(n=>n.locked)),content=model.migratedDefault(slug),options=model.migratedPages[slug].nativeSections
 content.sections[0].data.nativeSections=structuredClone(options);content.sections.push({id:'new-text',type:'text',hidden:false,data:blocks.blockTemplates.text});assert.equal(model.validMigratedContent(slug,content),true)
 const forged=structuredClone(content);forged.sections[0].data.nativeSections[0].id='ffffffffffffffff';assert.equal(model.validMigratedContent(slug,forged),false)
 const hidden=structuredClone(content);hidden.sections[0].data.nativeSections.find(n=>n.locked).hidden=true;assert.equal(model.validMigratedContent(slug,hidden),false)
})
test('new reusable sections render at the native content outlet with the existing footer after them',()=>{
 const provider=load('components/cms/page-copy-provider.tsx'),outlet=load('components/cms/native-page-sections.tsx',{'./page-copy-provider':provider}),html=renderToStaticMarkup(React.createElement(provider.PageCopyProvider,{copy:{},additions:React.createElement('section',null,'Added content')},React.createElement('main',null,'Original'),React.createElement(outlet.NativePageSections),React.createElement('footer',null,'Existing footer')))
 assert.ok(html.indexOf('Original')<html.indexOf('Added content'));assert.ok(html.indexOf('Added content')<html.indexOf('Existing footer'))
})
function staffContext(permission,role='content_manager'){let rpc=0;const client={rpc:async()=>{rpc++;return permission instanceof Error?{error:{code:'PGRST202'},data:null}:{error:null,data:permission}}};const context={client,user:{id:'actor'},authError:null,profile:{data:{role},error:null},grants:{data:[],error:null}};const module=load('lib/blog-staff-server.ts',{'@/lib/crm/request-staff':{getRequestStaff:async()=>context}});return{module,calls:()=>rpc}}
test('article view access does not imply edit, publish, archive or creation access',async()=>{
 const f=staffContext({workspace:true,view:true,edit:false,publish:false,archive:true,create:false});assert.equal((await f.module.getBlogStaff('assigned','view')).allowed,true);for(const action of ['edit','publish','archive','create'])assert.equal((await f.module.getBlogStaff('assigned',action)).allowed,false)
})
test('article delegation fails closed when the migration is missing or the assignment is revoked',async()=>{
 for(const permission of [new Error('missing'),{workspace:false,view:false,edit:false,publish:false,create:false}])assert.equal((await staffContext(permission).module.getBlogStaff('article')).allowed,false)
})
test('verified global article editors retain existing permissions without an assignment RPC',async()=>{
 const f=staffContext(new Error('unused'),'super_admin');assert.equal((await f.module.getBlogStaff('any','archive')).allowed,true);assert.equal(f.calls(),0)
})
test('article metadata validates a typed project relationship and safely reads earlier metadata',()=>{
 const m=load('lib/blog-metadata.ts');assert.equal(m.parseArticleMetadata({seoTitle:'Older metadata'}).projectId,null);assert.equal(m.articleMetadataSchema.safeParse({projectId:'other-project'}).success,false)
 assert.equal(m.articleMetadataSchema.parse({projectId:'00000000-0000-4000-8000-000000000001',subtitle:'Subtitle',category:'Community'}).category,'Community')
})

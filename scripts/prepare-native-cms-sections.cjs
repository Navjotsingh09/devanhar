// One-time annotation of existing content sections; no classes/styles/handlers change.
const fs=require('fs'),ts=require('typescript'),crypto=require('crypto');const manifest=JSON.parse(fs.readFileSync('lib/cms/migrated-pages.json','utf8')),catalog=new Map(),hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,16)
for(const file of new Set(Object.values(manifest).flatMap(p=>p.files).filter(f=>f.endsWith('.tsx')))){
 const text=fs.readFileSync(file,'utf8'),source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[],sections=[],groups=new Map();let ordinal=0
 const attr=(opening,name)=>opening.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.getText(source)===name)?.initializer?.text
 function visit(node){if(ts.isJsxElement(node)&&node.openingElement.tagName.getText(source)==='section'){
  const opening=node.openingElement,number=ordinal++,id=attr(opening,'data-cms-section')||hash(file+':section:'+number);let group=groups.get(node.parent);if(!group){group=hash(file+':group:'+groups.size);groups.set(node.parent,group)}
  const body=node.getText(source),heading=body.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/),label=heading?heading[1].replace(/<[^>]*>/g,' ').replace(/\{[^}]*\}/g,' ').replace(/\s+/g,' ').trim().slice(0,140):file.split('/').pop().replace(/\.tsx$/,'').replaceAll('-',' ')+' · section '+(number+1),locked=/<form\b|<(PublicCampForm|.*BookingForm|.*ApplicationForm|.*Payment)/.test(body)||/booking|registration|application|payment/i.test(attr(opening,'id')||'')
  sections.push({id,group,label:label||'Content section '+(number+1),locked,hidden:false});if(!attr(opening,'data-cms-section')){const position=opening.tagName.end;edits.push({start:position,end:position,value:` data-cms-section="${id}"`})}
 }
 if(ts.isJsxSelfClosingElement(node)&&node.tagName.getText(source)==='FooterSection'&&!text.includes('NativePageSections')){edits.push({start:node.getStart(source),end:node.end,value:`<><NativePageSections />${node.getText(source)}</>`})}
 ts.forEachChild(node,visit)}visit(source)
 if(edits.length){let result=text;for(const edit of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,edit.start)+edit.value+result.slice(edit.end);if(edits.some(e=>e.value.includes('NativePageSections'))){const index=/^\s*['"]use client['"]/.test(result)?result.indexOf('\n')+1:0;result=result.slice(0,index)+"\nimport {NativePageSections} from '@/components/cms/native-page-sections'\n"+result.slice(index)}fs.writeFileSync(file,result)}
 catalog.set(file,sections)
}
for(const page of Object.values(manifest))page.nativeSections=page.files.flatMap(f=>catalog.get(f)||[])
fs.writeFileSync('lib/cms/migrated-pages.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({files:catalog.size,sections:[...catalog.values()].flat().length}))

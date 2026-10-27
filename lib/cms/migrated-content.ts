import pages from './migrated-pages.json'
import {pageContentSchema,newPageContent,type PageContent} from './page-content'
export const migratedPages=pages as Record<string,{title:string;path:string;area:string;file:string;files:string[];seo:{title:string;description:string;noIndex:boolean};nativeSections?:{id:string;group:string;label:string;locked:boolean;hidden:boolean}[];fields:{key:string;kind:'text'|'link'|'asset';source:string;value:string}[]}>
export function isMigratedSlug(slug:string){return Object.hasOwn(migratedPages,slug)}
export function migratedDefault(slug:string):PageContent|null{const page=migratedPages[slug];if(!page)return null;if(!page.fields.length){const content=newPageContent();content.title=page.title;content.seo={...page.seo,socialTitle:'',socialDescription:'',socialImage:''};return content}return pageContentSchema.parse({schemaVersion:1,title:page.title,seo:page.seo,sections:[{id:'page-copy',type:'pageCopy',hidden:false,data:{fields:page.fields}}]})}
export function validMigratedContent(slug:string,content:PageContent){
 const page=migratedPages[slug];if(!page||!page.fields.length)return true
 const section=content.sections[0];if(section.type!=='pageCopy'||section.hidden||section.data.fields.length!==page.fields.length||!section.data.fields.every((field,index)=>['key','kind','source'].every(key=>field[key as 'key']===page.fields[index][key as 'key'])))return false
 if(content.sections.slice(1).some(s=>s.type==='pageCopy'||s.type==='siteSettings'))return false
 const native=section.data.nativeSections??[],original=page.nativeSections??[]
 return !native.length||native.length===original.length&&new Set(native.map(s=>s.id)).size===native.length&&native.every(s=>{const source=original.find(v=>v.id===s.id);return !!source&&['group','label','locked'].every(key=>source[key as 'group']===s[key as 'group'])&&(!s.locked||!s.hidden)})
}

export function normalizeMigratedContent(slug:string,content:PageContent):PageContent{
 const page=migratedPages[slug],section=content.sections[0];if(!page?.fields.length||section?.type!=='pageCopy')return content
 const fields=page.fields.map(field=>{const saved=section.data.fields.find(v=>v.key===field.key&&v.source===field.source&&v.kind===field.kind);return saved??field})
 const native=(section.data.nativeSections??[]).filter(saved=>page.nativeSections?.some(s=>s.id===saved.id&&s.group===saved.group&&s.label===saved.label&&s.locked===saved.locked&&(!s.locked||!saved.hidden)))
 const nativeSections=native.length?[...native,...(page.nativeSections??[]).filter(s=>!native.some(v=>v.id===s.id))]:[]
 return{...content,sections:[{...section,data:{fields,nativeSections}},...content.sections.slice(1)]}
}

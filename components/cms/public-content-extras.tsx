import {programmePaths} from '@/lib/cms/programme-paths'
import {headers} from 'next/headers'
import {getPublishedEntries,type PublishedEntry} from '@/lib/cms/entries/server'
import {SiteNotices} from './site-notices'
import {SiteContentProvider} from './site-content-provider'
export async function PublicContentExtras({children}:{children:React.ReactNode}){
 const path=(await headers()).get('x-pathname')||'/'
 if(['/dashboard','/auth','/api','/cms-preview','/spa-admin'].some(prefix=>path.startsWith(prefix)))return children
 const[announcements,notifications,faqs]=await Promise.all([getPublishedEntries('announcement',undefined,true),getPublishedEntries('notification',undefined,true),getPublishedEntries('faq')])
 const all=[...(announcements??[]),...(notifications??[]),...(faqs??[])]
 const[projects,events]=all.some(e=>e.projectId)?await Promise.all([getPublishedEntries('project'),getPublishedEntries('event')]):[[],[]]
 const targeted=(entry:PublishedEntry)=>{
  const c=entry.content;if(!entry.projectId||!('pages'in c))return c
  const project=projects?.find(p=>p.id===entry.projectId)
  if(!project)return{...c,pages:['/__unavailable_project__']}
  const pages=[`/projects/${project.slug}`,...(project.content.kind==='project'&&project.content.websitePath.startsWith('/')?programmePaths(project.content.websitePath):[]),...(events??[]).filter(e=>e.projectId===project.id).flatMap(e=>[`/events/${e.slug}`,`/events/info/${e.slug}`])]
  const requested=c.pages.length?pages.filter(path=>c.pages.includes(path)):pages
  return{...c,pages:requested.length?requested:['/__unavailable_project__']}
 }
 const items=[...(announcements??[]),...(notifications??[])].map(e=>({id:e.id,revision:e.revisionId,content:targeted(e)}))
 return <SiteContentProvider faqs={(faqs??[]).map(targeted)}>{children}<SiteNotices items={items}/></SiteContentProvider>
}

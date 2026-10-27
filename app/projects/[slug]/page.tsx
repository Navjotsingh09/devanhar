import {getPublishedBlogPosts} from '@/lib/blog-db'
import {cache} from 'react'
import {notFound} from 'next/navigation'
import {getPublishedEntries} from '@/lib/cms/entries/server'
import {EntryDetail} from '@/components/cms/entry-detail'
export const dynamic='force-dynamic'
const projects=cache(()=>getPublishedEntries('project'))
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const entry=(await projects())?.find(p=>p.slug===slug);if(!entry||entry.content.kind!=='project')return{title:'Project not found',robots:{index:false}};const c=entry.content;return{title:c.seo.title||`${c.title} | Devanhaar`,description:c.seo.description||c.description,robots:{index:!c.seo.noIndex,follow:!c.seo.noIndex},openGraph:{title:c.seo.socialTitle||c.title,description:c.seo.socialDescription||c.description,...(c.seo.socialImage?{images:[c.seo.socialImage]}:{})}}}
export default async function Project({params}:{params:Promise<{slug:string}>}){const{slug}=await params,entry=(await projects())?.find(p=>p.slug===slug);if(!entry)notFound();const[events,posts]=await Promise.all([getPublishedEntries('event'),getPublishedBlogPosts()]);return <EntryDetail relatedInsights={posts.filter(p=>p.metadata?.projectId===entry.id).map(p=>({slug:p.slug,title:p.title,description:p.description}))} slug={slug} content={entry.content} relatedEvents={(events??[]).filter(e=>e.projectId===entry.id&&e.content.kind==='event').map(e=>({slug:e.slug,title:e.content.title,date:e.content.kind==='event'?e.content.dateLabel:''}))}/>}

import {cache} from 'react'
import {notFound} from 'next/navigation'
import {getPublishedEntries} from '@/lib/cms/entries/server'
import {EntryDetail} from '@/components/cms/entry-detail'
export const dynamic='force-dynamic'
const events=cache(()=>getPublishedEntries('event'))
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const{slug}=await params,entry=(await events())?.find(e=>e.slug===slug);if(!entry||entry.content.kind!=='event')return{title:'Event not found',robots:{index:false}};const c=entry.content;return{title:c.seo.title||`${c.title} | Devanhaar`,description:c.seo.description||c.description,robots:{index:!c.seo.noIndex,follow:!c.seo.noIndex},openGraph:{title:c.seo.socialTitle||c.title,description:c.seo.socialDescription||c.description,...(c.seo.socialImage?{images:[c.seo.socialImage]}:{})}}}
export default async function Event({params}:{params:Promise<{slug:string}>}){const{slug}=await params,entry=(await events())?.find(e=>e.slug===slug);if(!entry)notFound();return <EntryDetail slug={slug} content={entry.content}/>}

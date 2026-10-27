import 'server-only'
import {unstable_cache} from 'next/cache'
import {notFound} from 'next/navigation'
import {getPublishedPageContent} from './page-server'
import {copyValues,type PageCopy} from './copy-schema'
const read=unstable_cache((slug:string)=>getPublishedPageContent(slug),['cms-public-page-copy-v3'],{revalidate:60,tags:['cms-pages']})
export async function getPublicPageCopy(slug:string):Promise<PageCopy>{const content=await read(slug);if(content?.visibility==='hidden')notFound();const section=content?.sections.find(s=>s.type==='pageCopy');return section?.type==='pageCopy'?copyValues(section.data.fields):{}}

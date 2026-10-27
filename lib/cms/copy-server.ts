import 'server-only'
import {unstable_cache} from 'next/cache'
import {notFound} from 'next/navigation'
import {getPublishedPageContent} from './page-server'
import {pageContentCopy,type PageCopy} from './copy-schema'
const read=unstable_cache((slug:string)=>getPublishedPageContent(slug),['cms-public-page-copy-v3'],{revalidate:60,tags:['cms-pages']})
export async function getPublicPageCopy(slug:string):Promise<PageCopy>{const content=await read(slug);if(content?.visibility==='hidden')notFound();return content?pageContentCopy(content):{}}

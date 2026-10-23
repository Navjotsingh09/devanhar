import 'server-only'
import {unstable_cache} from 'next/cache'
import type {Metadata} from 'next'
import {getPublishedPageContent} from './page-server'
const read=unstable_cache((slug:string)=>getPublishedPageContent(slug),['cms-page-seo-v1'],{revalidate:60,tags:['cms-pages']})
export async function getMigratedPageMetadata(slug:string,fallback:Metadata):Promise<Metadata>{const content=await read(slug);return content?{...fallback,title:content.seo.title,description:content.seo.description,robots:{index:!content.seo.noIndex,follow:!content.seo.noIndex}}:fallback}

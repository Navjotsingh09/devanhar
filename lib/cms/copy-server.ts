import 'server-only'
import {unstable_cache} from 'next/cache'
import {getPublishedPageContent} from './page-server'
import {copyValues,type PageCopy} from './copy-schema'
export const getPublicPageCopy=unstable_cache(async(slug:string):Promise<PageCopy>=>{const content=await getPublishedPageContent(slug),section=content?.sections.find(s=>s.type==='pageCopy');return section?.type==='pageCopy'?copyValues(section.data.fields):{}},['cms-public-page-copy-v2'],{revalidate:60,tags:['cms-pages']})

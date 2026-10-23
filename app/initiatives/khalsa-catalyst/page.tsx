import {notFound} from 'next/navigation'
import {getPublishedPageContent} from '@/lib/cms/page-server'
import {CmsPageRenderer} from '@/components/cms/page-renderer'
import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'
export default async function Page(){const content=await getPublishedPageContent('content-khalsa-catalyst');if(!content||content.visibility==='hidden')notFound();return <CmsPageRenderer content={content}/>}
export async function generateMetadata(){return getMigratedPageMetadata('content-khalsa-catalyst',{title:'Khalsa Catalyst | Devanhaar'})}

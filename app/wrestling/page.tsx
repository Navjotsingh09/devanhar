import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import type {Metadata} from 'next'
import {WrestlingPage} from '@/components/wrestling/wrestling-page'
const originalMetadata:Metadata={
 title:'Devanhaar Wrestling Academy | Freestyle Wrestling & Sikh Heritage',
 description:'A community-led freestyle wrestling academy carrying forward Sikh and Punjabi wrestling heritage through discipline, wellbeing and connection within the sangat.',
 alternates:{canonical:'https://devanhaar.com/wrestling'},
 openGraph:{title:'Devanhaar Wrestling Academy',description:'Strength in our roots. Freestyle wrestling, Sikh heritage and community.',url:'https://devanhaar.com/wrestling',type:'website'},
}
export default async function Page({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}){
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-wrestling')
return withPageCopy((<WrestlingPage/>), cmsCopy)}

export async function generateMetadata(){return getMigratedPageMetadata('content-wrestling',originalMetadata)}

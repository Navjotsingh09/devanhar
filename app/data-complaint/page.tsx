import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'
import Content from './page-content'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import type {PageCopy} from '@/lib/cms/copy-schema'
export default async function Page({cmsCopy}:{cmsCopy?:PageCopy}={}){const copy=cmsCopy??await getPublicPageCopy('content-data-complaint');return withPageCopy(<Content/>,copy)}

export async function generateMetadata(){return getMigratedPageMetadata('content-data-complaint',{"title":"Data complaints | Devanhaar","description":"We could not submit your complaint. Please email contact@devanhaar.com directly."})}

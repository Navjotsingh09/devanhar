import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'
import Content from './page-content'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import type {PageCopy} from '@/lib/cms/copy-schema'
export default async function Page({cmsCopy}:{cmsCopy?:PageCopy}={}){const copy=cmsCopy??await getPublicPageCopy('content-singhs-camp-uk');return withPageCopy(<Content/>,copy)}

export async function generateMetadata(){return getMigratedPageMetadata('content-singhs-camp-uk',{"title":"Singhs Camp UK | Devanhaar","description":"Spaces are limited. Submit your application below and our team will review it and be in touch."})}

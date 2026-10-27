import 'server-only'
import type {Metadata} from 'next'
import {getPublicSiteSettings} from './site-settings-server'
import {defaultSiteSettings} from './site-settings'
export async function globalMetadata():Promise<Metadata>{const page=await getPublicSiteSettings(),section=page?.sections.find(s=>s.type==='siteSettings'),settings=section?.type==='siteSettings'?section.data:defaultSiteSettings,seo=settings.defaultSeo;return{metadataBase:new URL('https://devanhaar.com'),title:seo.title,description:seo.description,icons:{icon:settings.brand.favicon},openGraph:{title:seo.socialTitle||seo.title,description:seo.socialDescription||seo.description,...(seo.socialImage?{images:[seo.socialImage]}:{})}}}

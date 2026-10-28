import 'server-only'
import {unstable_cache} from 'next/cache'
import {getPublishedPageContent} from './page-server'
export const getPublicSiteSettings=unstable_cache(()=>getPublishedPageContent('site-settings'),['cms-site-settings-v1'],{revalidate:60,tags:['cms-pages']})

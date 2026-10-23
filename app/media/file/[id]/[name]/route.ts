import {NextResponse} from 'next/server'
import {unstable_cache} from 'next/cache'
import {cmsService} from '@/lib/cms/service'
import {assetSchema} from '@/lib/cms/site-settings'
const read=unstable_cache(async(id:string)=>{const{data,error}=await cmsService().from('site_images').select('url').eq('id',id).eq('section','library').maybeSingle();return error?null:data?.url},['cms-media-public-v1'],{revalidate:60,tags:['cms-media']})
export async function GET(_request:Request,{params}:{params:Promise<{id:string;name:string}>}){const{id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return new NextResponse('File not found',{status:404});const url=await read(id);if(!url||!url.startsWith('https://')||!assetSchema.safeParse(url).success)return new NextResponse('File not found',{status:404});const response=NextResponse.redirect(url,307);response.headers.set('Cache-Control','no-cache, max-age=0');return response}

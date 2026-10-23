import {NextResponse} from 'next/server'
import {revalidateTag} from 'next/cache'
import {randomUUID} from 'node:crypto'
import {z} from 'zod'
import {EntryError} from '@/lib/cms/entries/server'
import {mediaContext,mediaReferences} from '@/lib/cms/media-server'
import {mediaStart,mediaMetadata,mediaTypes,mediaKind} from '@/lib/cms/media'
const pathSchema=z.string().regex(/^library\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp|gif|mp4|webm|pdf|docx|txt)$/)
const identity={id:z.string().uuid(),expectedUpdated:z.string().datetime()}
const schema=z.discriminatedUnion('action',[
 mediaStart.extend({action:z.literal('start')}),
 mediaMetadata.extend({action:z.literal('finish'),path:pathSchema}),
 mediaMetadata.extend({...identity,action:z.literal('update')}),
 z.object({...identity,action:z.enum(['archive','restore'])}).strict(),
 z.object({...identity,action:z.literal('replace'),path:pathSchema}).strict(),
 z.object({...identity,action:z.literal('restoreVersion'),version:z.number().int().min(0).max(19)}).strict(),
])
function failure(error:unknown){return NextResponse.json({error:error instanceof EntryError?error.message:'Media could not be updated. Please retry.'},{status:error instanceof EntryError?error.status:503})}
type Context=Awaited<ReturnType<typeof mediaContext>>
async function uploadedFile(context:Context,path:string){
 if(!path.startsWith(`library/${context.user!.id}/`))throw new EntryError('This upload belongs to another account.',403)
 const folder=path.slice(0,path.lastIndexOf('/')),name=path.split('/').pop()!
 const{data,error}=await context.db.storage.from('site-images').list(folder,{search:name,limit:2}),file=data?.find(item=>item.name===name)
 if(error||!file)throw new EntryError('The upload is not complete. Please retry.',409)
 if(!Object.keys(mediaTypes).includes(file.metadata?.mimetype)||Number(file.metadata?.size)>50*1024*1024)throw new EntryError('Choose a supported file under 50 MB.',400)
 return context.db.storage.from('site-images').getPublicUrl(path).data.publicUrl
}
export async function GET(request:Request){try{
 const{db,user,isAdmin}=await mediaContext(),params=new URL(request.url).searchParams,page=Math.max(1,Math.min(10000,Number(params.get('page'))||1)),q=(params.get('q')||'').trim().slice(0,100).replace(/[%_]/g,'')
 let query=db.from('site_images').select('id,url,storage_path,section,category,label,alt_text,description,archived_at,updated_at,created_at,uploaded_by,media_versions',{count:'exact'}).order('created_at',{ascending:false}).range((page-1)*30,page*30-1)
 query=params.get('archived')==='true'?query.not('archived_at','is',null):query.is('archived_at',null)
 if(q)query=query.ilike('label',`%${q}%`)
 if(params.get('folder'))query=query.eq('category',params.get('folder')!.slice(0,80))
 const{data,error,count}=await query;if(error)throw new EntryError('The media library could not be loaded.',503)
 const ids=[...new Set((data??[]).map(asset=>asset.uploaded_by).filter(Boolean))],names=isAdmin&&ids.length?await db.from('admin_profiles').select('id,full_name').in('id',ids):{data:[]}
 return NextResponse.json({assets:(data??[]).map(asset=>({...asset,uploaded_by_name:asset.uploaded_by===user!.id?'You':names.data?.find(p=>p.id===asset.uploaded_by)?.full_name||'Staff uploader'})),count:count??0,page},{headers:{'Cache-Control':'private, no-store'}})
}catch(error){return failure(error)}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new EntryError('Use the media library to make this change.',403)
 const context=await mediaContext(),{db,user,isAdmin}=context,raw=await request.text()
 if(raw.length>8000)throw new EntryError('Media details are too long.',413)
 const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)throw new EntryError(parsed.error.issues.map(i=>i.message).join('; '),400)
 const input=parsed.data
 if(input.action==='start'){
  const path=`library/${user!.id}/${randomUUID()}.${mediaTypes[input.mime]}`,result=await db.storage.from('site-images').createSignedUploadUrl(path)
  if(result.error)throw new EntryError('Upload could not start. Please retry.',503)
  return NextResponse.json({path,token:result.data.token})
 }
 if(input.action==='finish'){
  const publicUrl=await uploadedFile(context,input.path)
  const existing=await db.from('site_images').select('id').eq('storage_path',input.path).maybeSingle()
  if(existing.error)throw new EntryError('Upload details could not be checked.',503)
  if(existing.data)return NextResponse.json({id:existing.data.id})
  const{data,error}=await db.from('site_images').insert({section:'library',category:input.category||null,label:input.label,alt_text:input.alt_text,description:input.description,url:publicUrl,storage_path:input.path,uploaded_by:user!.id}).select('id').single()
  if(error)throw new EntryError('File uploaded, but its details could not be saved. Retry to finish.',503)
  await db.from('activity_log').insert({admin_id:user!.id,action:'Uploaded media',entity_type:'site_image',entity_id:data.id})
  return NextResponse.json({id:data.id})
 }
 const{data:asset,error}=await db.from('site_images').select('id,url,storage_path,section,uploaded_by,archived_at,updated_at,media_versions').eq('id',input.id).maybeSingle()
 if(error)throw new EntryError('Media could not be loaded.',503)
 if(!asset)throw new EntryError('Media not found.',404)
 if(!isAdmin&&asset.uploaded_by!==user!.id)throw new EntryError('Only an administrator or the uploader can change this asset.',403)
 if(asset.updated_at!==input.expectedUpdated)throw new EntryError('This asset changed. Reload before continuing.',409)
 if(input.action==='archive'){
  const references=await mediaReferences(db,asset.url,asset.id)
  if(asset.section!=='library'||references.length)throw new EntryError(`This file is in use${references.length?': '+references.join(', '):' as a website image'}. Replace its references before archiving.`,409)
 }
 const history=Array.isArray(asset.media_versions)?asset.media_versions:[]
 let changes:Record<string,unknown>
 if(input.action==='replace'||input.action==='restoreVersion'){
  if(asset.section!=='library')throw new EntryError('Choose shared image slot replacements in a saved page draft.',409)
  let version:{url:string;storage_path:string}
  if(input.action==='replace'){
   version={url:await uploadedFile(context,input.path),storage_path:input.path}
   if(mediaKind(version.url)!==mediaKind(asset.url))throw new EntryError('Replace this file with the same media type so existing references keep working.',400)
  }else{
   const previous=history[input.version]
   if(!previous||typeof previous.url!=='string'||!pathSchema.safeParse(previous.storage_path).success)throw new EntryError('This version is unavailable.',404)
   version={url:db.storage.from('site-images').getPublicUrl(previous.storage_path).data.publicUrl,storage_path:previous.storage_path}
  }
  changes={...version,media_versions:[{url:asset.url,storage_path:asset.storage_path,changed_at:new Date().toISOString(),changed_by:user!.id},...history.filter((_,index)=>input.action!=='restoreVersion'||index!==input.version)].slice(0,20)}
 }else changes=input.action==='update'?{label:input.label,alt_text:input.alt_text,description:input.description,category:input.category||null}:{archived_at:input.action==='archive'?new Date().toISOString():null}
 const update=await db.from('site_images').update({...changes,updated_at:new Date().toISOString()}).eq('id',asset.id).eq('updated_at',input.expectedUpdated).select('id').maybeSingle()
 if(update.error)throw new EntryError('Media could not be updated.',503)
 if(!update.data)throw new EntryError('This asset changed. Reload before continuing.',409)
 revalidateTag('cms-media',{expire:0})
 await db.from('activity_log').insert({admin_id:user!.id,action:`Media ${input.action}`,entity_type:'site_image',entity_id:asset.id})
 return NextResponse.json({success:true})
}catch(error){return error instanceof SyntaxError?NextResponse.json({error:'Invalid request.'},{status:400}):failure(error)}}

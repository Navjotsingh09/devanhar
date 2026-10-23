import {NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {z} from 'zod'
import {EntryError} from '@/lib/cms/entries/server'
import {mediaContext,mediaReferences} from '@/lib/cms/media-server'
import {mediaStart,mediaMetadata,mediaTypes} from '@/lib/cms/media'
const pathSchema=z.string().regex(/^library\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp|gif|mp4|webm|pdf)$/)
const schema=z.discriminatedUnion('action',[
 mediaStart.extend({action:z.literal('start')}),
 mediaMetadata.extend({action:z.literal('finish'),path:pathSchema}),
 mediaMetadata.extend({action:z.literal('update'),id:z.string().uuid(),expectedUpdated:z.string().datetime()}),
 z.object({action:z.enum(['archive','restore']),id:z.string().uuid(),expectedUpdated:z.string().datetime()}).strict(),
])
function failure(e:unknown){return NextResponse.json({error:e instanceof EntryError?e.message:'Media could not be updated. Please retry.'},{status:e instanceof EntryError?e.status:503})}
export async function GET(request:Request){try{const{db}=await mediaContext(),params=new URL(request.url).searchParams,page=Math.max(1,Math.min(10000,Number(params.get('page'))||1)),q=(params.get('q')||'').trim().slice(0,100);let query=db.from('site_images').select('id,url,storage_path,section,category,label,alt_text,archived_at,updated_at,uploaded_by',{count:'exact'}).order('created_at',{ascending:false}).range((page-1)*30,page*30-1);if(params.get('archived')==='true')query=query.not('archived_at','is',null);else query=query.is('archived_at',null);if(q)query=query.ilike('label',`%${q.replace(/[%_]/g,'')}%`);if(params.get('folder'))query=query.eq('category',params.get('folder')!.slice(0,80));const{data,error,count}=await query;if(error)throw new EntryError('The media library could not be loaded.',503);return NextResponse.json({assets:data??[],count:count??0,page},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return failure(e)}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new EntryError('Use the media library to make this change.',403)
 const{db,user,isAdmin}=await mediaContext(),raw=await request.text();if(raw.length>8000)throw new EntryError('Media details are too long.',413);const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)throw new EntryError(parsed.error.issues.map(i=>i.message).join('; '),400);const input=parsed.data
 if(input.action==='start'){const path=`library/${user!.id}/${randomUUID()}.${mediaTypes[input.mime]}`,result=await db.storage.from('site-images').createSignedUploadUrl(path);if(result.error)throw new EntryError('Upload could not start. Please retry.',503);return NextResponse.json({path,token:result.data.token})}
 if(input.action==='finish'){
  if(!input.path.startsWith(`library/${user!.id}/`))throw new EntryError('This upload belongs to another account.',403)
  const folder=input.path.slice(0,input.path.lastIndexOf('/')),name=input.path.split('/').pop()!,{data:objects,error:lookupError}=await db.storage.from('site-images').list(folder,{search:name,limit:2});const object=objects?.find(o=>o.name===name)
  if(lookupError||!object)throw new EntryError('The upload is not complete. Please retry.',409)
  if(!Object.keys(mediaTypes).includes(object.metadata?.mimetype)||Number(object.metadata?.size)>50*1024*1024)throw new EntryError('Choose a supported file under 50 MB.',400)
  const{data:{publicUrl}}=db.storage.from('site-images').getPublicUrl(input.path)
  const{data:existing}=await db.from('site_images').select('id').eq('storage_path',input.path).maybeSingle();if(existing)return NextResponse.json({id:existing.id})
  const{data,error}=await db.from('site_images').insert({section:'library',category:input.category||null,label:input.label,alt_text:input.alt_text,url:publicUrl,storage_path:input.path,uploaded_by:user!.id}).select('id').single();if(error)throw new EntryError('File uploaded, but its details could not be saved. Retry to finish.',503)
  await db.from('activity_log').insert({admin_id:user!.id,action:'Uploaded media',entity_type:'site_image',entity_id:data.id});return NextResponse.json({id:data.id})
 }
 const{data:asset,error:readError}=await db.from('site_images').select('id,url,section,uploaded_by,archived_at,updated_at').eq('id',input.id).maybeSingle();if(readError)throw new EntryError('Media could not be loaded.',503);if(!asset)throw new EntryError('Media not found.',404)
 if(!isAdmin&&asset.uploaded_by!==user!.id)throw new EntryError('Only an administrator or the uploader can change this asset.',403)
 if(asset.updated_at!==input.expectedUpdated)throw new EntryError('This asset changed. Reload before continuing.',409)
 if(input.action==='archive'){const refs=await mediaReferences(db,asset.url);if(asset.section!=='library'||refs.length)throw new EntryError(`This file is in use${refs.length?': '+refs.join(', '):' as a website image'}. Replace its references before archiving.`,409)}
 const changes=input.action==='update'?{label:input.label,alt_text:input.alt_text,category:input.category||null}:{archived_at:input.action==='archive'?new Date().toISOString():null}
 const{data:updated,error}=await db.from('site_images').update({...changes,updated_at:new Date().toISOString()}).eq('id',asset.id).eq('updated_at',input.expectedUpdated).select('id').maybeSingle();if(error)throw new EntryError('Media could not be updated.',503);if(!updated)throw new EntryError('This asset changed. Reload before continuing.',409)
 await db.from('activity_log').insert({admin_id:user!.id,action:`Media ${input.action}`,entity_type:'site_image',entity_id:asset.id});return NextResponse.json({success:true})
 }catch(e){return e instanceof SyntaxError?NextResponse.json({error:'Invalid request.'},{status:400}):failure(e)}}

import 'server-only'
import {createClient as serviceClient} from '@supabase/supabase-js'
import {getRequestStaff} from '@/lib/crm/request-staff'
import {entryTemplate,parseEntry,kindSchema,entrySlugSchema,isEntryVisible,type EntryContent,type EntryKind} from './content'
export class EntryError extends Error{constructor(message:string,public status:number){super(message)}}
function service(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new EntryError('Content management is temporarily unavailable.',503);return serviceClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function entrySession(){const context=await getRequestStaff();if(context.authError||!context.user)throw new EntryError('Please sign in again.',401);if(context.profile.error||context.grants.error||!Array.isArray(context.grants.data)||!['admin','super_admin','content_manager'].includes(context.profile.data?.role||''))throw new EntryError('This account is not assigned to website content management.',403);return{...context,isAdmin:['admin','super_admin'].includes(context.profile.data!.role)}}
export async function getEntryState(kind:EntryKind,slug:string){
 if(!kindSchema.safeParse(kind).success||!entrySlugSchema.safeParse(slug).success)throw new EntryError('Content not found.',404)
 const{client,user,isAdmin}=await entrySession()
 const[record,projectResult,assignmentResult]=await Promise.all([
 client.from('cms_entries').select('id,kind,slug,project_id,draft_revision_id,published_revision_id,archived,updated_at').eq('kind',kind).eq('slug',slug).maybeSingle(),
 client.from('cms_entries').select('id,slug').eq('kind','project').eq('archived',false).order('slug').limit(200),
 isAdmin?Promise.resolve({data:[],error:null}):client.from('cms_entry_assignments').select('entry_id,can_view,can_edit,can_create,can_publish').eq('user_id',user!.id),
 ])
 if(record.error||projectResult.error||assignmentResult.error)throw new EntryError('Content or permissions could not be loaded.',503)
 const entry=record.data,assignments=assignmentResult.data??[],projects=projectResult.data??[]
 let permissions={view:isAdmin,edit:isAdmin,create:isAdmin,publish:isAdmin}
 if(!isAdmin){
  if(entry){const owned=assignments.filter(a=>a.entry_id===entry.id||a.entry_id===entry.project_id);permissions={view:owned.some(a=>a.can_view),edit:owned.some(a=>a.can_view&&a.can_edit),create:owned.some(a=>a.can_view&&a.can_edit&&a.can_create),publish:owned.some(a=>a.can_view&&a.can_edit&&a.can_publish)}}
  else if(['event','faq'].includes(kind)&&projects.some(p=>assignments.some(a=>a.entry_id===p.id&&a.can_view&&a.can_edit&&a.can_create)))permissions={view:true,edit:true,create:true,publish:false}
 }
 if(!permissions.view)throw new EntryError('This content is not assigned to your account.',403)
 let content:EntryContent=entryTemplate(kind)
 const revisionId=entry?.draft_revision_id||entry?.published_revision_id
 if(revisionId){const{data,error}=await client.from('cms_entry_revisions').select('body').eq('entry_id',entry!.id).eq('id',revisionId).single();const parsed=data&&parseEntry(kind,data.body);if(error||!parsed)throw new EntryError('This revision could not be read. Nothing has changed.',503);content=parsed}
 const history=entry?await client.from('cms_entry_revisions').select('id,created_at,created_by').eq('entry_id',entry.id).order('created_at',{ascending:false}).limit(20):{data:[],error:null}
 if(history.error)throw new EntryError('Revision history could not be loaded.',503)
 return{content,entry,permissions,history:history.data??[],projects,isAdmin}
}
export type EntryState=Awaited<ReturnType<typeof getEntryState>>
export async function listEntries(kind:EntryKind){const{client,isAdmin}=await entrySession();const{data,error}=await client.from('cms_entries').select('id,slug,project_id,draft_revision_id,published_revision_id,archived,updated_at').eq('kind',kind).order('updated_at',{ascending:false}).limit(200);if(error)throw new EntryError('Content could not be loaded.',503);const ids=(data??[]).flatMap(e=>[e.draft_revision_id||e.published_revision_id].filter(Boolean));const revisions=ids.length?await client.from('cms_entry_revisions').select('id,entry_id,title:body->>title').in('id',ids):{data:[],error:null};if(revisions.error)throw new EntryError('Content titles could not be loaded.',503);return{isAdmin,entries:(data??[]).map(e=>({...e,title:revisions.data?.find(r=>r.entry_id===e.id)?.title||e.slug.replace(/-/g,' ')}))}}
export async function writeEntry(kind:EntryKind,slug:string,input:{action:string;content?:EntryContent;projectId:string|null;expectedDraft:string|null;expectedPublished:string|null;revisionId?:string}){const{client}=await entrySession();const{data,error}=await client.rpc('cms_write_entry',{p_kind:kind,p_slug:slug,p_body:input.content??{},p_project:input.projectId,p_expected_draft:input.expectedDraft,p_expected_published:input.expectedPublished,p_action:input.action,p_restore:input.revisionId??null});if(error)throw new EntryError(error.code==='42501'?'You do not have permission for this action.':error.code==='40001'?'Someone changed this content. Reload before continuing.':error.code==='22023'?error.message:'Content could not be saved.',error.code==='42501'?403:error.code==='40001'||error.code==='23505'?409:error.code==='22023'?400:503);return data}
export type PublishedEntry={id:string;slug:string;projectId:string|null;revisionId:string;content:EntryContent}
export async function getPublishedEntries(kind:EntryKind,path?:string,includeScheduled=false):Promise<PublishedEntry[]|null>{try{
 const db=service();const{data:entries,error}=await db.from('cms_entries').select('id,slug,published_project_id,published_revision_id').eq('kind',kind).eq('archived',false).not('published_revision_id','is',null).order('slug').limit(200)
 if(error)return null;if(!entries?.length)return[]
 const[revisions,projects]=await Promise.all([db.from('cms_entry_revisions').select('id,entry_id,body').in('id',entries.map(e=>e.published_revision_id)),entries.some(e=>e.published_project_id)?db.from('cms_entries').select('id').eq('kind','project').eq('archived',false).not('published_revision_id','is',null):Promise.resolve({data:[],error:null})])
 if(revisions.error||projects.error)return null
 const result:PublishedEntry[]=[];for(const entry of entries){if(entry.published_project_id&&!projects.data?.some(p=>p.id===entry.published_project_id))continue;const revision=revisions.data?.find(r=>r.id===entry.published_revision_id&&r.entry_id===entry.id),content=revision&&parseEntry(kind,revision.body);if(content&&(includeScheduled||isEntryVisible(content,path)))result.push({id:entry.id,slug:entry.slug,projectId:entry.published_project_id,revisionId:entry.published_revision_id,content})}
 return result.sort((a,b)=>('priority'in a.content?a.content.priority:100)-('priority'in b.content?b.content.priority:100))
}catch{return null}}

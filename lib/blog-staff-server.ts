import 'server-only'
import type {createClient} from '@/lib/supabase/server'
import {getRequestStaff} from '@/lib/crm/request-staff'
export type ArticlePermissions={workspace:boolean;view:boolean;edit:boolean;publish:boolean;archive:boolean;create:boolean}
const denied:ArticlePermissions={workspace:false,view:false,edit:false,publish:false,archive:false,create:false}
export async function getBlogStaff(slug?:string,action:'view'|'edit'|'publish'|'archive'|'create'='view'){
 const{client,user,authError,profile,grants}=await getRequestStaff()
 if(authError||!user)return{user:null,allowed:false,client,permissions:denied,isGlobal:false}
 if(profile.error||grants.error||!profile.data||!Array.isArray(grants.data))return{user,allowed:false,client,permissions:denied,isGlobal:false}
 const role=profile.data.role,isGlobal=['admin','super_admin'].includes(role)||role==='staff'&&!grants.data.length
 if(isGlobal)return{user,allowed:true,client,isGlobal:true,permissions:{workspace:true,view:true,edit:true,publish:true,archive:true,create:true}}
 if(role!=='content_manager')return{user,allowed:false,client,permissions:denied,isGlobal:false}
 const result=await client.rpc('blog_permissions',{p_slug:slug??null}),permissions:ArticlePermissions=result.error?denied:{workspace:result.data?.workspace===true,view:result.data?.view===true,edit:result.data?.edit===true,publish:result.data?.publish===true,archive:false,create:result.data?.create===true}
 return{user,client,isGlobal:false,permissions,allowed:slug?permissions[action]:permissions.workspace}
}
export async function getArticleProjects(client:Awaited<ReturnType<typeof createClient>>,isGlobal:boolean,userId:string){
 const{data,error}=await client.from('cms_entries').select('id,slug').eq('kind','project').eq('archived',false).order('slug').limit(200)
 if(error)throw new Error('Article projects could not be loaded.')
 if(isGlobal)return(data??[]).map(p=>({...p,canCreate:true}))
 const{data:assignments,error:assignmentError}=await client.from('cms_entry_assignments').select('entry_id,can_view,can_edit,can_create').eq('user_id',userId)
 if(assignmentError)throw new Error('Project creation permissions could not be verified.')
 return(data??[]).map(p=>({...p,canCreate:assignments?.some(a=>a.entry_id===p.id&&a.can_view&&a.can_edit&&a.can_create)===true}))
}

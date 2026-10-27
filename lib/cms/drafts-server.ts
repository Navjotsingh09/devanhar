import 'server-only'
import {getRequestStaff} from '@/lib/crm/request-staff'
export type DraftKind='all'|'pages'|'entries'|'articles'
export type DraftItem={id:string;title:string;type:string;updatedAt:string;editor:string;preview:string;live:boolean}
export async function loadDraftWorkspace(kind:DraftKind,page:number){
 const{client,user,authError,profile,grants}=await getRequestStaff()
 if(authError||!user)throw new Error('Please sign in again.')
 if(profile.error||grants.error||!Array.isArray(grants.data)||!['admin','super_admin','content_manager','staff'].includes(profile.data?.role||''))throw new Error('Your account cannot open website drafts.')
 const role=profile.data!.role,isCms=['admin','super_admin','content_manager'].includes(role),isBlog=['admin','super_admin'].includes(role)||role==='staff'&&!grants.data.length
 const empty={data:[],error:null,count:0},start=(page-1)*25,end=page*25-1
 const[pages,entries,articles]=await Promise.all([
 isCms&&['all','pages'].includes(kind)?client.from('cms_pages').select('id,slug,draft_revision_id,published_revision_id,updated_at',{count:'exact'}).not('draft_revision_id','is',null).order('updated_at',{ascending:false}).order('id').range(start,end):Promise.resolve(empty),
 isCms&&['all','entries'].includes(kind)?client.from('cms_entries').select('id,kind,slug,draft_revision_id,published_revision_id,updated_at',{count:'exact'}).eq('archived',false).not('draft_revision_id','is',null).order('updated_at',{ascending:false}).order('id').range(start,end):Promise.resolve(empty),
 isBlog&&['all','articles'].includes(kind)?client.from('blog_posts').select('id,slug,title,status,draft_revision_id,updated_at',{count:'exact'}).is('archived_at',null).not('draft_revision_id','is',null).order('updated_at',{ascending:false}).order('id').range(start,end):Promise.resolve(empty),
 ])
 if(pages.error||entries.error||articles.error)throw new Error('Drafts could not be loaded. Please retry.')
 const pageRows=pages.data??[],entryRows=entries.data??[],articleRows=articles.data??[]
 const[pageTitles,entryTitles,articleTitles]=await Promise.all([
 pageRows.length?client.from('cms_page_revisions').select('id,title').in('id',pageRows.map(p=>p.draft_revision_id)):Promise.resolve(empty),
 entryRows.length?client.from('cms_entry_revisions').select('id,title:body->>title').in('id',entryRows.map(p=>p.draft_revision_id)):Promise.resolve(empty),
 articleRows.length?client.from('blog_post_revisions').select('id,title:body->>title').in('id',articleRows.map(p=>p.draft_revision_id)):Promise.resolve(empty),
 ])
 if(pageTitles.error||entryTitles.error||articleTitles.error)throw new Error('Draft titles could not be loaded.')
 const items:DraftItem[]=[...pageRows.map(row=>({id:row.id,title:pageTitles.data?.find(r=>r.id===row.draft_revision_id)?.title||row.slug,type:'Page',updatedAt:row.updated_at,editor:row.slug==='sfi'?'/dashboard/website/sfi':`/dashboard/website/pages/${row.slug}`,preview:row.slug==='sfi'?'/cms-preview/sfi':`/cms-preview/pages/${row.slug}`,live:!!row.published_revision_id})),...entryRows.map(row=>({id:row.id,title:entryTitles.data?.find(r=>r.id===row.draft_revision_id)?.title||row.slug,type:row.kind,updatedAt:row.updated_at,editor:`/dashboard/website/content/${row.kind}/${row.slug}`,preview:`/cms-preview/content/${row.kind}/${row.slug}`,live:!!row.published_revision_id})),...articleRows.map(row=>({id:row.id,title:articleTitles.data?.find(r=>r.id===row.draft_revision_id)?.title||row.title,type:'Article',updatedAt:row.updated_at,editor:`/dashboard/blog/${row.slug}/edit`,preview:`/cms-preview/insights/${row.slug}`,live:row.status==='published'}))]
 return{items:items.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),total:(pages.count??0)+(entries.count??0)+(articles.count??0),hasNext:[pages.count,entries.count,articles.count].some(count=>(count??0)>page*25)}
}

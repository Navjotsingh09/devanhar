import 'server-only'
import {createClient,type SupabaseClient} from '@supabase/supabase-js'
import {getBlogStaff} from '@/lib/blog-staff-server'
import {entrySession,EntryError} from './entries/server'
export async function mediaContext(){let context;try{context=await entrySession()}catch(error){if(!(error instanceof EntryError)||error.status!==403)throw error;const staff=await getBlogStaff();if(!staff.allowed)throw error;context={client:staff.client,user:staff.user,isAdmin:false}};const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new EntryError('Media storage is unavailable.',503);return{...context,db:createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}}
export async function mediaReferences(db:SupabaseClient,url:string){
 const[pages,entries,blogs]=await Promise.all([db.from('cms_pages').select('slug,draft_revision_id,published_revision_id'),db.from('cms_entries').select('slug,kind,draft_revision_id,published_revision_id').eq('archived',false),db.from('blog_posts').select('slug,cover_image_url,content,draft_revision_id')])
 if(pages.error||entries.error||blogs.error)throw new EntryError('Usage could not be checked. Please retry.',503)
 const pageIds=(pages.data??[]).flatMap(p=>[p.draft_revision_id,p.published_revision_id].filter(Boolean)),entryIds=(entries.data??[]).flatMap(p=>[p.draft_revision_id,p.published_revision_id].filter(Boolean))
 const blogIds=(blogs.data??[]).map(p=>p.draft_revision_id).filter(Boolean)
 const[pr,er,br]=await Promise.all([pageIds.length?db.from('cms_page_revisions').select('id,body').in('id',pageIds):Promise.resolve({data:[],error:null}),entryIds.length?db.from('cms_entry_revisions').select('id,body').in('id',entryIds):Promise.resolve({data:[],error:null}),blogIds.length?db.from('blog_post_revisions').select('id,body').in('id',blogIds):Promise.resolve({data:[],error:null})])
 if(pr.error||er.error||br.error)throw new EntryError('Usage could not be checked. Please retry.',503)
 const matches=(body:unknown)=>{const values=(v:unknown):boolean=>typeof v==='string'?v.includes(url):Array.isArray(v)?v.some(values):!!v&&typeof v==='object'?Object.values(v).some(values):false;try{return values(typeof body==='string'?JSON.parse(body):body)}catch{return typeof body==='string'&&body.includes(url)}}
 return [...(pages.data??[]).filter(p=>pr.data?.some(r=>[p.draft_revision_id,p.published_revision_id].includes(r.id)&&matches(r.body))).map(p=>`Page: ${p.slug}`),...(entries.data??[]).filter(p=>er.data?.some(r=>[p.draft_revision_id,p.published_revision_id].includes(r.id)&&matches(r.body))).map(p=>`${p.kind}: ${p.slug}`),...(blogs.data??[]).filter(p=>p.cover_image_url===url||matches(p.content)||br.data?.some(r=>r.id===p.draft_revision_id&&matches(r.body))).map(p=>`Article: ${p.slug}`)]
}

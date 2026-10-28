import {unstable_cache} from 'next/cache'
import {cmsService} from './cms/service'
import {getBlogStaff} from './blog-staff-server'
import {parseArticleMetadata} from './blog-metadata'
import { createClient } from "@/lib/supabase/server"
import { type BlogPost, type Pillar } from "@/lib/blog"


const DELETED_LEGACY_SLUGS = new Set([
  "sikhi-vidyala-launches-new-curriculum",
  "over-1000-hours-of-workshops-delivered",
  "university-talks-programme-expands",
  "mentorship-programme-connects-generations",
  "singhs-camp-2026-registrations-open",
  "400-youth-empowered-through-devanhaar",
  "50-events-annually-building-sangat",
  "devanhaar-community-network-launches",
])

const listingColumns = "id,slug,title,excerpt,pillar,status,author_name,cover_image_url,cover_image_alt,tags,read_time,source,published_at,created_at,updated_at,draft_revision_id,archived_at,cms_metadata"

type BlogRow = {
  cms_metadata?:unknown
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  pillar: Pillar
  status: "draft" | "published"
  author_name: string
  cover_image_url: string | null
  cover_image_alt: string | null
  tags: string[] | null
  read_time: string
  source: string | null
  published_at: string | null
  created_at: string
  draft_revision_id?: string | null
  archived_at?: string | null
  updated_at: string
}

function mapRow(row: BlogRow): BlogPost {
  return {
    needsResave:!!row.draft_revision_id&&['projectId','subtitle','category'].some(key=>!row.cms_metadata||typeof row.cms_metadata!=='object'||!Object.hasOwn(row.cms_metadata,key)),
    metadataAvailable:Object.hasOwn(row,"cms_metadata"),
    metadata:parseArticleMetadata(row.cms_metadata),
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.excerpt || "",
    content: row.content || "",
    pillar: row.pillar,
    source: row.source || undefined,
    date: (row.published_at || row.created_at).slice(0, 10),
    readTime: row.read_time || "3 min",
    author: row.author_name || "Devanhaar",
    tags: row.tags || [],
    status: row.status,
    coverImage: row.cover_image_url || undefined,
    coverAlt: row.cover_image_alt || undefined,
    persisted: true,
    draftId: row.draft_revision_id ?? null, updatedAt: row.updated_at, hasDraft: !!row.draft_revision_id, isLive: row.status === "published", archived: !!row.archived_at,
  }
}

const publicColumns=listingColumns.replace(',draft_revision_id','')
function publicPost(row:BlogRow):BlogPost{const post=mapRow(row);delete post.draftId;delete post.hasDraft;delete post.updatedAt;delete post.metadataAvailable;delete post.needsResave;return post}
export const getPublishedBlogPosts=unstable_cache(async():Promise<BlogPost[]>=>{
 try{const{data,error}=await cmsService().from('blog_posts').select(publicColumns).eq('status','published').is('archived_at',null).order('published_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false});if(error||!data)return[];return(data as unknown as BlogRow[]).map(publicPost).filter(post=>!DELETED_LEGACY_SLUGS.has(post.slug)).sort((a,b)=>Number(!!b.metadata?.featured)-Number(!!a.metadata?.featured))}catch{return[]}
},['public-insights-list-v2'],{revalidate:60,tags:['cms-insights']})

async function withDashboardDrafts(supabase: Awaited<ReturnType<typeof createClient>>, rows: BlogRow[]): Promise<BlogPost[]> {
  const ids = rows.flatMap(row => row.draft_revision_id ? [row.draft_revision_id] : [])
  const { data, error } = ids.length ? await supabase.from('blog_post_revisions').select('id, post_id, body').in('id', ids) : { data: [], error: null }
  if (error) throw new Error('Article drafts could not be loaded. Please retry.')
  return rows.filter(row => !DELETED_LEGACY_SLUGS.has(row.slug)).map(row => {
    const draft = data?.find(revision => revision.id === row.draft_revision_id && revision.post_id === row.id)
    const post = mapRow(row)
    return draft ? { ...mapRow({ ...row, ...draft.body, slug: row.slug, id: row.id }), status: row.status, draftId: row.draft_revision_id, updatedAt: row.updated_at, hasDraft: true, isLive: row.status === 'published', archived: !!row.archived_at } : post
  })
}
export async function getDashboardBlogPosts(): Promise<BlogPost[]> {
  const staff=await getBlogStaff();if(!staff.allowed)throw new Error('Insights are not assigned to your account.');const supabase=staff.client
  let query=supabase.from('blog_posts').select(listingColumns).order('updated_at',{ascending:false})
  if(!staff.isGlobal){const access=await supabase.rpc('blog_accessible_posts');if(access.error)throw new Error('Article assignments could not be verified.');if(!access.data?.length)return[];query=query.in('id',access.data)}
  const {data,error}=await query
  if (error) throw new Error('Articles could not be loaded.')
  return (await withDashboardDrafts(supabase, (data ?? []) as unknown as BlogRow[])).map(post => ({...post,content:''}))
}
export async function getDashboardBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const staff=await getBlogStaff(slug);if(!staff.allowed)return undefined;const supabase=staff.client
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
  if (error) throw new Error('Article could not be loaded.')
  return data ? (await withDashboardDrafts(supabase, [data]))[0] : undefined
}

export const getPublishedBlogPostBySlug=unstable_cache(async(slug:string):Promise<BlogPost|undefined>=>{
 if(DELETED_LEGACY_SLUGS.has(slug))return undefined
 try{const{data,error}=await cmsService().from('blog_posts').select('*').eq('slug',slug).eq('status','published').is('archived_at',null).maybeSingle();return !error&&data?publicPost(data as BlogRow):undefined}catch{return undefined}
},['public-insight-detail-v2'],{revalidate:60,tags:['cms-insights']})

export async function getDashboardBlogHistory(postId:string) {
  const supabase=await createClient()
  const {data,error}=await supabase.from('blog_post_revisions')
    .select('id,created_at,title:body->>title').eq('post_id',postId)
    .order('created_at',{ascending:false}).limit(20)
  if(error)throw new Error('Article history could not be loaded.')
  return (data??[]).map(revision=>({id:revision.id,title:revision.title||'Untitled revision',createdAt:revision.created_at}))
}

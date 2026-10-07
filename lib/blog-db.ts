import { createClient } from "@/lib/supabase/server"
import { blogPosts, type BlogPost, type Pillar } from "@/lib/blog"


type BlogRow = {
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
  updated_at: string
}

function mapRow(row: BlogRow): BlogPost {
  return {
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
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return (data as BlogRow[]).map(mapRow)
}

export async function getDashboardBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false })

  return !error && data ? (data as BlogRow[]).map(mapRow) : []
}

export async function getDashboardBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  await ensureLegacyBlogPostsMigrated()
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  return data ? mapRow(data as BlogRow) : undefined
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  return data ? mapRow(data as BlogRow) : undefined
}

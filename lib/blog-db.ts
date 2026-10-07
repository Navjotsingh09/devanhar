import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { blogPosts, type BlogPost, type Pillar } from "@/lib/blog"


function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role credentials")
  return createAdminClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function ensureLegacyBlogPostsMigrated() {
  const admin = getAdminClient()

  const { data: existing, error: existingError } = await admin
    .from("blog_posts")
    .select("slug")

  if (existingError) throw existingError

  const existingSlugs = new Set((existing || []).map((row) => row.slug))
  const missing = blogPosts.filter((post) => !existingSlugs.has(post.slug))

  if (missing.length === 0) return

  const { data: images } = await admin
    .from("site_images")
    .select("category, url, alt_text, created_at")
    .eq("section", "blog")
    .order("created_at", { ascending: false })

  const latestImageBySlug = new Map<string, { url: string; alt_text: string | null }>()
  for (const image of images || []) {
    if (image.category && image.url && !latestImageBySlug.has(image.category)) {
      latestImageBySlug.set(image.category, {
        url: image.url,
        alt_text: image.alt_text,
      })
    }
  }

  const rows = missing.map((post) => {
    const image = latestImageBySlug.get(post.slug)
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.description || "",
      content: post.content || "",
      pillar: post.pillar,
      status: "published",
      author_name: post.author || "Devanhaar",
      cover_image_url: image?.url || null,
      cover_image_alt: image?.alt_text || post.title,
      tags: post.tags?.length ? post.tags : [post.pillar],
      read_time: post.readTime || "3 min",
      source: post.source || null,
      published_at: new Date(post.date + "T12:00:00Z").toISOString(),
    }
  })

  const { error: insertError } = await admin.from("blog_posts").insert(rows)
  if (insertError) throw insertError
}

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
  try {
    await ensureLegacyBlogPostsMigrated()
  } catch (error) {
    console.error("[blog] legacy migration failed during public read:", error)
  }

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
  await ensureLegacyBlogPostsMigrated()
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

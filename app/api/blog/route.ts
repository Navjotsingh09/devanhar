import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const allowedPillars = new Set(["Develop", "Elevate", "Empower", "Connect"])
const allowedStatuses = new Set(["draft", "published"])

async function getStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, allowed: false }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const allowed = ["staff", "admin", "super_admin"].includes(profile?.role || "")
  return { supabase, user, allowed }
}

export async function POST(request: NextRequest) {
  const { supabase, user, allowed } = await getStaff()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const {
    originalSlug,
    slug,
    title,
    description,
    content,
    pillar,
    status,
    author,
    coverImage,
    coverAlt,
    tags,
    readTime,
    source,
    date,
  } = body

  if (!slug || !title || !allowedPillars.has(pillar) || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid blog post data" }, { status: 400 })
  }

  const payload = {
    slug,
    title,
    excerpt: description || "",
    content: content || "",
    pillar,
    status,
    author_name: author || "Devanhaar",
    author_id: user.id,
    cover_image_url: coverImage || null,
    cover_image_alt: coverAlt || null,
    tags: Array.isArray(tags) ? tags : [],
    read_time: readTime || "3 min",
    source: source || null,
    published_at: status === "published" && date ? new Date(date + "T12:00:00Z").toISOString() : null,
  }

  let existing = null
  if (originalSlug) {
    const { data } = await supabase.from("blog_posts").select("id").eq("slug", originalSlug).maybeSingle()
    existing = data
  }

  let result
  if (existing?.id) {
    result = await supabase.from("blog_posts").update(payload).eq("id", existing.id).select().single()
  } else {
    result = await supabase.from("blog_posts").insert(payload).select().single()
  }

  if (result.error) {
    const statusCode = result.error.code === "23505" ? 409 : 500
    return NextResponse.json({ error: result.error.message }, { status: statusCode })
  }

  return NextResponse.json({ post: result.data })
}

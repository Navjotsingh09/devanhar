import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const allowedPillars = new Set(["Develop", "Elevate", "Empower", "Connect"])
const allowedStatuses = new Set(["draft", "published"])

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role credentials")
  return createAdminClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function getStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, allowed: false }

  const admin = getAdminClient()
  const { data: profile } = await admin
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  // Match the existing Devanhaar dashboard behaviour:
  // a missing profile row defaults to staff; only an explicit disallowed role is blocked.
  const allowed = !profile || ["staff", "admin", "super_admin"].includes(profile.role)
  return { user, allowed }
}

export async function POST(request: NextRequest) {
  try {
    const { user, allowed } = await getStaff()
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

    const admin = getAdminClient()

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
      published_at: status === "published" && date
        ? new Date(date + "T12:00:00Z").toISOString()
        : null,
    }

    let existing = null
    if (originalSlug) {
      const { data } = await admin
        .from("blog_posts")
        .select("id")
        .eq("slug", originalSlug)
        .maybeSingle()
      existing = data
    }

    let result
    if (existing?.id) {
      result = await admin
        .from("blog_posts")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single()
    } else {
      result = await admin
        .from("blog_posts")
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      console.error("[blog] save error:", result.error)
      const statusCode = result.error.code === "23505" ? 409 : 500
      return NextResponse.json({ error: result.error.message }, { status: statusCode })
    }

    return NextResponse.json({ post: result.data })
  } catch (error) {
    console.error("[blog] publish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save post" },
      { status: 500 }
    )
  }
}

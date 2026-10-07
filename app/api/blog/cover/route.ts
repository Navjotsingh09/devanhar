import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

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

  const allowed = !profile || ["staff", "admin", "super_admin"].includes(profile.role)
  return { user, allowed }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, allowed } = await getStaff()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 })

    const admin = getAdminClient()

    const { data: images, error: imageLookupError } = await admin
      .from("site_images")
      .select("id, storage_path")
      .eq("section", "blog")
      .eq("category", slug)

    if (imageLookupError) {
      return NextResponse.json({ error: imageLookupError.message }, { status: 500 })
    }

    const storagePaths = (images || [])
      .map((image) => image.storage_path)
      .filter((value): value is string => Boolean(value))

    if (storagePaths.length > 0) {
      const { error: storageError } = await admin.storage
        .from("site-images")
        .remove(storagePaths)

      if (storageError) {
        return NextResponse.json({ error: "Storage delete failed: " + storageError.message }, { status: 500 })
      }
    }

    const { error: imageDeleteError } = await admin
      .from("site_images")
      .delete()
      .eq("section", "blog")
      .eq("category", slug)

    if (imageDeleteError) {
      return NextResponse.json({ error: imageDeleteError.message }, { status: 500 })
    }

    const { error: postUpdateError } = await admin
      .from("blog_posts")
      .update({
        cover_image_url: null,
        cover_image_alt: null,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug)

    if (postUpdateError) {
      return NextResponse.json({ error: postUpdateError.message }, { status: 500 })
    }

    revalidatePath("/insights")
    revalidatePath(`/insights/${slug}`)
    revalidatePath("/dashboard/blog")
    revalidatePath(`/dashboard/blog/${slug}/edit`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[blog] cover delete error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove cover image" },
      { status: 500 }
    )
  }
}

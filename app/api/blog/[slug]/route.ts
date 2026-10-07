import { NextResponse } from "next/server"
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const admin = getAdminClient()
    const { data: profile } = await admin
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const allowed = !profile || ["staff", "admin", "super_admin"].includes(profile.role)
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: images } = await admin
      .from("site_images")
      .select("storage_path")
      .eq("section", "blog")
      .eq("category", slug)

    const storagePaths = (images || [])
      .map((image) => image.storage_path)
      .filter((value): value is string => Boolean(value))

    if (storagePaths.length > 0) {
      await admin.storage.from("site-images").remove(storagePaths)
    }

    await admin
      .from("site_images")
      .delete()
      .eq("section", "blog")
      .eq("category", slug)

    const { error } = await admin.from("blog_posts").delete().eq("slug", slug)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidatePath("/insights")
    revalidatePath(`/insights/${slug}`)
    revalidatePath("/dashboard/blog")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[blog] delete error:", error)
    return NextResponse.json({ error: "Could not delete post" }, { status: 500 })
  }
}

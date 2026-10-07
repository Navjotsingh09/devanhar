import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const LEGACY_SLUGS = [
  "sikhi-vidyala-launches-new-curriculum",
  "over-1000-hours-of-workshops-delivered",
  "university-talks-programme-expands",
  "mentorship-programme-connects-generations",
  "singhs-camp-2026-registrations-open",
  "400-youth-empowered-through-devanhaar",
  "50-events-annually-building-sangat",
  "devanhaar-community-network-launches",
]

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role credentials")
  return createAdminClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function DELETE() {
  try {
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
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data: images } = await admin
      .from("site_images")
      .select("storage_path, category")
      .eq("section", "blog")
      .in("category", LEGACY_SLUGS)

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
      .in("category", LEGACY_SLUGS)

    const { error } = await admin
      .from("blog_posts")
      .delete()
      .in("slug", LEGACY_SLUGS)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidatePath("/insights")
    revalidatePath("/dashboard/blog")
    for (const slug of LEGACY_SLUGS) revalidatePath(`/insights/${slug}`)

    return NextResponse.json({ success: true, deletedSlugs: LEGACY_SLUGS })
  } catch (error) {
    console.error("[blog] legacy cleanup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not clean up legacy posts" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const SEEDED_SLUGS = [
  "sikhi-vidyala-launches-new-curriculum",
  "over-1000-hours-of-workshops-delivered",
  "university-talks-programme-expands",
  "mentorship-programme-connects-generations",
  "singhs-camp-2026-registrations-open",
  "400-youth-empowered-through-devanhaar",
  "50-events-annually-building-sangat",
  "devanhaar-community-network-launches",
]

const REPAIR_KEY = "devanhaar-blog-repair-2026-10-07"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role credentials")
  return createAdminClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("key") !== REPAIR_KEY) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const admin = getAdminClient()

  const { data: images, error: lookupError } = await admin
    .from("site_images")
    .select("storage_path")
    .eq("section", "blog")
    .in("category", SEEDED_SLUGS)

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 })
  }

  const storagePaths = (images || [])
    .map((image) => image.storage_path)
    .filter((value): value is string => Boolean(value))

  if (storagePaths.length > 0) {
    await admin.storage.from("site-images").remove(storagePaths)
  }

  const { error: imageDeleteError } = await admin
    .from("site_images")
    .delete()
    .eq("section", "blog")
    .in("category", SEEDED_SLUGS)

  if (imageDeleteError) {
    return NextResponse.json({ error: imageDeleteError.message }, { status: 500 })
  }

  const { error: postDeleteError } = await admin
    .from("blog_posts")
    .delete()
    .in("slug", SEEDED_SLUGS)

  if (postDeleteError) {
    return NextResponse.json({ error: postDeleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, deletedSeededSlugs: SEEDED_SLUGS })
}

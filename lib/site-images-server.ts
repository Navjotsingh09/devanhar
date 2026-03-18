import { createClient } from "@/lib/supabase/server"
import type { SiteImage } from "@/lib/site-images"

export async function getSiteImages(section: string, category?: string): Promise<SiteImage[]> {
  const supabase = await createClient()
  let query = supabase
    .from("site_images")
    .select("*")
    .eq("section", section)
    .order("created_at", { ascending: false })

  if (category) {
    query = query.eq("category", category)
  }

  const { data } = await query
  return (data as SiteImage[]) || []
}

export async function getSiteImage(section: string, category: string | undefined, fallback: string): Promise<string> {
  const images = await getSiteImages(section, category)
  return images.length > 0 ? images[0].url : fallback
}

import { createClient } from "@/lib/supabase/server"

export async function getUploadedBlogCovers(): Promise<Record<string, string>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_images")
      .select("category, url, created_at")
      .eq("section", "blog")
      .order("created_at", { ascending: false })

    if (error || !data) return {}

    const covers: Record<string, string> = {}
    for (const image of data) {
      if (image.category && image.url && !covers[image.category]) {
        covers[image.category] = image.url
      }
    }
    return covers
  } catch {
    return {}
  }
}

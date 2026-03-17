import { createClient } from "@/lib/supabase/server"

export interface SiteImage {
  id: string
  section: string
  category: string | null
  label: string | null
  alt_text: string | null
  url: string
  storage_path: string
  display_order: number
  created_at: string
  updated_at: string
}

export const IMAGE_SECTIONS = {
  team: {
    label: "Team Members",
    categories: [
      { value: "leadership", label: "Leadership" },
      { value: "team", label: "Team Members" },
    ],
  },
  hero: {
    label: "Hero Banners",
    categories: [
      { value: "home", label: "Home Page" },
      { value: "about", label: "About Page" },
      { value: "foundation", label: "Foundation Page" },
      { value: "media", label: "Media Page" },
    ],
  },
  timeline: {
    label: "Timeline",
    categories: [
      { value: "2018", label: "2018" },
      { value: "2019", label: "2019" },
      { value: "2020", label: "2020" },
      { value: "2021", label: "2021" },
      { value: "2022", label: "2022" },
      { value: "2023", label: "2023" },
      { value: "2024", label: "2024" },
      { value: "2025", label: "2025" },
    ],
  },
  gallery: {
    label: "Gallery",
    categories: [
      { value: "general", label: "General" },
      { value: "events", label: "Events" },
      { value: "camps", label: "Camps" },
    ],
  },
  initiative: {
    label: "Initiatives",
    categories: [
      { value: "agri", label: "AGRI" },
      { value: "vedic-maths", label: "Vedic Maths" },
      { value: "stem", label: "STEM" },
      { value: "art-culture", label: "Art & Culture" },
      { value: "sports", label: "Sports" },
    ],
  },
} as const

export async function getSiteImages(section: string, category?: string): Promise<SiteImage[]> {
  const supabase = await createClient()
  let query = supabase
    .from("site_images")
    .select("*")
    .eq("section", section)
    .order("display_order", { ascending: true })

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

"use client"

import { useState, useEffect } from "react"

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

export function useSiteImages(section: string, category?: string) {
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ section })
    if (category) params.set("category", category)

    fetch("/api/images?" + params.toString())
      .then((res) => res.json())
      .then((data) => setImages(data.images || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [section, category])

  return { images, loading }
}

export function useSiteImage(section: string, category: string | undefined, fallback: string) {
  const { images, loading } = useSiteImages(section, category)
  return { url: images.length > 0 ? images[0].url : fallback, loading }
}

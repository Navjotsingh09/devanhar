"use client"

import { useState } from "react"
import { SITE_PAGES } from "@/lib/site-images"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Upload } from "lucide-react"

interface SeedItem {
  page: string
  section: string
  dbSection: string
  dbCategory: string | null
  label: string
  width: number
  height: number
}

function parseDimensions(dim?: string): { w: number; h: number } {
  if (!dim) return { w: 800, h: 600 }
  const m = dim.match(/(\d+)\s*[\u00d7x]\s*(\d+)/)
  if (m) return { w: parseInt(m[1]), h: parseInt(m[2]) }
  const single = dim.match(/(\d+)px/)
  if (single) return { w: parseInt(single[1]), h: parseInt(single[1]) }
  return { w: 800, h: 600 }
}

function buildSeedList(): SeedItem[] {
  const items: SeedItem[] = []
  for (const [pageKey, page] of Object.entries(SITE_PAGES)) {
    for (const sec of page.sections) {
      const { w, h } = parseDimensions(sec.dimensions)
      items.push({
        page: pageKey,
        section: sec.value,
        dbSection: sec.dbSection,
        dbCategory: sec.dbCategory,
        label: sec.defaultLabel || sec.label,
        width: Math.min(w, 1200),
        height: Math.min(h, 900),
      })
    }
  }
  return items
}

type Status = "idle" | "running" | "done" | "error"
interface ItemStatus { status: Status; error?: string }

export default function SeedPage() {
  const items = buildSeedList()
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({})
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const updateStatus = (key: string, s: ItemStatus) =>
    setStatuses((prev) => ({ ...prev, [key]: s }))

  const seedAll = async () => {
    setRunning(true)
    setDone(false)

    for (const item of items) {
      const key = item.section
      updateStatus(key, { status: "running" })
      try {
        const color = "1a1a2e"
        const textColor = "e0e0e0"
        const text = encodeURIComponent(item.label.slice(0, 30))
        const url = `https://placehold.co/${item.width}x${item.height}/${color}/${textColor}.png?text=${text}`

        const imgRes = await fetch(url)
        if (!imgRes.ok) throw new Error(`Failed to download: ${imgRes.status}`)
        const blob = await imgRes.blob()
        const file = new File([blob], `${item.section}.png`, { type: "image/png" })

        const form = new FormData()
        form.append("file", file)
        form.append("section", item.dbSection)
        if (item.dbCategory) form.append("category", item.dbCategory)
        form.append("label", item.label)
        form.append("alt_text", `Placeholder for ${item.label}`)

        const res = await fetch("/api/images", { method: "POST", body: form })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Upload failed: ${res.status}`)
        }
        updateStatus(key, { status: "done" })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        updateStatus(key, { status: "error", error: msg })
      }
    }
    setRunning(false)
    setDone(true)
  }

  const successCount = Object.values(statuses).filter((s) => s.status === "done").length
  const errorCount = Object.values(statuses).filter((s) => s.status === "error").length

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Seed Placeholder Images</h1>
      <p className="text-muted-foreground mb-6">
        Upload placeholder images from placehold.co for every CMS image section.
        You can then replace them with real images from the Images dashboard.
      </p>

      <div className="flex items-center gap-4 mb-8">
        <Button onClick={seedAll} disabled={running} size="lg">
          {running ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading ({successCount}/{items.length})...</>
          ) : done ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Done {successCount} uploaded, {errorCount} failed</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Seed All {items.length} Placeholders</>
          )}
        </Button>
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const s = statuses[item.section]
          return (
            <div key={item.section} className="flex items-center gap-3 py-1.5 px-3 rounded text-sm">
              <span className="w-5 shrink-0">
                {s?.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {s?.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                {s?.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                {(s === undefined || s.status === "idle") && <span className="w-4 h-4 block rounded-full border border-muted-foreground/30" />}
              </span>
              <span className="font-medium w-40 truncate">{SITE_PAGES[item.page]?.label}</span>
              <span className="text-muted-foreground truncate flex-1">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.width}x{item.height}</span>
              {s?.status === "error" && (
                <span className="text-xs text-red-500 truncate max-w-60">{s.error}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback, useEffect } from "react"
import { SITE_PAGES } from "@/lib/site-images"
import type { PageSection } from "@/lib/site-images"
import { toast } from "sonner"
import { Upload, Trash2, CheckCircle2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UploadedImage {
  id: string
  section: string
  category: string | null
  label: string | null
  alt_text: string | null
  url: string
  storage_path: string
  display_order: number
  created_at: string
}

const pageKeys = Object.keys(SITE_PAGES)

export default function SiteImagesPage() {
  const [page, setPage] = useState(pageKeys[0])
  const [sectionIdx, setSectionIdx] = useState(0)
  const [label, setLabel] = useState("")
  const [altText, setAltText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [sectionOverview, setSectionOverview] = useState<Record<string, UploadedImage | null>>({})
  const [overviewLoading, setOverviewLoading] = useState(true)

  const currentPage = SITE_PAGES[page]
  const sections = currentPage?.sections || []
  const currentSection: PageSection | undefined = sections[sectionIdx]

  const handlePageChange = (newPage: string) => {
    setPage(newPage)
    setSectionIdx(0)
    const firstSection = SITE_PAGES[newPage]?.sections[0]
    setLabel(firstSection?.defaultLabel || "")
  }

  const fetchImages = useCallback(async () => {
    if (!currentSection) return
    setLoading(true)
    const params = new URLSearchParams({ section: currentSection.dbSection })
    if (currentSection.dbCategory) params.set("category", currentSection.dbCategory)
    try {
      const res = await fetch("/api/images?" + params.toString())
      const data = await res.json()
      setImages(data.images || [])
    } catch {
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [currentSection])

  const fetchOverview = useCallback(async () => {
    if (!currentPage) return
    setOverviewLoading(true)
    try {
      const results = await Promise.all(
        currentPage.sections.map(async (sec) => {
          const params = new URLSearchParams({ section: sec.dbSection })
          if (sec.dbCategory) params.set("category", sec.dbCategory)
          const res = await fetch("/api/images?" + params.toString())
          const data = await res.json()
          const imgs = data.images || []
          return { key: sec.value, image: imgs.length > 0 ? imgs[0] : null }
        })
      )
      const overview: Record<string, UploadedImage | null> = {}
      results.forEach((r) => { overview[r.key] = r.image })
      setSectionOverview(overview)
    } catch {
      setSectionOverview({})
    } finally {
      setOverviewLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  const handleUpload = async () => {
    if (!file || !currentSection) return
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 4 MB.")
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("section", currentSection.dbSection)
      if (currentSection.dbCategory) fd.append("category", currentSection.dbCategory)
      if (label) fd.append("label", label)
      if (altText) fd.append("alt_text", altText)

      const res = await fetch("/api/images", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      toast.success("Image uploaded successfully")
      setFile(null)
      setLabel(currentSection.defaultLabel || "")
      setAltText("")
      fetchImages()
      fetchOverview()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed"
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return
    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Image deleted")
      fetchImages()
      fetchOverview()
    } catch {
      toast.error("Failed to delete image")
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      if (droppedFile.size > 4 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 4 MB.")
        return
      }
      setFile(droppedFile)
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Images</h2>
        <p className="text-muted-foreground">Upload and manage images for each page of the website.</p>
      </div>

      {/* Section Overview Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Section Overview</CardTitle>
            <Select value={page} onValueChange={handlePageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {pageKeys.map((k) => (
                  <SelectItem key={k} value={k}>{SITE_PAGES[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {overviewLoading ? (
            <p className="text-muted-foreground text-sm">Loading sections...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sections.map((sec, i) => {
                const img = sectionOverview[sec.value]
                const hasImage = !!img
                return (
                  <button
                    key={sec.value}
                    onClick={() => { setSectionIdx(i); setLabel(sec.defaultLabel || "") }}
                    className={
                      "relative rounded-lg border-2 p-0 overflow-hidden text-left transition-all hover:shadow-md " +
                      (i === sectionIdx ? "ring-2 ring-primary " : "") +
                      (hasImage ? "border-green-500" : "border-dashed border-muted-foreground/30")
                    }
                  >
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      {hasImage ? (
                        <img src={img.url} alt={img.alt_text || sec.label} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="p-2 flex items-center gap-1.5">
                      {hasImage ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">{sec.label}</span>
                    </div>
                    {sec.dimensions && (
                      <div className="px-2 pb-1.5">
                        <span className="text-[10px] text-muted-foreground">{sec.dimensions}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentSection
              ? "Upload to: " + SITE_PAGES[page].label + " > " + currentSection.label
              : "Select a section above"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSection && (
            <>
              {currentSection.description && (
                <p className="text-xs text-muted-foreground">{currentSection.description}</p>
              )}
              {currentSection.dimensions && (
                <p className="text-xs text-blue-600 font-medium">Recommended size: {currentSection.dimensions}</p>
              )}
              <div
                className={"border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors " + (dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25")}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Drag & drop an image or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Max file size: 4 MB</p>
                <input id="file-input" type="file" accept="image/*" className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Label</label>
                  <Input value={label} onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. hero, person name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alt Text</label>
                  <Input value={altText} onChange={(e) => setAltText(e.target.value)}
                    placeholder="Image description" />
                </div>
              </div>

              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Section Images */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentSection
              ? "Images - " + SITE_PAGES[page].label + " > " + currentSection.label
              : "Select a section"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : images.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No images uploaded for this section yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                  <img src={img.url} alt={img.alt_text || img.label || ""}
                    className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(img.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                  {img.label && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {img.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

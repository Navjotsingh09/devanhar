"use client"

import { useState, useCallback, useEffect } from "react"
import { SITE_PAGES } from "@/lib/site-images"
import type { PageSection } from "@/lib/site-images"
import { toast } from "sonner"
import { Upload, Trash2 } from "lucide-react"
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

  const currentPage = SITE_PAGES[page]
  const sections = currentPage?.sections || []
  const currentSection: PageSection | undefined = sections[sectionIdx]

  const handlePageChange = (newPage: string) => {
    setPage(newPage)
    setSectionIdx(0)
    const firstSection = SITE_PAGES[newPage]?.sections[0]
    setLabel(firstSection?.defaultLabel || "")
  }

  const handleSectionChange = (idx: string) => {
    const i = parseInt(idx)
    setSectionIdx(i)
    const sec = sections[i]
    setLabel(sec?.defaultLabel || "")
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

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleUpload = async () => {
    if (!file || !currentSection) return
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
    } catch {
      toast.error("Failed to delete image")
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile)
    }
  }, [])


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Images</h2>
        <p className="text-muted-foreground">Upload and manage images for each page of the website.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Website Page</label>
            <Select value={page} onValueChange={handlePageChange}>
              <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
              <SelectContent>
                {pageKeys.map((k) => (
                  <SelectItem key={k} value={k}>{SITE_PAGES[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currentPage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select value={String(sectionIdx)} onValueChange={handleSectionChange}>
                <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                <SelectContent>
                  {currentPage.sections.map((s, i) => (
                    <SelectItem key={s.value} value={String(i)}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentSection?.description && (
                <p className="text-xs text-muted-foreground">{currentSection.description}</p>
              )}
              {currentSection?.dimensions && (
                <p className="text-xs text-blue-600 font-medium mt-1">Recommended size: {currentSection.dimensions}</p>
              )}
            </div>
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

          <Button onClick={handleUpload} disabled={!file || !currentSection || uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentSection
              ? `Images - ${SITE_PAGES[page].label} > ${currentSection.label}`
              : "Select a page and section"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : images.length === 0 ? (
            <p className="text-muted-foreground text-sm">No images uploaded for this section yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                  <img src={img.url} alt={img.alt_text || img.label || ""} className="w-full h-40 object-cover" />
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

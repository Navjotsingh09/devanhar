"use client"

import { useState, useCallback, useEffect } from "react"
import { IMAGE_SECTIONS } from "@/lib/site-images"
import { toast } from "sonner"
import { Upload, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

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

const sectionKeys = Object.keys(IMAGE_SECTIONS) as (keyof typeof IMAGE_SECTIONS)[]

export default function SiteImagesPage() {
  const [section, setSection] = useState<keyof typeof IMAGE_SECTIONS>(sectionKeys[0])
  const [category, setCategory] = useState<string>("")
  const [label, setLabel] = useState("")
  const [altText, setAltText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)

  const categories = IMAGE_SECTIONS[section]?.categories || []

  const fetchImages = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ section })
    if (category) params.set("category", category)
    try {
      const res = await fetch("/api/images?" + params.toString())
      const data = await res.json()
      setImages(data.images || [])
    } catch {
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [section, category])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("section", section)
      if (category) fd.append("category", category)
      if (label) fd.append("label", label)
      if (altText) fd.append("alt_text", altText)

      const res = await fetch("/api/images", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      toast.success("Image uploaded successfully")
      setFile(null)
      setLabel("")
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Images</h1>
        <p className="text-muted-foreground">Upload and manage images across the website</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Section</Label>
          <Select value={section} onValueChange={(v) => { setSection(v as keyof typeof IMAGE_SECTIONS); setCategory("") }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sectionKeys.map((key) => (
                <SelectItem key={key} value={key}>{IMAGE_SECTIONS[key].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {categories.length > 0 && (
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div
            className={"border-2 border-dashed rounded-lg p-8 text-center " + (dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25")}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            {file ? (
              <p className="font-medium">{file.name}</p>
            ) : (
              <div>
                <p className="font-medium">Drag and drop an image here</p>
                <p className="text-sm text-muted-foreground">or click below to browse</p>
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              className="mt-2 max-w-xs mx-auto"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="label">Label (e.g. person name, year)</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Optional label" />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input id="alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Image description" />
            </div>
          </div>

          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Upload Image"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Uploaded Images</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : images.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No images uploaded for this section yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt={img.alt_text || img.label || "Site image"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <CardContent className="p-3">
                  {img.label && <p className="font-medium text-sm">{img.label}</p>}
                  {img.category && <p className="text-xs text-muted-foreground">{img.category}</p>}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleDelete(img.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

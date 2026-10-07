"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, Save, Send, RotateCcw, Upload, ImageIcon, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BlogContent } from "@/components/blog-content"
import { getBlogCoverImage } from "@/lib/blog-presentation"
import { toast } from "sonner"
import type { BlogPost, Pillar } from "@/lib/blog"

type ManagedPost = BlogPost & {
  author?: string
  tags?: string[]
  status?: "draft" | "published"
  coverImage?: string
  coverAlt?: string
}

const STORAGE_KEY = "devanhaar-blog-preview-posts"
const pillars: Pillar[] = ["Develop", "Elevate", "Empower", "Connect"]
const MAX_IMAGE_SIZE = 4 * 1024 * 1024

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export function BlogEditor({ initialPost }: { initialPost?: ManagedPost }) {
  const router = useRouter()
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState<ManagedPost>(initialPost ?? {
    slug: "",
    title: "",
    description: "",
    pillar: "Develop",
    date: new Date().toISOString().slice(0,10),
    readTime: "3 min",
    content: "",
    author: "Devanhaar",
    tags: [],
    status: "draft",
    coverImage: "",
    coverAlt: "",
  })

  const tagsText = useMemo(() => (form.tags ?? []).join(", "), [form.tags])
  const effectiveSlug = form.slug || slugify(form.title)
  const currentCover = form.coverImage || (initialPost ? getBlogCoverImage(initialPost.slug) : "")

  const set = (key: keyof ManagedPost, value: any) => {
    setSaved(false)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image is too large. Maximum size is 4 MB.")
      return
    }
    if (!effectiveSlug) {
      toast.error("Add a post title first so the image can be linked to this article.")
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("section", "blog")
      fd.append("category", effectiveSlug)
      fd.append("label", `${form.title || "Blog post"} cover`)
      fd.append("alt_text", form.coverAlt || form.title || "Blog cover image")

      const res = await fetch("/api/images", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      set("coverImage", data.image.url)
      if (!form.coverAlt) set("coverAlt", form.title || "Blog cover image")
      toast.success("Cover image uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  const persist = (status: "draft" | "published") => {
    const finalSlug = form.slug || slugify(form.title)
    const next: ManagedPost = { ...form, slug: finalSlug, status, tags: form.tags ?? [] }
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as ManagedPost[]
    const without = existing.filter((p) => p.slug !== (initialPost?.slug ?? finalSlug))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...without]))
    setForm(next)
    setSaved(true)
    setTimeout(() => router.push("/dashboard/blog"), 350)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link href="/dashboard/blog" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{initialPost ? "Edit post" : "Create new post"}</h1>
          <p className="mt-1 text-muted-foreground">Write, preview and prepare content for Devanhaar Insights.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview((v) => !v)}>
            <Eye className="mr-2 h-4 w-4" />{preview ? "Back to editor" : "Preview"}
          </Button>
          <Button variant="outline" onClick={() => persist("draft")}><Save className="mr-2 h-4 w-4" />Save draft</Button>
          <Button className="bg-amber-500 text-black hover:bg-amber-400" onClick={() => persist("published")} disabled={!form.title.trim() || !form.content.trim()}>
            <Send className="mr-2 h-4 w-4" />Publish
          </Button>
        </div>
      </div>

      {saved && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Saved to the staging blog workspace.</div>}

      {preview ? (
        <Card>
          <CardContent className="mx-auto max-w-4xl p-6 md:p-10">
            <div className="mb-5 flex flex-wrap items-center gap-2"><Badge>{form.pillar}</Badge><span className="text-sm text-muted-foreground">{form.author || "Devanhaar"} · {form.date} · {form.readTime}</span></div>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">{form.title || "Untitled post"}</h1>
            <p className="mt-5 border-l-4 border-amber-400 pl-4 text-lg leading-relaxed text-muted-foreground">{form.description || "Add an excerpt to introduce the article."}</p>
            {currentCover && (
              <div className="mt-8 overflow-hidden rounded-2xl border bg-muted">
                <img src={currentCover} alt={form.coverAlt || form.title || "Blog cover"} className="aspect-[16/9] w-full object-cover" />
              </div>
            )}
            <div className="mt-10"><BlogContent content={form.content || "Start writing your article to preview it here."} /></div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader><CardTitle>Article</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <label className="block"><span className="mb-2 block text-sm font-medium">Title</span><input value={form.title} onChange={(e)=>{set("title",e.target.value); if(!initialPost) set("slug",slugify(e.target.value))}} placeholder="Enter your blog post title" className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium">Excerpt</span><textarea value={form.description} onChange={(e)=>set("description",e.target.value)} rows={3} placeholder="Brief description shown on the blog listing" className="w-full rounded-lg border border-input bg-background px-3 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium">Content</span><textarea value={form.content} onChange={(e)=>set("content",e.target.value)} rows={20} placeholder={"Write the article here...\n\nUse ## for headings, ### for subheadings, - for bullet lists and > for quotes."} className="w-full rounded-lg border border-input bg-background px-3 py-3 font-mono text-sm leading-6 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" /></label>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Featured Image</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {currentCover ? (
                  <div className="overflow-hidden rounded-xl border bg-muted">
                    <img src={currentCover} alt={form.coverAlt || form.title || "Blog cover"} className="aspect-[16/10] w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed bg-muted/40">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}

                <div
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragOver ? "border-amber-500 bg-amber-50" : "border-muted-foreground/20 hover:border-amber-400"}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) void uploadCover(file)
                  }}
                  onClick={() => document.getElementById("blog-cover-upload")?.click()}
                >
                  {uploading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-600" /> : <Upload className="mx-auto h-6 w-6 text-muted-foreground" />}
                  <p className="mt-2 text-sm font-medium">{uploading ? "Uploading..." : currentCover ? "Replace image" : "Upload cover image"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Drag & drop or click to browse · JPG, PNG, WebP · max 4 MB</p>
                  <input
                    id="blog-cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadCover(file)
                      e.currentTarget.value = ""
                    }}
                  />
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Image alt text</span>
                  <input
                    value={form.coverAlt ?? ""}
                    onChange={(e) => set("coverAlt", e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </label>

                {form.coverImage && (
                  <Button type="button" variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => set("coverImage", "")}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove selected image
                  </Button>
                )}

                {!effectiveSlug && <p className="text-xs text-amber-700">Enter a title before uploading so the image can be linked to the correct post.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <label className="block"><span className="mb-2 block text-sm font-medium">Status</span><select value={form.status} onChange={(e)=>set("status",e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3"><option value="draft">Draft</option><option value="published">Published</option></select></label>
                <label className="block"><span className="mb-2 block text-sm font-medium">Pillar</span><select value={form.pillar} onChange={(e)=>set("pillar",e.target.value as Pillar)} className="h-10 w-full rounded-lg border border-input bg-background px-3">{pillars.map(p=><option key={p}>{p}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-sm font-medium">Author</span><input value={form.author ?? ""} onChange={(e)=>set("author",e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3" /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium">Publish date</span><input type="date" value={form.date} onChange={(e)=>set("date",e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3" /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium">Read time</span><input value={form.readTime} onChange={(e)=>set("readTime",e.target.value)} placeholder="4 min" className="h-10 w-full rounded-lg border border-input bg-background px-3" /></label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Discovery</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <label className="block"><span className="mb-2 block text-sm font-medium">Slug</span><div className="flex gap-2"><input value={form.slug} onChange={(e)=>set("slug",slugify(e.target.value))} className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" /><Button type="button" size="icon" variant="outline" onClick={()=>set("slug",slugify(form.title))} title="Regenerate slug"><RotateCcw className="h-4 w-4" /></Button></div></label>
                <label className="block"><span className="mb-2 block text-sm font-medium">Tags</span><input value={tagsText} onChange={(e)=>set("tags",e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} placeholder="community, education, youth" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

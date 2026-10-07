"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Plus, Eye, Edit3, Trash2, Calendar, Clock, FileText, CheckCircle2, PencilLine } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { BlogPost } from "@/lib/blog"

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | "published" | "draft">("all")
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.pillar.toLowerCase().includes(query.toLowerCase())
      const postStatus = post.status ?? "published"
      const matchesStatus = status === "all" || postStatus === status
      return matchesQuery && matchesStatus
    })
  }, [posts, query, status])

  const published = posts.filter((p) => (p.status ?? "published") === "published").length
  const drafts = posts.filter((p) => p.status === "draft").length

  const deletePost = async (post: BlogPost) => {
    if (!window.confirm(`Permanently delete "${post.title}"?`)) return

    setDeleting(post.slug)
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(post.slug)}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")
      setPosts((prev) => prev.filter((item) => item.slug !== post.slug))
      toast.success("Post deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
            <PencilLine className="h-4 w-4" />
            Content
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-muted-foreground">Create, preview and publish Devanhaar Insights from the staff dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/insights" target="_blank"><Eye className="mr-2 h-4 w-4" />View public blog</Link>
          </Button>
          <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
            <Link href="/dashboard/blog/new"><Plus className="mr-2 h-4 w-4" />New post</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100"><FileText className="h-5 w-5 text-slate-700" /></div><div><div className="text-2xl font-semibold">{posts.length}</div><div className="text-sm text-muted-foreground">Total posts</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50"><CheckCircle2 className="h-5 w-5 text-emerald-700" /></div><div><div className="text-2xl font-semibold">{published}</div><div className="text-sm text-muted-foreground">Published</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50"><PencilLine className="h-5 w-5 text-amber-700" /></div><div><div className="text-2xl font-semibold">{drafts}</div><div className="text-sm text-muted-foreground">Drafts</div></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search posts..." className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" />
            </div>
            <select value={status} onChange={(e)=>setStatus(e.target.value as "all"|"published"|"draft")} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-amber-500">
              <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[minmax(0,1fr)_140px_140px_120px] gap-4 border-b border-border bg-muted/35 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Post</span><span>Pillar</span><span>Date</span><span className="text-right">Actions</span>
        </div>
        {filtered.map((post) => {
          const postStatus = post.status ?? "published"
          return (
            <div key={post.slug} className="grid gap-4 border-b border-border px-5 py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_140px_140px_120px] md:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={postStatus === "published" ? "default" : "secondary"} className={postStatus === "published" ? "bg-emerald-600" : ""}>{postStatus}</Badge>
                  <span className="text-xs text-muted-foreground">{post.author || "Devanhaar"}</span>
                </div>
                <h3 className="truncate font-semibold text-foreground">{post.title}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{post.description}</p>
              </div>
              <div className="hidden md:block"><Badge variant="outline">{post.pillar}</Badge></div>
              <div className="hidden text-sm text-muted-foreground md:block">
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(post.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" />{post.readTime}</div>
              </div>
              <div className="flex justify-end gap-1.5">
                {postStatus === "published" && <Button size="icon" variant="ghost" asChild title="View"><Link href={`/insights/${post.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link></Button>}
                <Button size="icon" variant="ghost" asChild title="Edit"><Link href={`/dashboard/blog/${post.slug}/edit`}><Edit3 className="h-4 w-4" /></Link></Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" disabled={deleting===post.slug} onClick={()=>void deletePost(post)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {filtered.length===0 && <div className="px-5 py-14 text-center text-sm text-muted-foreground">No posts match your filters.</div>}
      </div>

    </div>
  )
}

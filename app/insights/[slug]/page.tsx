import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { getPostBySlug, getAllSlugs, blogPosts, type Pillar } from "@/lib/blog"
import { BlogContent } from "@/components/blog-content"

const pillarColors: Record<Pillar, string> = {
  Develop: "bg-blue-50 text-blue-700 border-blue-200",
  Elevate: "bg-purple-50 text-purple-700 border-purple-200",
  Empower: "bg-amber-50 text-amber-700 border-amber-200",
  Connect: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Not Found - Devanhaar" }
  return {
    title: `${post.title} - Devanhaar Insights`,
    description: post.description,
  }
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = blogPosts
    .filter((p) => p.pillar === post.pillar && p.slug !== post.slug)
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollAnimations />
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            All Insights
          </Link>

          <div className="mb-6">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${pillarColors[post.pillar]}`}
            >
              {post.pillar}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime} read
            </span>
          </div>

          <p className="text-lg text-muted-foreground mb-10 leading-relaxed border-l-4 border-primary pl-4">
            {post.description}
          </p>

          <BlogContent content={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              More from {post.pillar}
            </h2>
            <div className="grid gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/insights/${r.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {r.readTime} &middot;{" "}
                      {new Date(r.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterSection />
    </main>
  )
}

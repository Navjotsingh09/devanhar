import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { getAllSlugs } from "@/lib/blog"
import { BlogContent } from "@/components/blog-content"
import { blogAuthor, getBlogCoverImage } from "@/lib/blog-presentation"
import { getUploadedBlogCovers } from "@/lib/blog-images"
import { getPublishedBlogPostBySlug, getPublishedBlogPosts } from "@/lib/blog-db"

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) return { title: "Not Found - Devanhaar" }
  return {
    title: `${post.title} - Devanhaar Blog`,
    description: post.description,
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  const [uploadedCovers, publishedPosts] = await Promise.all([getUploadedBlogCovers(), getPublishedBlogPosts()])
  const coverFor = (item: (typeof publishedPosts)[number]) => item.coverImage || uploadedCovers[item.slug] || getBlogCoverImage(item.slug)

  const related = publishedPosts.filter((item) => item.slug !== post.slug).slice(0, 2)

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <article className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-40">
        <Link
          href="/insights"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-black/55 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          All Blog
        </Link>

        <header>
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            {post.pillar}
          </div>
          <h1 className="max-w-[1050px] text-[clamp(3.2rem,8vw,7.75rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
            {post.title}
          </h1>

          <div className="mt-10 flex flex-col gap-5 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                D
              </div>
              <div>
                <div className="text-sm font-semibold">{post.author || blogAuthor.name}</div>
                <div className="text-xs text-black/45">{blogAuthor.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-black/50">
              <span>{formatDate(post.date)}</span>
              <span className="text-black/20">/</span>
              <span>{post.readTime} read</span>
            </div>
          </div>
        </header>

        <div className="relative mt-10 aspect-[16/8.5] min-h-[320px] overflow-hidden rounded-[18px] bg-neutral-100 md:mt-14">
          <Image
            src={coverFor(post)}
            alt={post.coverAlt || post.title}
            fill
            priority
            sizes="(max-width: 1180px) 100vw, 1180px"
            className="object-cover"
          />
        </div>

        <div className="mx-auto mt-12 max-w-[760px] md:mt-16">
          <p className="mb-12 text-2xl leading-[1.45] tracking-[-0.02em] text-black/70 md:text-3xl">
            {post.description}
          </p>
          <BlogContent content={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-black/10 bg-[#f7f7f5]">
          <div className="mx-auto max-w-[1180px] px-5 py-20 md:px-8 md:py-28">
            <h2 className="mb-10 text-5xl font-semibold tracking-[-0.055em] md:text-7xl">More Posts</h2>
            <div className="grid gap-12 md:grid-cols-2">
              {related.map((item) => (
                <Link key={item.slug} href={`/insights/${item.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-neutral-200">
                    <Image
                      src={coverFor(item)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{item.pillar}</div>
                  <h3 className="mt-2 text-3xl font-medium leading-[1.08] tracking-[-0.04em] group-hover:underline">{item.title}</h3>
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

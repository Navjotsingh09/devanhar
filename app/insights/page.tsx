import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { blogAuthor, getBlogCoverImage } from "@/lib/blog-presentation"
import { getUploadedBlogCovers } from "@/lib/blog-images"
import { getPublishedBlogPosts } from "@/lib/blog-db"

export const metadata: Metadata = {
  title: "Blog - Devanhaar",
  description:
    "Stories, updates and ideas from Devanhaar across education, empowerment, community and Sikh youth development.",
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function InsightsPage() {
  const [uploadedCovers, posts] = await Promise.all([getUploadedBlogCovers(), getPublishedBlogPosts()])
  const coverFor = (post: (typeof posts)[number]) => post.coverImage || uploadedCovers[post.slug] || getBlogCoverImage(post.slug)
  const [heroPost, ...morePosts] = posts

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-40">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-12">
          <h1 className="text-[clamp(4.25rem,10vw,8.5rem)] font-semibold leading-[0.82] tracking-[-0.07em]">
            Blog.
          </h1>
          <p className="hidden max-w-xs pb-2 text-right text-sm leading-relaxed text-black/55 md:block">
            Stories, ideas and updates from the Devanhaar community.
          </p>
        </div>

        {heroPost && (
          <article className="mb-24 md:mb-32">
            <Link href={`/insights/${heroPost.slug}`} className="group block">
              <div className="relative aspect-[16/8.5] min-h-[300px] overflow-hidden rounded-[18px] bg-neutral-100">
                <Image
                  src={coverFor(heroPost)}
                  alt={heroPost.title}
                  fill
                  priority
                  sizes="(max-width: 1180px) 100vw, 1180px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </Link>

            <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-16">
              <div>
                <Link href={`/insights/${heroPost.slug}`} className="group inline-block">
                  <h2 className="text-4xl font-medium leading-[1.02] tracking-[-0.045em] transition-opacity group-hover:opacity-65 md:text-6xl">
                    {heroPost.title}
                  </h2>
                </Link>
                <p className="mt-4 text-sm text-black/45">{formatDate(heroPost.date)}</p>
              </div>

              <div className="md:pt-1">
                <p className="max-w-xl text-lg leading-relaxed text-black/75">
                  {heroPost.description}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    D
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{heroPost.author || blogAuthor.name}</div>
                    <div className="text-xs text-black/45">{heroPost.readTime} read</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        <section>
          <div className="mb-9 flex items-end justify-between border-b border-black/10 pb-5">
            <h2 className="text-5xl font-semibold tracking-[-0.055em] md:text-7xl">More Posts</h2>
            <span className="pb-1 text-sm text-black/45">{morePosts.length} stories</span>
          </div>

          <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 md:gap-x-14 md:gap-y-24">
            {morePosts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/insights/${post.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-neutral-100">
                    <Image
                      src={coverFor(post)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    />
                  </div>
                </Link>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.14em] text-black/40">
                    <span>{post.pillar}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link href={`/insights/${post.slug}`} className="inline-flex items-start gap-2">
                    <h3 className="text-3xl font-medium leading-[1.08] tracking-[-0.04em] group-hover:underline md:text-[2.1rem]">
                      {post.title}
                    </h3>
                    <ArrowUpRight className="mt-1.5 h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  <p className="mt-3 text-sm text-black/45">{formatDate(post.date)}</p>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-black/65">
                    {post.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2.5 text-sm font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] text-white">D</div>
                    <span>{post.author || blogAuthor.name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <FooterSection />
    </main>
  )
}

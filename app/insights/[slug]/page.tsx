import { InsightContent } from '@/components/cms/insight-content'
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllSlugs } from "@/lib/blog"
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

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  const [uploadedCovers, publishedPosts] = await Promise.all([getUploadedBlogCovers(), getPublishedBlogPosts()])

  const related = publishedPosts.filter((item) => item.slug !== post.slug).slice(0, 2)

  return <InsightContent post={post} related={related} uploadedCovers={uploadedCovers} />
}

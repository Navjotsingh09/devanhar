import {parseArticleMetadata} from '@/lib/blog-metadata'
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
  const seo=parseArticleMetadata(post.metadata)
  return {title:seo.seoTitle||`${post.title} - Devanhaar Blog`,description:seo.seoDescription||post.description,robots:{index:!seo.noIndex,follow:!seo.noIndex},openGraph:{type:'article',title:seo.socialTitle||seo.seoTitle||post.title,description:seo.socialDescription||seo.seoDescription||post.description,images:seo.socialImage?[seo.socialImage]:post.coverImage?[post.coverImage]:[]}}
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

  const related = publishedPosts.filter((item) => item.slug !== post.slug).sort((a,b)=>Number(!!b.metadata?.featured)-Number(!!a.metadata?.featured)).slice(0, 2)

  return <InsightContent post={post} related={related} uploadedCovers={uploadedCovers} />
}

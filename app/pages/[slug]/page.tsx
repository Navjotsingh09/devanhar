import { getPublishedBlogPosts } from '@/lib/blog-db'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { CmsPageRenderer } from '@/components/cms/page-renderer'
import { getPublishedPageContent } from '@/lib/cms/page-server'
import { pageMetadata } from '@/lib/cms/seo'
export const dynamic = 'force-dynamic'
const published = cache((slug: string) => getPublishedPageContent(`page-${slug}`))
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const content = await published((await params).slug)
  if (!content) return { title: 'Page not found', robots: { index: false } }
  return pageMetadata(content.seo)
}
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const content = await published((await params).slug)
  if (!content) notFound()
  return <CmsPageRenderer content={content} posts={await getPublishedBlogPosts()} />
}

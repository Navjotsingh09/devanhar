import { getPublishedBlogPosts } from '@/lib/blog-db'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { CmsPageRenderer } from '@/components/cms/page-renderer'
import { getPublishedPageContent } from '@/lib/cms/page-server'
export const dynamic = 'force-dynamic'
const published = cache((slug: string) => getPublishedPageContent(`page-${slug}`))
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const content = await published((await params).slug)
  if (!content||content.visibility==='hidden') return { title: 'Page not found', robots: { index: false } }
  return { title: content.seo.title, description: content.seo.description, robots: { index: !content.seo.noIndex, follow: !content.seo.noIndex } }
}
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const content = await published((await params).slug)
  if (!content||content.visibility==='hidden') notFound()
  return <CmsPageRenderer content={content} posts={await getPublishedBlogPosts()} />
}

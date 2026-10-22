import { getPublishedBlogPosts } from '@/lib/blog-db'
import { cache } from 'react'
import { getOpenRegistrationOpportunities } from '@/lib/open-registration-opportunities'
import { CmsPageRenderer } from '@/components/cms/page-renderer'
import { getPublishedPageContent } from '@/lib/cms/page-server'
import { defaultHomeContent } from '@/lib/cms/page-content'
export const dynamic = 'force-dynamic'
const publishedHome = cache(async () => await getPublishedPageContent('home') ?? defaultHomeContent)
export async function generateMetadata() {
  const content = await publishedHome()
  return { title: content.seo.title, description: content.seo.description, robots: { index: !content.seo.noIndex, follow: !content.seo.noIndex } }
}
export default async function Page() {
  const [content, opportunities, posts] = await Promise.all([publishedHome(), getOpenRegistrationOpportunities().catch(() => []), getPublishedBlogPosts()])
  return <CmsPageRenderer content={content} opportunities={opportunities} posts={posts} />
}

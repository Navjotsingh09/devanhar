import { getPublishedBlogPosts } from '@/lib/blog-db'
import { CmsPageRenderer } from '@/components/cms/page-renderer'
import { getPageEditorState, CmsError } from '@/lib/cms/page-server'
import { getOpenRegistrationOpportunities } from '@/lib/open-registration-opportunities'
import { redirect, notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Saved draft preview', robots: { index: false, follow: false } }
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let state
  try { state = await getPageEditorState(slug) }
  catch (error) { if (error instanceof CmsError && error.status === 401) redirect('/auth/login'); notFound() }
  const opportunities = slug === 'home' ? await getOpenRegistrationOpportunities().catch(() => []) : []
  const posts = await getPublishedBlogPosts()
  return <CmsPageRenderer content={state.content} opportunities={opportunities} posts={posts} />
}

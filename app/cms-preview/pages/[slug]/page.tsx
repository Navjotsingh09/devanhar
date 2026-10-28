import {createElement} from 'react'
import {pageContentCopy} from '@/lib/cms/copy-schema'
import {migratedPageLoaders} from '@/lib/cms/migrated-page-loaders'
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
  if(slug==='content-khalsa-catalyst')return <CmsPageRenderer content={state.content}/>
  if(slug in migratedPageLoaders){const module=await migratedPageLoaders[slug as keyof typeof migratedPageLoaders]();return createElement(module.default as React.ComponentType<any>,{cmsCopy:pageContentCopy(state.content),params:Promise.resolve({}),searchParams:Promise.resolve({})})}
  const opportunities = slug === 'home' ? await getOpenRegistrationOpportunities().catch(() => []) : []
  const posts = await getPublishedBlogPosts()
  return <CmsPageRenderer content={state.content} opportunities={opportunities} posts={posts} />
}

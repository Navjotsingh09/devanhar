import { notFound, redirect } from 'next/navigation'
import { getBlogStaff } from '@/lib/blog-staff-server'
import { getDashboardBlogPostBySlug } from '@/lib/blog-db'
import { InsightContent } from '@/components/cms/insight-content'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Article draft preview', robots: { index: false, follow: false } }
export default async function Preview({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params
  const { user, allowed } = await getBlogStaff(slug)
  if (!user) redirect('/auth/login')
  if (!allowed) notFound()
  const post = await getDashboardBlogPostBySlug(slug)
  if (!post || post.archived) notFound()
  return <InsightContent post={post} />
}

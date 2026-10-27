import {getBlogStaff,getArticleProjects} from '@/lib/blog-staff-server'
import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/dashboard/blog-editor"
import { getDashboardBlogPostBySlug, getDashboardBlogHistory } from "@/lib/blog-db"

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const staff=await getBlogStaff(slug);if(!staff.allowed)notFound()
  const projects=await getArticleProjects(staff.client,staff.isGlobal,staff.user!.id)
  const post = await getDashboardBlogPostBySlug(slug)
  if (!post || post.archived) notFound()
  const history=post.id?await getDashboardBlogHistory(post.id):[]
  return <BlogEditor permissions={staff.permissions} projects={projects} isGlobal={staff.isGlobal} metadataEnabled={post.metadataAvailable===true} key={post.updatedAt} initialPost={post} history={history.map(revision=>({...revision,isCurrentDraft:revision.id===post.draftId}))} />
}

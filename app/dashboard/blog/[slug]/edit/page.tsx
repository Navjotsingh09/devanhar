import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/dashboard/blog-editor"
import { getDashboardBlogPostBySlug, getDashboardBlogHistory } from "@/lib/blog-db"

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getDashboardBlogPostBySlug(slug)
  if (!post || post.archived) notFound()
  const history=post.id?await getDashboardBlogHistory(post.id):[]
  return <BlogEditor key={post.updatedAt} initialPost={post} history={history.map(revision=>({...revision,isCurrentDraft:revision.id===post.draftId}))} />
}

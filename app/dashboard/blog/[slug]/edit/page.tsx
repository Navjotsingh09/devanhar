import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/dashboard/blog-editor"
import { getDashboardBlogPostBySlug } from "@/lib/blog-db"

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getDashboardBlogPostBySlug(slug)
  if (!post) notFound()
  return <BlogEditor initialPost={post} />
}

import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/dashboard/blog-editor"
import { getPostBySlug } from "@/lib/blog"

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()
  return <BlogEditor initialPost={{ ...post, author: "Devanhaar", tags: [post.pillar], status: "published" }} />
}

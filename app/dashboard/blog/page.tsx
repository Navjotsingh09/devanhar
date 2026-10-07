import { blogPosts } from "@/lib/blog"
import { BlogManager } from "@/components/dashboard/blog-manager"

export default function DashboardBlogPage() {
  return <BlogManager initialPosts={blogPosts.map((post) => ({ ...post, author: "Devanhaar", tags: [post.pillar], status: "published" as const }))} />
}

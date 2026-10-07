import { BlogManager } from "@/components/dashboard/blog-manager"
import { getDashboardBlogPosts } from "@/lib/blog-db"

export default async function DashboardBlogPage() {
  const posts = await getDashboardBlogPosts()
  return <BlogManager initialPosts={posts} />
}

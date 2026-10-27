import {getBlogStaff} from '@/lib/blog-staff-server'
import { BlogManager } from "@/components/dashboard/blog-manager"
import { getDashboardBlogPosts } from "@/lib/blog-db"

export default async function DashboardBlogPage() {
  const staff=await getBlogStaff();if(!staff.allowed)return <p role="alert">Insights are not assigned to your account.</p>
  const posts = await getDashboardBlogPosts()
  return <BlogManager initialPosts={posts} canCreate={staff.permissions.create} canArchive={staff.isGlobal} />
}

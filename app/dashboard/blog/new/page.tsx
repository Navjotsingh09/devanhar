import {getBlogStaff,getArticleProjects} from '@/lib/blog-staff-server'
import {articleMetadataEnabled} from '@/lib/blog-draft-content'
import {redirect} from 'next/navigation'
import { BlogEditor } from "@/components/dashboard/blog-editor"

export default async function NewBlogPostPage() {
  const staff=await getBlogStaff();if(!staff.user)redirect("/auth/login");if(!staff.allowed||!staff.permissions.create)return <p role="alert">Your account cannot create articles.</p>
  const projects=await getArticleProjects(staff.client,staff.isGlobal,staff.user!.id)
  const metadataEnabled=await articleMetadataEnabled(staff.client)
  return <BlogEditor metadataEnabled={metadataEnabled} projects={projects} isGlobal={staff.isGlobal} />
}

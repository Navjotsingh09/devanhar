import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { AssignmentManager } from '@/components/cms/assignment-manager'
export default async function ContentAssignments() {
 const {client,user,authError,profile,grants}=await getRequestStaff()
 if(authError||!user)redirect('/auth/login')
 if(profile.error||grants.error||!Array.isArray(grants.data)||!['admin','super_admin'].includes(profile.data?.role||''))redirect('/dashboard/website')
 const [pages,users,assignments]=await Promise.all([
  client.from('cms_pages').select('id,slug').order('slug').limit(500),
  client.from('admin_profiles').select('id,full_name').eq('role','content_manager').order('full_name').limit(500),
  client.from('cms_page_assignments').select('page_id,user_id,can_view,can_edit,can_publish').limit(1000),
 ])
 if(pages.error||users.error||assignments.error)throw new Error('Content assignments could not be loaded')
 return <div className="space-y-6"><header><Link href="/dashboard/website" className="text-sm underline">Website & content</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">Content assignments</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Delegate access to a website page. Changes apply to the editor, preview and publishing API. Programme operations remain separate.</p></header><AssignmentManager pages={pages.data||[]} users={users.data||[]} assignments={assignments.data||[]} /></div>
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {cmsService} from '@/lib/cms/service'
import { UsersClient } from '@/components/dashboard/users-client'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check admin access
  const { data: currentProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin' && currentProfile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Fetch all users (capped at 500 - safety net; admin team is small)
  const roster=await supabase.rpc('cms_staff_roster')
  let profiles=roster.data,canDeactivate=!roster.error
  if(roster.error){
    const[rows,users,grants]=await Promise.all([
      supabase.from('admin_profiles').select('id,full_name,role,created_at').order('created_at'),
      cmsService().auth.admin.listUsers({page:1,perPage:1000}),
      supabase.from('staff_programme_access').select('user_id,programme'),
    ])
    if(rows.error||users.error||grants.error)throw new Error('Staff accounts could not be loaded. Please retry.')
    profiles=(rows.data??[]).map(row=>{const account=users.data.users.find(u=>u.id===row.id);return{...row,email:account?.email,email_confirmed:!!account?.email_confirmed_at,programmes:(grants.data??[]).filter(g=>g.user_id===row.id).map(g=>g.programme),disabled:row.role==='disabled'}})
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage staff access levels and permissions</p>
      </div>

      <UsersClient profiles={profiles ?? []} currentUserId={user.id} currentRole={currentProfile.role} canDeactivate={canDeactivate} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
  const { data: profiles } = await supabase
    .from('admin_profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: true })
    .limit(500)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage staff access levels and permissions</p>
      </div>

      <UsersClient profiles={profiles ?? []} currentUserId={user.id} />
    </div>
  )
}

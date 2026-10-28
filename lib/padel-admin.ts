import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** The dedicated SPA workspace is limited to active SPA memberships.
 * General Devanhaar staff and super-admin profiles do not grant SPA access.
 * Never authorise from user-editable auth metadata or email alone.
 */
export async function checkPadelStaffAccess() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: membership, error } = await supabase
    .from('spa_members')
    .select('user_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('role', 'super_admin')
    .maybeSingle()

  if (error || !membership) return null
  return supabase
}

export async function requirePadelStaff() {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) redirect('/spa-admin/login?error=access_denied')
  return supabase
}

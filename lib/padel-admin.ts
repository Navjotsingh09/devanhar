import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * SPA membership is an independent authorisation grant.
 * Organisers are not required to have a general admin_profiles record.
 * General staff access remains scoped by staff_programme_access.
 */
export async function checkPadelStaffAccess() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: membership, error: memberError } = await supabase
    .from('spa_members')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  // Deny on query errors instead of treating an unavailable membership
  // table as proof that someone lacks SPA permissions.
  if (memberError) return null
  if (membership) return supabase

  const [{ data: profile, error: profileError }, { data: grants, error: grantsError }] = await Promise.all([
    supabase.from('admin_profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('staff_programme_access').select('programme').eq('user_id', user.id),
  ])

  if (profileError || grantsError || !Array.isArray(grants)) return null
  if (!profile || !['staff', 'admin', 'super_admin'].includes(profile.role)) return null
  // Scoped staff cannot access unrelated programmes. Global admins retain
  // admin access; a regular staff user must have no programme restrictions.
  if (grants.length > 0 && !['admin', 'super_admin'].includes(profile.role)) return null
  return supabase
}

export async function requirePadelStaff() {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) redirect('/spa-admin/login?error=access_denied')
  return supabase
}

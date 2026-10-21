import { getRequestStaff } from "@/lib/crm/request-staff"
import { redirect } from "next/navigation"

/**
 * Authenticated SPA staff access. Never use the public anon or service-role
 * client for an admin mutation. Roles are sourced from admin_profiles, not
 * from user-controlled metadata.
 */
export async function requirePadelStaff() {
  const { client: supabase, user, authError: userError, profile: profileResult, grants } = await getRequestStaff()
  if (userError || !user) redirect("/spa-admin/login")
  if (grants.error || !Array.isArray(grants.data) || grants.data.length) redirect('/auth/spa-access')
  const { data: profile, error: profileError } = profileResult

  if (profileError || !profile || !["staff", "admin", "super_admin"].includes(profile.role)) {
    const { data: membership } = await supabase.from('spa_members')
      .select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle()
    if (!membership) redirect('/spa-admin/login?error=access_denied')
  }

  return supabase
}

export async function checkPadelStaffAccess() {
  const { client: supabase, user, authError: userError, profile: profileResult, grants } = await getRequestStaff()
  if (userError || !user || grants.error || !Array.isArray(grants.data) || grants.data.length) return null
  const { data: profile, error: profileError } = profileResult

  if (profileError || !profile || !["staff", "admin", "super_admin"].includes(profile.role)) {
    const { data: membership } = await supabase.from('spa_members')
      .select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle()
    if (!membership) return null
  }
  return supabase
}

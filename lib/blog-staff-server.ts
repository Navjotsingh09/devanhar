import 'server-only'
import { createClient } from '@/lib/supabase/server'

/** Keep blog mutation access aligned with the general staff dashboard.
 * Programme assignments restrict an account even when its profile says admin.
 * Database/authentication failures must never grant service-role access.
 */
export async function getBlogStaff() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { user: null, allowed: false }

  const [profile, grants] = await Promise.all([
    supabase.from('admin_profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('staff_programme_access').select('programme').eq('user_id', user.id),
  ])

  const allowed = !profile.error && !grants.error
    && !!profile.data
    && ['staff', 'admin', 'super_admin'].includes(profile.data.role)
    && Array.isArray(grants.data)
    && grants.data.length === 0

  return { user, allowed }
}

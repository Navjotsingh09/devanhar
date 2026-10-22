import 'server-only'
import { createClient } from '@/lib/supabase/server'

/** Existing general CRM roles are retained; CMS permissions never imply CRM access. */
export async function requireSubmissionAccess(source?: string, id?: string) {
  if (source && !['form_submissions', 'camp_applications', 'vidyala_applications', 'padel_registrations', 'spn_submissions', 'register_interest'].includes(source)) throw new Error('Invalid submission source')
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')
  const [profile, grants] = await Promise.all([
    supabase.from('admin_profiles').select('role').eq('id', user.id).single(),
    supabase.from('staff_programme_access').select('programme').eq('user_id', user.id),
  ])
  if (profile.error || grants.error || !profile.data || !Array.isArray(grants.data)) throw new Error('Unable to verify account access')
  const programmes = grants.data.map((row: { programme: string }) => row.programme)
  if (['admin','super_admin'].includes(profile.data.role) || (!programmes.length && profile.data.role === 'staff')) return { supabase, user }
  // Preserve the existing Vidyala-only row actions without opening the global CRM.
  if (programmes.includes('vidyala') && id && source === 'vidyala_applications') return { supabase, user }
  if (programmes.includes('vidyala') && id && source === 'register_interest') {
    const result = await supabase.from('register_interest').select('camp').eq('id', id).maybeSingle()
    if (!result.error && ['vidyala-interest', 'vidyala-webinar'].includes(result.data?.camp || '')) return { supabase, user }
  }
  throw new Error('Your account does not have access to this section')
}

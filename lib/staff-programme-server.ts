import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type StaffProgramme } from '@/lib/staff-programme-access'
export async function requireProgramme(programme: StaffProgramme) {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) redirect('/auth/login')
 const { data, error } = await supabase.from('staff_programme_access').select('programme').eq('user_id',user.id).eq('programme',programme).maybeSingle()
 if (error || !data) redirect('/dashboard')
 return supabase
}

export async function requireGeneralStaff() {
 const supabase = await createClient()
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 if (authError || !user) throw new Error('Unauthorized')
 const [profile,grants] = await Promise.all([
  supabase.from('admin_profiles').select('role').eq('id',user.id).single(),
  supabase.from('staff_programme_access').select('programme').eq('user_id',user.id)
 ])
 if (profile.error || !profile.data || !['staff','admin','super_admin'].includes(profile.data.role) || grants.error || !Array.isArray(grants.data) || grants.data.length) throw new Error('Your account does not have access to this section')
 return supabase
}

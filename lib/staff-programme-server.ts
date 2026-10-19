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

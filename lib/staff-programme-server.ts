import 'server-only'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type StaffProgramme } from '@/lib/staff-programme-access'
export async function requireProgramme(programme: StaffProgramme) {
 const { client: supabase, user, authError, profile, grants } = await getRequestStaff()
 if (authError || !user) redirect('/auth/login')
 if (profile.error || !profile.data || grants.error || !Array.isArray(grants.data)) redirect('/auth/login?error=access_check_failed')
 if (!['admin','super_admin'].includes(profile.data.role) && !grants.data.some(row => row.programme === programme)) redirect('/dashboard')
 return supabase
}

export async function requireGeneralStaff() {
 const { client: supabase, user, authError, profile, grants } = await getRequestStaff()
 if (authError || !user) throw new Error('Unauthorized')
 if (profile.error || !profile.data || !['staff','admin','super_admin'].includes(profile.data.role) || grants.error || !Array.isArray(grants.data) || (grants.data.length && !['admin','super_admin'].includes(profile.data.role))) throw new Error('Your account does not have access to this section')
 return supabase
}

/** Check Roots scope before every operational or service-role read. */
export async function requireRootsStaff() {
 const {client,user,authError,profile,grants}=await getRequestStaff()
 if(authError||!user)throw new Error('Unauthorized')
 if(profile.error||!profile.data||!['staff','admin','super_admin'].includes(profile.data.role)||grants.error||!Array.isArray(grants.data))throw new Error('Unable to verify Roots access')
 if(!['admin','super_admin'].includes(profile.data.role)&&grants.data.length&&!grants.data.some(row=>row.programme==='roots'))throw new Error('Your account does not have Roots access')
 return client
}

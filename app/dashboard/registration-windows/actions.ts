'use server'

import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveRegistrationWindow(id: string, form: FormData) {
  const supabase = await requireGeneralStaff()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in')
  const { data: profile } = await supabase.from('admin_profiles').select('role').eq('id', user.id).single()
  if (!profile || !['staff', 'admin', 'super_admin'].includes(profile.role)) throw new Error('Only Devanhaar staff can update registration availability')
  const parseTime = (key: string) => {
    const value = String(form.get(key) || '').trim()
    if (!value) return null
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Invalid registration time')
    const parsed = new Date(`${value}Z`)
    if (!Number.isFinite(parsed.getTime())) throw new Error('Invalid registration time')
    return parsed.toISOString()
  }
  const opens_at = parseTime('opens_at')
  const closes_at = parseTime('closes_at')
  if (opens_at && closes_at && closes_at <= opens_at) throw new Error('Closing time must be after opening time')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Registration settings are unavailable')
  const admin = createAdminClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await admin.from('registration_windows').update({ is_open: form.get('is_open') === 'on', opens_at, closes_at, updated_at: new Date().toISOString() }).eq('id', id).select('id').single()
  if (error || !data) throw new Error('Registration settings could not be saved')
  revalidatePath('/')
  revalidatePath('/dashboard/registration-windows')
  redirect('/dashboard/registration-windows?saved=1')
}

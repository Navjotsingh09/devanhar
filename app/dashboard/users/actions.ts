'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: 'super_admin' | 'admin' | 'staff' | 'vacancies_only' | 'content_manager') {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Please sign in again')
  if (!['super_admin','admin','staff','vacancies_only','content_manager'].includes(newRole)) throw new Error('Invalid role')
  const { error } = await supabase.rpc('staff_update_profile', { p_target: userId, p_role: newRole })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/users')
}

export async function updateUserName(userId: string, fullName: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Please sign in again')
  const { error } = await supabase.rpc('staff_update_profile', { p_target: userId, p_name: fullName.trim() })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/users')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPadelStaffAccess } from '@/lib/padel-admin'
import { redirect } from 'next/navigation'

export async function signInToSpa(_state: { error: string }, form: FormData) {
  const email = String(form.get('email') || '').trim().toLowerCase()
  const password = String(form.get('password') || '')
  if (!email || !password) return { error: 'Enter your email and password' }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Email or password was not accepted' }
  if (!await checkPadelStaffAccess(supabase)) {
    await supabase.auth.signOut()
    return { error: 'Your account does not have SPA organiser access. Contact the SPA team.' }
  }
  redirect('/spa-admin')
}

export async function signOutOfSpa() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/spa-admin/login')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createServiceClient(url, key, { auth: { persistSession: false } })
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'staff' | 'vacancies_only') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Only admins can change roles
  const { data: currentProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin' && currentProfile?.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  // Prevent changing own role
  if (userId === user.id) {
    throw new Error('Cannot change your own role')
  }

  const { error } = await supabase
    .from('admin_profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  // Sync role to auth app_metadata so middleware can enforce it without a DB query
  const serviceClient = getServiceClient()
  await serviceClient.auth.admin.updateUserById(userId, {
    app_metadata: { role: newRole },
  })

  // Log activity
  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Changed user role to ${newRole}`,
    entity_type: 'admin_profile',
    entity_id: userId,
  })

  revalidatePath('/dashboard/users')
}

export async function updateUserName(userId: string, fullName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: currentProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin' && currentProfile?.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase
    .from('admin_profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/users')
}

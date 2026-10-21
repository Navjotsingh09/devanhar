import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/** Share verified account reads only within one Server Component render.
 * React invalidates this cache between requests. Never use a persistent cache
 * for users, grants or the cookie-bound client. Actions/API calls still read fresh.
 */
export const getRequestStaff = cache(async () => {
  const client = await createClient()
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) return { client, user: null, authError, profile: { data: null, error: null }, grants: { data: null, error: null } }
  const [profile, grants] = await Promise.all([
    client.from('admin_profiles').select('full_name, role').eq('id', user.id).single(),
    client.from('staff_programme_access').select('programme').eq('user_id', user.id),
  ])
  return { client, user, authError: null, profile, grants }
})

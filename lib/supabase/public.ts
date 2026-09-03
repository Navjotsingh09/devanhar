import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Public read-only client for anonymous visitors on the leaderboard/profile pages.
export function getPublicSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

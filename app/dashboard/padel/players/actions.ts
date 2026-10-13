'use server'

import { checkPadelStaffAccess } from '@/lib/padel-admin'
import { revalidatePath } from 'next/cache'

type PlayerInput = {
  first_name: string
  last_name: string
  photo_url?: string | null
  gender?: string | null
  city_country?: string | null
  country_code?: string | null
}

// Next.js redacts thrown Server Action error messages in production (replaced
// with a generic digest message) — return { error } instead so the real
// message reaches the client.
type ActionResult = { error: string } | { success: true }

export async function createPlayer(input: PlayerInput): Promise<ActionResult> {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA staff may modify players' }

  if (!input.first_name.trim()) {
    return { error: 'A player name is required' }
  }
  const country = (input.country_code || 'GB').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) return { error: 'Nationality must be a valid two-letter ISO code' }

  const { error } = await supabase.from('padel_players').insert({
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    photo_url: input.photo_url || null,
    gender: input.gender || null,
    city_country: input.city_country || null,
    country_code: country,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/dashboard/padel')
  revalidatePath('/initiatives/sikh-padel-association')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  revalidatePath('/spa/leaderboard')
  revalidatePath('/dashboard/padel/rankings')
  revalidatePath('/dashboard/padel/identities')
  return { success: true }
}

export async function updatePlayer(playerId: string, input: PlayerInput): Promise<ActionResult> {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA staff may modify players' }

  if (!input.first_name.trim()) {
    return { error: 'A player name is required' }
  }
  const country = (input.country_code || 'GB').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) return { error: 'Nationality must be a valid two-letter ISO code' }

  const { error } = await supabase
    .from('padel_players')
    .update({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      photo_url: input.photo_url || null,
      gender: input.gender || null,
      city_country: input.city_country || null,
      country_code: country,
      updated_at: new Date().toISOString(),
    })
    .eq('id', playerId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/dashboard/padel')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  revalidatePath('/spa/leaderboard')
  revalidatePath('/dashboard/padel/rankings')
  revalidatePath('/dashboard/padel/identities')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard/' + playerId)
  return { success: true }
}

export async function setPlayerActive(playerId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA staff may modify players' }

  const { error } = await supabase
    .from('padel_players')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', playerId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/dashboard/padel')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  revalidatePath('/spa/leaderboard')
  revalidatePath('/dashboard/padel/rankings')
  revalidatePath('/dashboard/padel/identities')
  return { success: true }
}

export async function deletePlayer(playerId: string): Promise<ActionResult> {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA staff may modify players' }

  const { count } = await supabase
    .from('padel_tournament_results')
    .select('id', { count: 'exact', head: true })
    .eq('player_id', playerId)
  if (count && count > 0) {
    return { error: 'This player has tournament results on record. Deactivate them instead of deleting.' }
  }

  const { error } = await supabase.from('padel_players').delete().eq('id', playerId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/dashboard/padel')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  revalidatePath('/spa/leaderboard')
  revalidatePath('/dashboard/padel/rankings')
  revalidatePath('/dashboard/padel/identities')
  return { success: true }
}

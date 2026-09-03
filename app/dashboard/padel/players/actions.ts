'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type PlayerInput = {
  first_name: string
  last_name: string
  photo_url?: string | null
  gender?: string | null
  city_country?: string | null
}

export async function createPlayer(input: PlayerInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  if (!input.first_name.trim() || !input.last_name.trim()) {
    throw new Error('First and last name are required')
  }

  const { error } = await supabase.from('padel_players').insert({
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    photo_url: input.photo_url || null,
    gender: input.gender || null,
    city_country: input.city_country || null,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
}

export async function updatePlayer(playerId: string, input: PlayerInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  if (!input.first_name.trim() || !input.last_name.trim()) {
    throw new Error('First and last name are required')
  }

  const { error } = await supabase
    .from('padel_players')
    .update({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      photo_url: input.photo_url || null,
      gender: input.gender || null,
      city_country: input.city_country || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', playerId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard/' + playerId)
}

export async function setPlayerActive(playerId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('padel_players')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', playerId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  const { count } = await supabase
    .from('padel_tournament_results')
    .select('id', { count: 'exact', head: true })
    .eq('player_id', playerId)
  if (count && count > 0) {
    throw new Error('This player has tournament results on record. Deactivate them instead of deleting.')
  }

  const { error } = await supabase.from('padel_players').delete().eq('id', playerId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/players')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
}

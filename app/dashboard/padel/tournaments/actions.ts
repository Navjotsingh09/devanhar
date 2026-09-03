'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { FINISHING_POSITIONS } from '@/lib/padel-ranking'

type TournamentInput = {
  name: string
  event_date: string
  category?: string | null
  applicable_stages: string[]
}

const VALID_STAGES = new Set(FINISHING_POSITIONS.map((p) => p.value))

function validateStages(stages: string[]) {
  const filtered = stages.filter((s) => VALID_STAGES.has(s as never))
  if (filtered.length === 0) throw new Error('Select at least one finishing-position stage')
  return filtered
}

export async function createTournament(input: TournamentInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  if (!input.name.trim() || !input.event_date) {
    throw new Error('Name and event date are required')
  }

  const { error } = await supabase.from('padel_tournaments').insert({
    name: input.name.trim(),
    event_date: input.event_date,
    category: input.category || null,
    applicable_stages: validateStages(input.applicable_stages),
  })
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
}

export async function updateTournament(tournamentId: string, input: TournamentInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  if (!input.name.trim() || !input.event_date) {
    throw new Error('Name and event date are required')
  }

  const { error } = await supabase
    .from('padel_tournaments')
    .update({
      name: input.name.trim(),
      event_date: input.event_date,
      category: input.category || null,
      applicable_stages: validateStages(input.applicable_stages),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
  revalidatePath('/dashboard/padel/tournaments/' + tournamentId + '/results')
}

export async function deleteTournament(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) throw new Error('Unauthorized')

  const { error } = await supabase.from('padel_tournaments').delete().eq('id', tournamentId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
}

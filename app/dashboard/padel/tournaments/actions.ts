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

type ActionResult = { error: string } | { success: true }

const VALID_STAGES = new Set(FINISHING_POSITIONS.map((p) => p.value))

function validateStages(stages: string[]): { stages: string[] } | { error: string } {
  const filtered = stages.filter((s) => VALID_STAGES.has(s as never))
  if (filtered.length === 0) return { error: 'Select at least one finishing-position stage' }
  return { stages: filtered }
}

export async function createTournament(input: TournamentInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }

  if (!input.name.trim() || !input.event_date) {
    return { error: 'Name and event date are required' }
  }

  const stagesResult = validateStages(input.applicable_stages)
  if ('error' in stagesResult) return stagesResult

  const { error } = await supabase.from('padel_tournaments').insert({
    name: input.name.trim(),
    event_date: input.event_date,
    category: input.category || null,
    applicable_stages: stagesResult.stages,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
  return { success: true }
}

export async function updateTournament(tournamentId: string, input: TournamentInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }

  if (!input.name.trim() || !input.event_date) {
    return { error: 'Name and event date are required' }
  }

  const stagesResult = validateStages(input.applicable_stages)
  if ('error' in stagesResult) return stagesResult

  const { error } = await supabase
    .from('padel_tournaments')
    .update({
      name: input.name.trim(),
      event_date: input.event_date,
      category: input.category || null,
      applicable_stages: stagesResult.stages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
  revalidatePath('/dashboard/padel/tournaments/' + tournamentId + '/results')
  return { success: true }
}

export async function deleteTournament(tournamentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }

  const { error } = await supabase.from('padel_tournaments').delete().eq('id', tournamentId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  return { success: true }
}

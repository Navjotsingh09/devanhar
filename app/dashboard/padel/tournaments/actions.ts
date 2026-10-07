'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { FINISHING_POSITIONS } from '@/lib/padel-ranking'

type TournamentInput = {
  name: string
  event_date: string
  category?: string | null
  applicable_stages: string[]
  event_time?: string | null
  venue?: string | null
  address?: string | null
  map_url?: string | null
  fee_per_person?: number | null
  public_description?: string | null
  is_public?: boolean
  registration_open?: boolean
}

type ActionResult = { error: string } | { success: true }

const VALID_STAGES = new Set(FINISHING_POSITIONS.map((p) => p.value))

function validateStages(stages: string[]): { stages: string[] } | { error: string } {
  const filtered = stages.filter((s) => VALID_STAGES.has(s as never))
  if (filtered.length === 0) return { error: 'Select at least one finishing-position stage' }
  return { stages: filtered }
}

function clean(input: TournamentInput, stages: string[]) {
  return {
    name: input.name.trim(),
    event_date: input.event_date,
    category: input.category || null,
    applicable_stages: stages,
    event_time: input.event_time?.trim() || null,
    venue: input.venue?.trim() || null,
    address: input.address?.trim() || null,
    map_url: input.map_url?.trim() || null,
    fee_per_person: Number.isFinite(input.fee_per_person) ? input.fee_per_person : 50,
    public_description: input.public_description?.trim() || null,
    is_public: Boolean(input.is_public),
    registration_open: input.registration_open !== false,
  }
}

async function refreshTournamentPages() {
  revalidatePath('/dashboard/padel/tournaments')
  revalidatePath('/dashboard/padel/results')
  revalidatePath('/initiatives/sikh-padel-association')
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

  if (input.is_public) {
    const { error: unpublishError } = await supabase
      .from('padel_tournaments')
      .update({ is_public: false })
      .eq('is_public', true)
    if (unpublishError) return { error: unpublishError.message }
  }

  const { error } = await supabase
    .from('padel_tournaments')
    .insert(clean(input, stagesResult.stages))

  if (error) return { error: error.message }

  await refreshTournamentPages()
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

  if (input.is_public) {
    const { error: unpublishError } = await supabase
      .from('padel_tournaments')
      .update({ is_public: false })
      .eq('is_public', true)
      .neq('id', tournamentId)
    if (unpublishError) return { error: unpublishError.message }
  }

  const { error } = await supabase
    .from('padel_tournaments')
    .update({
      ...clean(input, stagesResult.stages),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId)

  if (error) return { error: error.message }

  await refreshTournamentPages()
  revalidatePath('/dashboard/padel/tournaments/' + tournamentId + '/results')
  return { success: true }
}

export async function deleteTournament(tournamentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user == null) return { error: 'Unauthorized' }

  const { error } = await supabase.from('padel_tournaments').delete().eq('id', tournamentId)
  if (error) return { error: error.message }

  await refreshTournamentPages()
  revalidatePath('/initiatives/sikh-padel-association/leaderboard')
  return { success: true }
}

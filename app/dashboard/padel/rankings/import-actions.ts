'use server'

import { checkPadelStaffAccess } from '@/lib/padel-admin'
import { validateSPAWorkbookImport, type SPAWorkbookImport } from '@/lib/spa-workbook-import'
import { revalidatePath } from 'next/cache'

export async function importSPAWorkbook(payload: SPAWorkbookImport, mapping: Record<string, string>) {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return { error: 'Only authorised SPA organisers may import results' }
  try { validateSPAWorkbookImport(payload) } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid workbook data' }
  }
  const sources = [...new Set(payload.results.map((r) => r.source_tournament_id))]
  if (sources.some((source) => !mapping[source])) return { error: 'Choose an event for every workbook tournament' }
  if (new Set(sources.map((source) => mapping[source])).size !== sources.length) return { error: 'Each workbook tournament must map to a different event' }
  const { data: events, error: eventError } = await supabase.from('padel_tournaments')
    .select('id, applicable_stages').in('id', sources.map((source) => mapping[source]))
  if (eventError || events?.length !== sources.length) return { error: 'One or more selected events are unavailable' }
  const byId = new Map(events.map((event) => [event.id, event]))
  if (payload.results.some((r) => !byId.get(mapping[r.source_tournament_id])?.applicable_stages.includes(r.finishing_position))) return { error: 'A workbook finish is not enabled for its selected event' }
  const { data, error } = await supabase.rpc('import_spa_workbook', { payload, tournament_mapping: mapping })
  if (error) return { error: error.message }
  for (const path of ['/dashboard/padel', '/dashboard/padel/players', '/dashboard/padel/results', '/dashboard/padel/rankings', '/dashboard/padel/identities', '/spa', '/spa/leaderboard', '/spa/tournaments']) revalidatePath(path)
  revalidatePath('/spa-admin', 'layout')
  revalidatePath('/initiatives/sikh-padel-association', 'layout')
  return { success: true, summary: data }
}

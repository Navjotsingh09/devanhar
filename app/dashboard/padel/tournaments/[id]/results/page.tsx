import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PadelResultsEditor } from '@/components/padel/padel-results-editor'

export const dynamic = 'force-dynamic'

export default async function PadelTournamentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: tournament }, { data: players }, { data: results }] = await Promise.all([
    supabase.from('padel_tournaments').select('id, name, event_date, applicable_stages').eq('id', id).single(),
    supabase.from('padel_players').select('id, first_name, last_name').eq('is_active', true).order('first_name'),
    supabase.from('padel_tournament_results').select('*').eq('tournament_id', id),
  ])

  if (!tournament) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{tournament.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign a player (and optional partner) to each finishing position for this tournament.
        </p>
      </div>
      <PadelResultsEditor
        tournamentId={tournament.id}
        applicableStages={tournament.applicable_stages}
        players={players || []}
        existingResults={results || []}
      />
    </div>
  )
}

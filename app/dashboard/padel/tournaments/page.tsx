import { createClient } from '@/lib/supabase/server'
import { PadelTournamentsManager, type PadelTournamentRow } from '@/components/padel/padel-tournaments-manager'

export const dynamic = 'force-dynamic'

async function getTournaments(): Promise<PadelTournamentRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('padel_tournaments')
    .select('id, name, event_date, category, applicable_stages, status')
    .order('event_date', { ascending: false })
  return data || []
}

export default async function PadelTournamentsPage() {
  const tournaments = await getTournaments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Padel Tournaments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create tournaments and choose which finishing-position stages apply to each format.
        </p>
      </div>
      <PadelTournamentsManager tournaments={tournaments} />
    </div>
  )
}

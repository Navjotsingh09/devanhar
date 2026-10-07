import { createClient } from '@/lib/supabase/server'
import { PadelTournamentsManager, type PadelTournamentRow } from '@/components/padel/padel-tournaments-manager'

export const dynamic = 'force-dynamic'

async function getTournaments(): Promise<PadelTournamentRow[]> {
  const supabase = await createClient()

  const full = await supabase
    .from('padel_tournaments')
    .select('id, name, event_date, category, applicable_stages, status, event_time, venue, address, map_url, fee_per_person, public_description, is_public, registration_open')
    .order('event_date', { ascending: false })

  if (!full.error) return full.data || []

  // Backward-compatible fallback before the additive migration is applied.
  const legacy = await supabase
    .from('padel_tournaments')
    .select('id, name, event_date, category, applicable_stages, status')
    .order('event_date', { ascending: false })

  return (legacy.data || []).map((row) => ({
    ...row,
    event_time: null,
    venue: null,
    address: null,
    map_url: null,
    fee_per_person: 50,
    public_description: null,
    is_public: false,
    registration_open: true,
  }))
}

export default async function PadelTournamentsPage() {
  const tournaments = await getTournaments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Padel Tournaments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create tournaments, manage scoring stages, and choose which event is published on the live Sikh Padel Association page.
        </p>
      </div>
      <PadelTournamentsManager tournaments={tournaments} />
    </div>
  )
}

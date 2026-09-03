import { createClient } from '@/lib/supabase/server'
import { PadelPlayersManager, type PadelPlayerRow } from '@/components/padel/padel-players-manager'

export const dynamic = 'force-dynamic'

async function getPlayers(): Promise<PadelPlayerRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('padel_players')
    .select('id, first_name, last_name, photo_url, gender, city_country, is_active, total_points')
    .order('total_points', { ascending: false })
  return data || []
}

export default async function PadelPlayersPage() {
  const players = await getPlayers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Padel Players</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage individual player profiles used across the ranking system.
        </p>
      </div>
      <PadelPlayersManager players={players} />
    </div>
  )
}

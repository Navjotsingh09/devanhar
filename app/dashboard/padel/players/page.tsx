import { requirePadelStaff } from '@/lib/padel-admin'
import { PadelPlayersManager, type PadelPlayerRow } from '@/components/padel/padel-players-manager'

export const dynamic = 'force-dynamic'

async function getPlayers(): Promise<PadelPlayerRow[]> {
  const supabase = await requirePadelStaff()
  const { data, error } = await supabase
    .from('padel_players')
    .select('id, first_name, last_name, photo_url, gender, city_country, country_code, is_active, total_points')
    .order('total_points', { ascending: false })
  if (error) {
    // The migration is an explicit dependency; do not silently hide broken records.
    throw new Error(`SPA player data unavailable: ${error.message}. Check supabase-padel-ranking-v2.sql.`)
  }
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

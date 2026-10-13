import { requirePadelStaff } from '@/lib/padel-admin'
import { PadelPlayersManager, type PadelPlayerRow } from '@/components/padel/padel-players-manager'

export const dynamic = 'force-dynamic'

async function getPlayers() {
  const supabase = await requirePadelStaff()
  const full = await supabase
    .from('padel_players')
    .select('id, first_name, last_name, photo_url, gender, city_country, country_code, is_active, total_points')
    .order('total_points', { ascending: false })

  if (!full.error) return {
    players: (full.data || []) as PadelPlayerRow[],
    migrationReady: true,
    error: null as string | null,
  }

  const legacy = await supabase.from('padel_players')
    .select('id, first_name, last_name, photo_url, gender, city_country, is_active, total_points')
    .order('total_points', { ascending: false })

  return {
    players: (legacy.data || []).map((player) => ({
      ...player, country_code: 'GB',
    })) as PadelPlayerRow[],
    migrationReady: false,
    error: legacy.error?.message || null,
  }
}

export default async function PadelPlayersPage() {
  const { players, migrationReady, error } = await getPlayers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Padel Players</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage player records and nationality used by the six-level ranking engine.
        </p>
      </div>
      {!migrationReady && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>SPA V2 migration is required.</strong> Player editing is temporarily disabled
          to protect existing records. Apply <code>supabase-padel-ranking-v2.sql</code> to the
          correct Supabase project first.
          {error && <p className="mt-2">Database error: {error}</p>}
        </div>
      )}
      <PadelPlayersManager players={players} canEdit={migrationReady} />
    </div>
  )
}

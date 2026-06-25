import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import RunnersAdminTable from '@/components/wolfrun/runners-admin-table'

async function getRunnerStats() {
  const supabase = await createClient()

  const [runnersResult, singhsResult, kaursResult] = await Promise.all([
    supabase
      .from('wolfrun_runners')
      .select('id, first_name, last_name, email, phone, age, city, pack, agree_whatsapp_group, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase
      .from('wolfrun_runners')
      .select('id', { count: 'exact', head: true })
      .eq('pack', 'singhs')
      .eq('status', 'confirmed'),
    supabase
      .from('wolfrun_runners')
      .select('id', { count: 'exact', head: true })
      .eq('pack', 'kaurs')
      .eq('status', 'confirmed'),
  ])

  return {
    runners: runnersResult.data || [],
    totalCount: runnersResult.data?.length ?? 0,
    singhsCount: singhsResult.count ?? 0,
    kaursCount: kaursResult.count ?? 0,
  }
}

export default async function WolfRunRunnersPage() {
  const { runners, totalCount, singhsCount, kaursCount } = await getRunnerStats()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wolf Run Runners</h1>
        <p className="text-muted-foreground">Confirmed entrants for the Wolf Run event</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Singhs Pack</CardTitle>
            <span className="text-lg">🟡</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{singhsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Singhs Camp UK Pack</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kaurs Pack</CardTitle>
            <span className="text-lg">🟣</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{kaursCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Kaurs Camp UK Pack</p>
          </CardContent>
        </Card>
      </div>

      {/* Runners Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Confirmed Runners</h2>
        <RunnersAdminTable runners={runners} />
      </div>
    </div>
  )
}

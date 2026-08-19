import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import RunnersAdminTable from '@/components/wolfrun/runners-admin-table'

type RunnerRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  age: number
  city: string
  pack: string
  agree_whatsapp_group: boolean
  status: string
  created_at: string
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (url === '' || key === '') {
    throw new Error('Missing Supabase environment variables for Wolf Run runners dashboard')
  }

  return createServiceClient(url, key)
}

async function getRunnerStats() {
  const supabase = getSupabaseAdmin()

  const [runnersResult, singhsResult, kaursResult] = await Promise.all([
    supabase
      .from('wolfrun_runners')
      .select('id, first_name, last_name, email, phone, age, city, pack, agree_whatsapp_group, status, created_at')
      .eq('status', 'confirmed')
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

  const error = runnersResult.error || singhsResult.error || kaursResult.error

  return {
    runners: runnersResult.data || [],
    totalCount: runnersResult.data?.length ?? 0,
    singhsCount: singhsResult.count ?? 0,
    kaursCount: kaursResult.count ?? 0,
    error: error?.message ?? null,
  }
}

export default async function WolfRunRunnersPage() {
  const primary = await getRunnerStats()
  const runners = primary.runners
  const totalCount = primary.totalCount
  const singhsCount = primary.singhsCount
  const kaursCount = primary.kaursCount
  const error = primary.error

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wolf Run Runners</h1>
        <p className="text-muted-foreground">Confirmed paid Wolf Run entries only</p>
        <p className="text-xs text-muted-foreground mt-1">Data source: Supabase</p>
      </div>

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
            <p className="text-xs text-muted-foreground mt-1">Singhs Pack</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kaurs Pack</CardTitle>
            <span className="text-lg">🟣</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{kaursCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Kaurs Pack</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Entries</h2>
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error.includes("Could not find the table 'public.wolfrun_runners'")
              ? 'The wolfrun_runners table has not been created in Supabase yet. Run the SQL in supabase-wolfrun.sql, then refresh this page.'
              : `Failed to load runners: ${error}`}
          </div>
        ) : (
          <RunnersAdminTable runners={runners} />
        )}
      </div>
    </div>
  )
}

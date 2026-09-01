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
  age: number | null
  city: string | null
  pack: string
  agree_whatsapp_group: boolean
  status: string
  created_at: string
  recovered?: boolean
}

type RecoveredPayment = {
  id: string
  source: string
  occurred_at: string | null
  amount: number | null
  currency: string | null
  payment_status: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  payment_reference: string | null
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

  const [runnersResult, singhsResult, kaursResult, recoveredPaymentsResult] = await Promise.all([
    supabase
      .from('wolfrun_runners')
      .select('id, first_name, last_name, email, phone, age, city, pack, agree_whatsapp_group, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase
      .from('wolfrun_runners')
      .select('id', { count: 'exact', head: true })
      .eq('pack', 'singhs'),
    supabase
      .from('wolfrun_runners')
      .select('id', { count: 'exact', head: true })
      .eq('pack', 'kaurs'),
    supabase
      .from('recovery_payment_ledger')
      .select('id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, customer_phone, payment_reference')
      .ilike('description', '%Wolf Run%')
      .order('occurred_at', { ascending: false }),
  ])

  const error = runnersResult.error || singhsResult.error || kaursResult.error

  return {
    runners: runnersResult.data || [],
    totalCount: runnersResult.data?.length ?? 0,
    singhsCount: singhsResult.count ?? 0,
    kaursCount: kaursResult.count ?? 0,
    recoveredPayments: (recoveredPaymentsResult.data ?? []) as RecoveredPayment[],
    error: error?.message ?? null,
  }
}

export default async function WolfRunRunnersPage() {
  const primary = await getRunnerStats()
  const runners = primary.runners
  const totalCount = primary.totalCount
  const singhsCount = primary.singhsCount
  const kaursCount = primary.kaursCount
  const recoveredPayments = primary.recoveredPayments
  const recoveredContacts = Object.values(recoveredPayments.reduce<Record<string, RecoveredPayment[]>>((groups, payment) => {
    const key = payment.customer_email?.trim().toLowerCase() || payment.payment_reference || payment.id
    groups[key] = [...(groups[key] ?? []), payment]
    return groups
  }, {})).map((payments) => ({
    latest: payments[0],
    paymentCount: payments.length,
    sources: [...new Set(payments.map((payment) => payment.source))],
  }))
  const recoveredRunners: RunnerRow[] = recoveredContacts.map(({ latest }) => {
    const [firstName = 'Unknown', ...lastName] = (latest.customer_name || '').trim().split(/\s+/).filter(Boolean)
    return { id: latest.id, first_name: firstName, last_name: lastName.join(' '), email: latest.customer_email || '', phone: latest.customer_phone || '', age: null, city: null, pack: 'recovered', agree_whatsapp_group: false, status: 'confirmed', created_at: latest.occurred_at || new Date().toISOString(), recovered: true }
  })
  const error = primary.error

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wolf Run Runners</h1>
        <p className="text-muted-foreground">Confirmed paid Wolf Run entries only</p>
        <p className="text-xs text-muted-foreground mt-1">Data source: Supabase</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{totalCount + recoveredRunners.length}</div><p className="text-xs text-muted-foreground mt-1">{recoveredRunners.length} payment-verified recovery</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Singhs Pack</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-600">{singhsCount}</div><p className="text-xs text-muted-foreground mt-1">Singhs Pack</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Kaurs Pack</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-purple-600">{kaursCount}</div><p className="text-xs text-muted-foreground mt-1">Kaurs Pack</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pack To Confirm</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{recoveredRunners.length}</div><p className="text-xs text-muted-foreground mt-1">Confirmed paid seats</p></CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Entries</h2>
        {error ? <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Failed to load runners: {error}</div> : <RunnersAdminTable runners={runners} recoveredRunners={recoveredRunners} />}
      </div>
    </div>
  )
}

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

type RecoveredPayment = {
  id: string
  source: string
  occurred_at: string | null
  amount: number | null
  currency: string | null
  payment_status: string | null
  customer_name: string | null
  customer_email: string | null
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
      .select('id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, payment_reference')
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
          <CardContent><div className="text-3xl font-bold text-foreground">{totalCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Singhs Pack</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-600">{singhsCount}</div><p className="text-xs text-muted-foreground mt-1">Singhs Pack</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Kaurs Pack</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-purple-600">{kaursCount}</div><p className="text-xs text-muted-foreground mt-1">Kaurs Pack</p></CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Entries</h2>
        {error ? <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Failed to load runners: {error}</div> : <RunnersAdminTable runners={runners} />}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1">Recovered Wolf Run Payments</h2>
        <p className="mb-3 text-sm text-muted-foreground">Payment evidence recovered from external providers. These are not runner profiles because the original registration details are unavailable.</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Source</th><th className="px-4 py-3 font-medium">Reference</th></tr></thead>
            <tbody>
              {recoveredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{payment.occurred_at ? new Date(payment.occurred_at).toLocaleDateString('en-GB') : 'Unknown'}</td>
                  <td className="px-4 py-3"><p>{payment.customer_name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{payment.customer_email || 'No email'}</p></td>
                  <td className="whitespace-nowrap px-4 py-3">{payment.amount == null ? 'Unknown' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: payment.currency || 'GBP' }).format(payment.amount)}</td>
                  <td className="px-4 py-3">{payment.payment_status || 'Unknown'}</td>
                  <td className="px-4 py-3">{payment.source === 'donation_manager' ? 'Donation Manager' : 'Stripe'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{payment.payment_reference || 'No reference'}</td>
                </tr>
              ))}
              {recoveredPayments.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>No recovered Wolf Run payments found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

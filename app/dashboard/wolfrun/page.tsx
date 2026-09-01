import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Heart, Trophy, AlertTriangle } from 'lucide-react'
import FundraisersAdminTable from '@/components/wolfrun/fundraisers-admin-table'

async function getWolfRunStats() {
  const supabase = await createClient()
  const thirtyMinutesAgoIso = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const oneDayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const missingConfig: string[] = []
  const wolfrunCheckoutId = process.env.WOLFRUN_NOWDONATE_CHECKOUT_ID || process.env.NOWDONATE_CHECKOUT_ID
  const hasNowDonateApiKey = Boolean(process.env.NOWDONATE_API_KEY)
  if (hasNowDonateApiKey === false && wolfrunCheckoutId === undefined) {
    missingConfig.push('NOWDONATE_API_KEY or WOLFRUN_NOWDONATE_CHECKOUT_ID')
  }
  if (wolfrunCheckoutId === undefined) missingConfig.push('WOLFRUN_NOWDONATE_CHECKOUT_ID or NOWDONATE_CHECKOUT_ID')
  if (!process.env.NEXT_PUBLIC_SITE_URL && !process.env.VERCEL_URL) missingConfig.push('NEXT_PUBLIC_SITE_URL (or VERCEL_URL)')

  const [fundraisersResult, donationsResult, singhsResult, kaursResult, stuckDonationsResult, recentCompletedResult, recoveredPaymentsResult] = await Promise.all([
    supabase.from('wolfrun_fundraisers').select('id, first_name, last_name, email, phone, pack, slug, fundraising_goal, total_raised, status, created_at').order('created_at', { ascending: false }).limit(2000),
    supabase.from('wolfrun_donations').select('id, fundraiser_id, donor_name, donor_email, amount, gift_aid, message, status, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(2000),
    supabase.from('wolfrun_fundraisers').select('id', { count: 'exact', head: true }).eq('pack', 'singhs').eq('status', 'active'),
    supabase.from('wolfrun_fundraisers').select('id', { count: 'exact', head: true }).eq('pack', 'kaurs').eq('status', 'active'),
    supabase.from('wolfrun_donations').select('id', { count: 'exact', head: true }).in('status', ['pending', 'redirected']).lt('created_at', thirtyMinutesAgoIso),
    supabase.from('wolfrun_donations').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', oneDayAgoIso),
    supabase.from('recovery_payment_ledger').select('id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, payment_reference').ilike('description', '%Wolf Run%').order('occurred_at', { ascending: false }),
  ])

  const fundraisers = fundraisersResult.data || []
  const donations = donationsResult.data || []
  const totalRaised = fundraisers.reduce((sum, f) => sum + (f.total_raised || 0), 0)

  return {
    fundraisers,
    donations,
    totalRaised,
    singhsCount: singhsResult.count || 0,
    kaursCount: kaursResult.count || 0,
    stalePendingDonations: stuckDonationsResult.count || 0,
    recentCompletedDonations: recentCompletedResult.count || 0,
    recoveredPayments: recoveredPaymentsResult.data || [],
    missingConfig,
  }
}

function formatAmount(pence: number) {
  return `£${(pence / 100).toFixed(pence % 100 === 0 ? 0 : 2)}`
}

export default async function WolfRunDashboard() {
  const {
    fundraisers,
    donations,
    totalRaised,
    singhsCount,
    kaursCount,
    stalePendingDonations,
    recentCompletedDonations,
    recoveredPayments,
    missingConfig,
  } = await getWolfRunStats()
  const showWebhookWarning = stalePendingDonations > 0
  const showConfigWarning = missingConfig.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wolf Run Fundraising</h1>
        <p className="text-muted-foreground">Manage fundraisers and donations for the Wolf Run event</p>
      </div>

      {(showConfigWarning || showWebhookWarning) ? (
        <Card className="border-amber-300 bg-amber-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Wolf Run Payment Health Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-900">
            {showConfigWarning ? (
              <p>
                Missing config: {missingConfig.join(', ')}. Wolf Run payment links may fail until these are set in Vercel env vars.
              </p>
            ) : null}
            {showWebhookWarning ? (
              <p>
                {stalePendingDonations} donation(s) are still pending/redirected for more than 30 minutes.
                This can indicate webhook delivery/mapping issues. Completed in the last 24h: {recentCompletedDonations}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Raised</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatAmount(totalRaised)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fundraisers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{fundraisers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {singhsCount} Singhs · {kaursCount} Kaurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Donations</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{donations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {donations.length > 0 ? formatAmount(Math.round(donations.reduce((s, d) => s + d.amount, 0) / donations.length)) : '£0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fundraisers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fundraisers</CardTitle>
        </CardHeader>
        <CardContent>
          <FundraisersAdminTable initialFundraisers={fundraisers} />
        </CardContent>
      </Card>

      {/* Recent Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No donations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Donor</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Gift Aid</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Message</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 50).map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 font-medium">{d.donor_name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{d.donor_email || '—'}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatAmount(d.amount)}</td>
                      <td className="py-3 px-2">
                        {d.gift_aid ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground max-w-[200px] truncate">{d.message || '—'}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recovered Wolf Run Payments ({recoveredPayments.length})</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">Payment evidence recovered from Stripe and Donation Manager. These entries are not linked to a fundraiser profile because the original database record is unavailable.</p>
          {recoveredPayments.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No recovered Wolf Run payments found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-border"><th className="px-2 py-3 text-left font-medium text-muted-foreground">Contact</th><th className="px-2 py-3 text-left font-medium text-muted-foreground">Email</th><th className="px-2 py-3 text-right font-medium text-muted-foreground">Amount</th><th className="px-2 py-3 text-left font-medium text-muted-foreground">Status</th><th className="px-2 py-3 text-left font-medium text-muted-foreground">Source</th><th className="px-2 py-3 text-left font-medium text-muted-foreground">Date</th></tr></thead><tbody>{recoveredPayments.map((payment) => <tr key={payment.id} className="border-b border-border last:border-0"><td className="px-2 py-3 font-medium">{payment.customer_name || 'Unknown'}</td><td className="px-2 py-3 text-muted-foreground">{payment.customer_email || '—'}</td><td className="px-2 py-3 text-right font-medium">{payment.amount == null ? '—' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: payment.currency || 'GBP' }).format(payment.amount)}</td><td className="px-2 py-3 text-muted-foreground">{payment.payment_status || 'Unknown'}</td><td className="px-2 py-3 text-muted-foreground">{payment.source === 'donation_manager' ? 'Donation Manager' : 'Stripe'}</td><td className="px-2 py-3 text-muted-foreground">{payment.occurred_at ? new Date(payment.occurred_at).toLocaleDateString('en-GB') : 'Unknown'}</td></tr>)}</tbody></table></div>}
        </CardContent>
      </Card>
    </div>
  )
}

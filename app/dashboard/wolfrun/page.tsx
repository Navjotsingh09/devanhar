import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Heart, Trophy, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

async function getWolfRunStats() {
  const supabase = await createClient()

  const [fundraisersResult, donationsResult, singhsResult, kaursResult] = await Promise.all([
    supabase.from('wolfrun_fundraisers').select('id, first_name, last_name, email, phone, pack, slug, fundraising_goal, total_raised, status, created_at').order('created_at', { ascending: false }),
    supabase.from('wolfrun_donations').select('id, fundraiser_id, donor_name, donor_email, amount, gift_aid, message, status, created_at').eq('status', 'completed').order('created_at', { ascending: false }),
    supabase.from('wolfrun_fundraisers').select('id', { count: 'exact', head: true }).eq('pack', 'singhs').eq('status', 'active'),
    supabase.from('wolfrun_fundraisers').select('id', { count: 'exact', head: true }).eq('pack', 'kaurs').eq('status', 'active'),
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
  }
}

function formatAmount(pence: number) {
  return `£${(pence / 100).toFixed(pence % 100 === 0 ? 0 : 2)}`
}

export default async function WolfRunDashboard() {
  const { fundraisers, donations, totalRaised, singhsCount, kaursCount } = await getWolfRunStats()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wolf Run Fundraising</h1>
        <p className="text-muted-foreground">Manage fundraisers and donations for the Wolf Run event</p>
      </div>

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
          {fundraisers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No fundraisers registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pack</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Goal</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Raised</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Registered</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {fundraisers.map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 font-medium">{f.first_name} {f.last_name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{f.email}</td>
                      <td className="py-3 px-2">
                        <Badge variant={f.pack === 'singhs' ? 'default' : 'secondary'}>
                          {f.pack === 'singhs' ? 'Singhs' : 'Kaurs'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">£{f.fundraising_goal}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatAmount(f.total_raised)}</td>
                      <td className="py-3 px-2">
                        <Badge variant={f.status === 'active' ? 'default' : 'secondary'}>
                          {f.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(f.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-2">
                        <a
                          href={`/events/wolfrun/fundraiser/${f.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  )
}

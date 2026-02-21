import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Inbox, Phone, BriefcaseBusiness, HandCoins, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const supabase = await createClient()

  const [submissions, emergencies, vacancies, donations, recentSubmissions, criticalEmergencies] = await Promise.all([
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('emergency_requests').select('id', { count: 'exact', head: true }).in('status', ['new', 'acknowledged', 'in_progress']),
    supabase.from('vacancy_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('donations').select('amount'),
    supabase.from('form_submissions').select('id, full_name, email, status, created_at, initiatives(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('emergency_requests').select('*').in('status', ['new', 'acknowledged']).order('created_at', { ascending: false }).limit(5),
  ])

  const totalDonations = donations.data?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0

  return {
    newSubmissions: submissions.count ?? 0,
    activeEmergencies: emergencies.count ?? 0,
    pendingApplications: vacancies.count ?? 0,
    totalDonations,
    recentSubmissions: recentSubmissions.data ?? [],
    criticalEmergencies: criticalEmergencies.data ?? [],
  }
}

export default async function DashboardOverview() {
  const stats = await getStats()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of all Devanhaar operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/submissions">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Submissions</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.newSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/emergency">
          <Card className="transition-shadow hover:shadow-md border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Emergencies</CardTitle>
              <Phone className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeEmergencies}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vacancies">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
              <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">To be reviewed</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/donations">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalDonations)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Critical Emergencies + Recent Submissions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Emergency Alert Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-foreground">Active Emergency Requests</CardTitle>
            </div>
            <CardDescription>Requests needing immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.criticalEmergencies.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No active emergency requests</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.criticalEmergencies.map((e: Record<string, string>) => (
                  <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{e.caller_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={e.urgency === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                        {e.urgency}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-foreground">Recent Submissions</CardTitle>
            </div>
            <CardDescription>Latest form submissions across all initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No submissions yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentSubmissions.map((s: Record<string, unknown>) => (
                  <div key={s.id as string} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.full_name as string}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(s.initiatives as Record<string, string>)?.name || 'General'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={s.status === 'new' ? 'default' : 'secondary'} className="text-xs">
                        {s.status as string}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.created_at as string).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

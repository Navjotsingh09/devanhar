import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Inbox, Phone, BriefcaseBusiness, AlertTriangle, Clock, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const supabase = await createClient()
  const [submissions, emergencies, vacancies, recentSubmissions, criticalEmergencies, vidyalaPending, recentVidyala] = await Promise.all([
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('emergency_requests').select('id', { count: 'exact', head: true }).in('status', ['new', 'acknowledged', 'in_progress']),
    supabase.from('vacancy_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('form_submissions').select('id, full_name, email, status, created_at, initiatives(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('emergency_requests').select('*').in('status', ['new', 'acknowledged']).order('created_at', { ascending: false }).limit(5),
    supabase.from('vidyala_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('vidyala_applications').select('id, first_name, last_name, email, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return {
    newSubmissions: submissions.count ?? 0,
    activeEmergencies: emergencies.count ?? 0,
    pendingApplications: vacancies.count ?? 0,
    vidyalaPending: vidyalaPending.count ?? 0,
    recentVidyala: recentVidyala.data ?? [],
    recentSubmissions: recentSubmissions.data ?? [],
    criticalEmergencies: criticalEmergencies.data ?? [],
  }
}

export default async function DashboardOverview() {
  const stats = await getStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3 w-3" />
          Staff Dashboard
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening across Devanhaar operations today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/submissions">
          <Card className="dash-lift rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Submissions</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Inbox className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{stats.newSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/emergency">
          <Card className="dash-lift rounded-2xl border-destructive/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Emergencies</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
                <Phone className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{stats.activeEmergencies}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vacancies">
          <Card className="dash-lift rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <BriefcaseBusiness className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">To be reviewed</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vidyala">
          <Card className="dash-lift rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vidyala Applications</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                <BookOpen className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{stats.vidyalaPending}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending review</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Vidyala Recent Applications */}
      {stats.recentVidyala.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-foreground">Recent Vidyala Applications</CardTitle>
            </div>
            <CardDescription>Latest Sikhi Vidyala 2026 applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {stats.recentVidyala.map((v: Record<string, string>) => (
                <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3 transition-colors hover:bg-secondary/70">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.first_name} {v.last_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{v.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={v.status === 'pending' ? 'secondary' : v.status === 'approved' ? 'default' : 'destructive'} className="text-xs">
                      {v.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/vidyala" className="mt-4 block text-xs text-center text-muted-foreground hover:text-foreground transition-colors">
              View all applications →
            </Link>
          </CardContent>
        </Card>
      )}

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
                  <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3 transition-colors hover:bg-secondary/70">
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
            <CardDescription>Latest form submissions across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No submissions yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentSubmissions.map((s: Record<string, unknown>) => (
                  <div key={s.id as string} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3 transition-colors hover:bg-secondary/70">
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

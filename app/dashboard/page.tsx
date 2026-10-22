import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Inbox, Phone, BriefcaseBusiness, BookOpen, Trophy, ImageIcon, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RecordStatus } from '@/components/dashboard/record-status'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = await createClient()
  const [submissions, emergencies, vacancies, recent, urgent] = await Promise.all([
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('emergency_requests').select('id', { count: 'exact', head: true }).in('status', ['new', 'acknowledged', 'in_progress']),
    supabase.from('vacancy_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('form_submissions').select('id, full_name, status, created_at, initiatives(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('emergency_requests').select('id, caller_name, urgency, created_at').in('status', ['new', 'acknowledged']).order('created_at', { ascending: false }).limit(5),
  ])
  return { submissions, emergencies, vacancies, recent, urgent }
}

const dateLabel = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' })

export default async function DashboardOverview() {
  const stats = await getStats()
  const metrics = [
    { title: 'New enquiries', value: stats.submissions.error ? '—' : stats.submissions.count ?? 0, description: 'Awaiting your review', href: '/dashboard/submissions', icon: Inbox },
    { title: 'Active emergencies', value: stats.emergencies.error ? '—' : stats.emergencies.count ?? 0, description: 'Open requests for support', href: '/dashboard/emergency', icon: Phone },
    { title: 'Vacancy applications', value: stats.vacancies.error ? '—' : stats.vacancies.count ?? 0, description: 'Pending a decision', href: '/dashboard/vacancies', icon: BriefcaseBusiness },
  ]
  const shortcuts = [
    { label: 'Website & content', description: 'Pages, articles and site images', href: '/dashboard/website', icon: BookOpen },
    { label: 'Roots Residential', description: 'Camp registrations and responses', href: '/dashboard/roots', icon: Inbox },
    { label: 'Site images', description: 'Manage your website imagery', href: '/dashboard/images', icon: ImageIcon },
    { label: 'Registration windows', description: 'Manage programme availability', href: '/dashboard/registration-windows', icon: CalendarDays },
  ]
  return <div className="crm-page space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="crm-eyebrow mb-3">Devanhaar · Operations</p><h1 className="crm-page-title">A little clarity for your day.</h1><p className="crm-subtitle mt-2">Your enquiries, programmes and community work, together.</p></div>
      <Link prefetch={false} href="/dashboard/submissions" className="crm-action crm-action-primary"><Inbox />Review enquiries<ArrowRight /></Link>
    </div>
    <section aria-label="Operations summary" className="crm-panel grid md:grid-cols-3 overflow-hidden">
      {metrics.map(metric => <Link prefetch={false} href={metric.href} key={metric.title} className="crm-metric hover:bg-muted/40"><div className="flex items-center justify-between gap-3 text-sm text-muted-foreground"><span>{metric.title}</span><metric.icon className="h-4 w-4" /></div><p className="crm-metric-value">{metric.value}</p><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{metric.description}</span><ArrowUpRight className="h-3.5 w-3.5" /></div></Link>)}
    </section>
    <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
      <section className="crm-panel min-w-0 overflow-hidden" aria-labelledby="recent-heading">
        <div className="flex items-center justify-between gap-3 p-6"><div><h2 id="recent-heading" className="text-base font-medium">Recent enquiries</h2><p className="crm-subtitle mt-1">The latest messages from your community.</p></div><Link prefetch={false} href="/dashboard/submissions" className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap">View all →</Link></div>
        {stats.recent.error ? <p role="alert" className="crm-empty">Enquiries are unavailable. Please refresh to try again.</p> : stats.recent.data?.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th scope="col">Name</th><th scope="col">Status</th><th scope="col">Received</th><th scope="col"><span className="sr-only">Open enquiry</span></th></tr></thead><tbody>{stats.recent.data.map(row => <tr key={row.id}><td><div className="font-medium">{row.full_name || 'Unknown'}</div></td><td><RecordStatus status={row.status || ''} /></td><td className="whitespace-nowrap text-muted-foreground">{dateLabel(row.created_at)}</td><td><Link prefetch={false} className="crm-open" href={'/dashboard/submissions/form_submissions/' + encodeURIComponent(row.id)}><span className="sr-only">Open enquiry from {row.full_name}</span><ArrowUpRight className="h-4 w-4" /></Link></td></tr>)}</tbody></table></div> : <div className="crm-empty"><Inbox className="mx-auto mb-3 h-6 w-6 opacity-50" /><p>No enquiries yet.</p><p className="mt-1 text-xs">New messages will appear here.</p></div>}
      </section>
      <section className="crm-panel overflow-hidden" aria-labelledby="attention-heading"><div className="p-6"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /><h2 id="attention-heading" className="text-base font-medium">Support requests</h2></div><p className="crm-subtitle mt-1">Emergency Line requests awaiting attention.</p></div>
        {stats.urgent.error ? <p role="alert" className="crm-empty">Support requests are unavailable. Please refresh to try again.</p> : stats.urgent.data?.length ? <div>{stats.urgent.data.map(row => <Link prefetch={false} href="/dashboard/emergency" key={row.id} className="crm-summary-row"><div className="min-w-0"><p className="truncate text-sm font-medium">{row.caller_name || 'Support request'}</p><p className="mt-1 text-xs text-muted-foreground">{dateLabel(row.created_at)}</p></div><span className="crm-status" data-tone={row.urgency === 'critical' ? 'negative' : 'pending'}>{row.urgency || 'Open'}</span></Link>)}</div> : <div className="crm-empty"><Phone className="mx-auto mb-3 h-6 w-6 opacity-50" /><p>No requests awaiting attention.</p></div>}
        <div className="border-t p-4 text-center"><Link prefetch={false} href="/dashboard/emergency" className="text-xs text-muted-foreground hover:text-foreground">Open Emergency Line →</Link></div>
      </section>
    </div>
    <section aria-labelledby="workspace-heading"><div className="mb-4 flex items-center justify-between"><h2 id="workspace-heading" className="text-base font-medium">Your workspace</h2><span className="text-xs text-muted-foreground">A place for every part of your work</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{shortcuts.map(item => <Link prefetch={false} href={item.href} key={item.href} className="crm-panel flex items-start gap-3 p-5 hover:bg-muted/40"><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /><div><h3 className="text-sm font-medium">{item.label}</h3><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p></div></Link>)}</div></section>
  </div>
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isRegistrationWindowOpen, type RegistrationWindow } from '@/lib/registration-window-status'
import { saveRegistrationWindow } from './actions'

export const dynamic = 'force-dynamic'

export default async function RegistrationWindowsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('admin_profiles').select('role').eq('id', user.id).single()
  if (!profile || !['staff','admin','super_admin'].includes(profile.role)) redirect('/dashboard')
  const { data, error } = await supabase.from('registration_windows').select('*').order('sort_order')
  const formatTime = (value: string | null) => value ? new Date(value).toISOString().slice(0, 16) : ''
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-bold">Registration windows</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Control which applications and interest forms appear on the homepage. Scheduled windows update automatically. Past events are hidden even if their switch is enabled.</p></header>
    <p className="rounded-xl border bg-muted/30 p-4 text-sm">SPA registration availability comes directly from <Link href="/dashboard/padel/tournaments" className="font-semibold underline">tournament settings</Link>. Changes appear on a fresh homepage visit and refresh within a minute for visitors already on the page.</p>
    {error && <p role="alert" className="text-red-700">Unable to load registration settings. Please try again.</p>}
    <div className="grid gap-4 lg:grid-cols-2">{((data || []) as RegistrationWindow[]).map(window => <form key={window.id} action={saveRegistrationWindow.bind(null, window.id)} className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{window.title}</h2><p className="mt-1 text-xs text-muted-foreground">{window.kind === 'application' ? 'Applications' : 'Register interest'}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${isRegistrationWindowOpen(window) ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{isRegistrationWindowOpen(window) ? 'Open now' : 'Closed / scheduled'}</span></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_open" defaultChecked={window.is_open} className="h-4 w-4" />Enable homepage notice</label>
      {window.event_date && <p className="text-xs text-muted-foreground">Event date: {window.event_date}. Automatically hidden after this date.</p>}
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium">Opening time (UTC)<input type="datetime-local" name="opens_at" defaultValue={formatTime(window.opens_at)} className="block w-full rounded-md border bg-background p-2 text-sm" /></label><label className="space-y-1 text-xs font-medium">Closing time (UTC)<input type="datetime-local" name="closes_at" defaultValue={formatTime(window.closes_at)} className="block w-full rounded-md border bg-background p-2 text-sm" /></label></div>
      <p className="text-xs text-muted-foreground">Leave times blank for an ongoing window. This controls the homepage notice; each programme&apos;s form and booking rules still apply.</p>
      <div className="flex items-center justify-between gap-3"><Link href={window.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">View form</Link><button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" type="submit">Save availability</button></div>
    </form>)}</div>
  </div>
}

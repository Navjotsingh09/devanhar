import 'server-only'
import { isVidyalaApplicationsClosed } from '@/lib/vidyala-application-window'
import { createClient } from '@/lib/supabase/server'
import { isRegistrationWindowOpen, type OpenOpportunity, type RegistrationWindow } from '@/lib/registration-window-status'

export async function getOpenRegistrationOpportunities(): Promise<OpenOpportunity[]> {
  const supabase = await createClient()
  const now = new Date()
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const [windows, tournaments] = await Promise.all([
    supabase.from('registration_windows').select('id,title,kind,href,is_open,opens_at,closes_at,event_date,sort_order').order('sort_order'),
    supabase.from('padel_tournaments').select('id,name,event_date,event_time,venue,address,registration_open')
      .eq('is_public', true).gte('event_date', today).order('event_date'),
  ])
  if (windows.error || tournaments.error) throw new Error('Registration availability is temporarily unavailable')
  const opportunities: OpenOpportunity[] = []
  // The public SPA page currently accepts registrations for its earliest public event.
  const tournament = tournaments.data?.[0]
  if (tournament?.registration_open === true && tournament.event_time?.trim() && tournament.venue?.trim() && tournament.address?.trim()) {
    opportunities.push({ id: `spa-${tournament.id}`, title: tournament.name, kind: 'application', href: '/spa' })
  }
  for (const window of (windows.data || []) as RegistrationWindow[]) {
    if (window.id === 'family-spring-2027' || window.id === 'family-summer-2027') continue
    if (window.id === 'vidyala-2026-2027' && isVidyalaApplicationsClosed(now)) continue
    if (isRegistrationWindowOpen(window, now)) opportunities.push({ id: window.id, title: window.title, kind: window.kind, href: window.href })
  }
  if (today <= '2026-11-21') {
    opportunities.push({ id: 'sikh-tactical-airsoft-2026', title: 'Sikh Tactical Airsoft', kind: 'application', href: 'https://sikhtacticalairsoft.zite.so/' })
  }
  return opportunities
}

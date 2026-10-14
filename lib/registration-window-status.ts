export type RegistrationWindow = {
  id: string
  title: string
  kind: 'application' | 'interest'
  href: string
  is_open: boolean
  opens_at: string | null
  closes_at: string | null
  event_date: string | null
  sort_order: number
}

export type OpenOpportunity = { id: string; title: string; kind: 'application' | 'interest'; href: string }

export function isRegistrationWindowOpen(window: RegistrationWindow, now = new Date()) {
  if (!window.is_open || !/^\/[a-zA-Z0-9]/.test(window.href) || window.href.startsWith('//')) return false
  const time = now.getTime()
  if (!Number.isFinite(time)) return false
  if (window.opens_at && (!Number.isFinite(Date.parse(window.opens_at)) || time < Date.parse(window.opens_at))) return false
  if (window.closes_at && (!Number.isFinite(Date.parse(window.closes_at)) || time >= Date.parse(window.closes_at))) return false
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  if (window.event_date && (!/^\d{4}-\d{2}-\d{2}$/.test(window.event_date) || window.event_date < today)) return false
  return true
}

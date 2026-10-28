export const PROGRAMME_LABELS = { roots: 'Roots Residential', kaurs: 'Kaurs', vidyala: 'Sikhi Vidyala', newsletter: 'Devanhaar Monthly Newsletter', family: 'Sikh Family Initiative — Retreats, Day Events & Wedding Fair' } as const
export type StaffProgramme = keyof typeof PROGRAMME_LABELS
export function programmeForPath(path: string): StaffProgramme | null {
  if (path === '/dashboard/roots' || path.startsWith('/dashboard/roots/') || /^\/dashboard\/projects\/roots-residential(?:\/|$)/.test(path)) return 'roots'
  if (/^\/dashboard\/projects\/kaurs-camp(?:-uk|-eu)?(?:\/|$)/.test(path)) return 'kaurs'
  if (path === '/dashboard/family-initiative' || path.startsWith('/dashboard/family-initiative/') || path === '/dashboard/family-retreat' || path.startsWith('/dashboard/family-retreat/')) return 'family'
  if (path === '/dashboard/kaurs' || path.startsWith('/dashboard/kaurs/')) return 'kaurs'
  if (path === '/dashboard/vidyala' || path.startsWith('/dashboard/vidyala/')) return 'vidyala'
  if (path === '/dashboard/newsletter' || path.startsWith('/dashboard/newsletter/')) return 'newsletter'
  return null
}
export function canVisitDashboard(path: string, programmes: StaffProgramme[], role?: string) {
  if (role === 'super_admin' || role === 'admin') return true
  if (role === 'content_manager') return path === '/dashboard/website' || path.startsWith('/dashboard/website/') || path === '/dashboard/activity' || path === '/dashboard/blog' || path.startsWith('/dashboard/blog/')
  const programme = programmeForPath(path)
  return programmes.length ? programme !== null && programmes.includes(programme) : programme === null
}
export function programmeHome(programmes: StaffProgramme[], role?: string) {
  return programmes.includes('roots') ? '/dashboard/roots' : programmes.includes('family') ? '/dashboard/family-initiative' : programmes.includes('kaurs') ? '/dashboard/kaurs' : programmes.includes('vidyala') ? '/dashboard/vidyala' : programmes.includes('newsletter') ? '/dashboard/newsletter' : '/dashboard'
}

export const PROGRAMME_LABELS = { kaurs: 'Kaurs', vidyala: 'Sikhi Vidyala', newsletter: 'Devanhaar Monthly Newsletter', family: 'Sikh Family Initiative — Retreats, Day Events & Wedding Fair' } as const
export type StaffProgramme = keyof typeof PROGRAMME_LABELS
export function programmeForPath(path: string): StaffProgramme | null {
  if (path === '/dashboard/family-initiative' || path.startsWith('/dashboard/family-initiative/') || path === '/dashboard/family-retreat' || path.startsWith('/dashboard/family-retreat/')) return 'family'
  if (path === '/dashboard/kaurs' || path.startsWith('/dashboard/kaurs/')) return 'kaurs'
  if (path === '/dashboard/vidyala' || path.startsWith('/dashboard/vidyala/')) return 'vidyala'
  if (path === '/dashboard/newsletter' || path.startsWith('/dashboard/newsletter/')) return 'newsletter'
  return null
}
export function canVisitDashboard(path: string, programmes: StaffProgramme[]) {
  const programme = programmeForPath(path)
  return programmes.length ? programme !== null && programmes.includes(programme) : programme === null
}
export function programmeHome(programmes: StaffProgramme[]) {
  return programmes.includes('family') ? '/dashboard/family-initiative' : programmes.includes('kaurs') ? '/dashboard/kaurs' : programmes.includes('vidyala') ? '/dashboard/vidyala' : programmes.includes('newsletter') ? '/dashboard/newsletter' : '/dashboard'
}

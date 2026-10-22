import { canVisitDashboard, type StaffProgramme } from './staff-programme-access'

export type NavigationAccount = { role: string; programmes?: StaffProgramme[]; canEditSfi?: boolean }

/** Navigation hints only. The server remains authoritative for reads and writes. */
export function canOpenDashboardSection(path: string, account: NavigationAccount): boolean {
  if (!['staff', 'admin', 'super_admin', 'vacancies_only', 'content_manager', 'programme_manager'].includes(account.role)) return false
  if (account.role === 'programme_manager' && !account.programmes?.length) return false
  if (!(path === '/dashboard' || path.startsWith('/dashboard/'))) return false
  if (!canVisitDashboard(path, account.programmes || [], account.role)) return false
  if (account.role === 'vacancies_only') return path === '/dashboard/vacancies' || path.startsWith('/dashboard/vacancies/')
  if (['/dashboard/users', '/dashboard/settings', '/dashboard/website/assignments'].some(base => path === base || path.startsWith(base + '/'))) {
    return account.role === 'admin' || account.role === 'super_admin'
  }
  if (path === '/dashboard/website/sfi' || path.startsWith('/dashboard/website/sfi/')) return account.canEditSfi === true
  return true
}

/** Select just the deepest matching destination in a group. */
export function activeNavigationPath(pathname: string, destinations: string[]) {
  return destinations.filter(path => pathname === path || (path !== '/dashboard' && pathname.startsWith(path + '/'))).sort((a,b)=>b.length-a.length)[0]
}

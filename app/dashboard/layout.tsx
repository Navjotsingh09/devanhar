import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { redirect } from 'next/navigation'
import { canVisitDashboard, programmeHome, type StaffProgramme } from '@/lib/staff-programme-access'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/sonner'


// Routes that require admin role
const adminOnlyRoutes = ['/dashboard/users', '/dashboard/settings']
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { client: supabase, user, authError, profile: profileResult, grants: grantResult } = await getRequestStaff()
  if (authError || !user) redirect('/auth/login')
  const { data: profile } = profileResult

  const role = profile?.role || 'staff'
  const { data: grants, error: grantError } = grantResult
  if (grantError || !Array.isArray(grants)) redirect('/auth/login?error=access_check_failed')
  const programmes = ['admin', 'super_admin'].includes(role) ? [] : (grants || []).map(row => row.programme) as StaffProgramme[]
  if (!profile) {
    const { data: member } = await supabase.from('spa_members').select('user_id')
      .eq('user_id', user.id).eq('is_active', true).maybeSingle()
    if (member) redirect('/spa-admin')
    redirect('/auth/login?error=access_denied')
  }
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isVacanciesOnly = role === 'vacancies_only'

  // Protect admin-only routes
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  if (!canVisitDashboard(pathname, programmes, role)) redirect(role === 'content_manager' ? '/dashboard/website' : programmeHome(programmes))
  if (!isAdmin && adminOnlyRoutes.some((r) => pathname.startsWith(r))) {
    redirect('/dashboard')
  }

  // Vacancies-only role: restrict to /dashboard/vacancies (and its subpaths)
  if (isVacanciesOnly && pathname && !pathname.startsWith('/dashboard/vacancies')) {
    redirect('/dashboard/vacancies')
  }
  let canEditSfi = isAdmin
  if (role === 'content_manager') {
    const result = await supabase.from('cms_pages').select('id').eq('slug','sfi').maybeSingle()
    canEditSfi = !result.error && !!result.data
  }
  const userData = {
    email: user.email || '',
    fullName: profile?.full_name || user.email || 'Staff',
    role: programmes.length ? 'programme_manager' : role,
    programmes,
    canEditSfi,
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': '280px' } as React.CSSProperties}>
      <AppSidebar user={userData} websiteEnabled />
      <SidebarInset>
        <DashboardHeader programmes={programmes} fullName={userData.fullName} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
        <footer className="border-t border-border px-4 md:px-6 py-3 text-center">
          <span className="text-xs text-muted-foreground">
            Dashboard by{" "}
            <a
              href="https://5rv.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              5rv.digital
            </a>
          </span>
        </footer>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

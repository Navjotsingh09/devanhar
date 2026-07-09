import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Toaster } from '@/components/ui/sonner'


// Routes that require admin role
const adminOnlyRoutes = ['/dashboard/users', '/dashboard/settings']
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()


  const role = profile?.role || 'staff'
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isVacanciesOnly = role === 'vacancies_only'

  // Protect admin-only routes
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  if (!isAdmin && adminOnlyRoutes.some((r) => pathname.startsWith(r))) {
    redirect('/dashboard')
  }

  // Vacancies-only role: restrict to /dashboard/vacancies (and its subpaths)
  if (isVacanciesOnly && pathname && !pathname.startsWith('/dashboard/vacancies')) {
    redirect('/dashboard/vacancies')
  }
  const userData = {
    email: user.email || '',
    fullName: profile?.full_name || user.email || 'Staff',
    role,
  }

  return (
    <SidebarProvider className="dash-theme">
      <AppSidebar user={userData} />
      <SidebarInset>
        <DashboardHeader />
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

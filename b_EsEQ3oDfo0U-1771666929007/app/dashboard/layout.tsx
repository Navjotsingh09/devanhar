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

  // Protect admin-only routes
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  if (!isAdmin && adminOnlyRoutes.some((r) => pathname.startsWith(r))) {
    redirect('/dashboard')
  }
  const userData = {
    email: user.email || '',
    fullName: profile?.full_name || user.email || 'Staff',
    role,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

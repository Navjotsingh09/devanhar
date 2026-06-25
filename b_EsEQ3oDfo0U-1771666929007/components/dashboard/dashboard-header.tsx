'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/submissions': 'Submissions',
  '/dashboard/emergency': 'Emergency Line',
  '/dashboard/vacancies': 'Vacancies',
  '/dashboard/donations': 'Donations',
  '/dashboard/activity': 'Activity Log',
  '/dashboard/settings': 'Settings',
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentLabel = routeLabels[pathname] || 'Dashboard'
  const isSubRoute = pathname !== '/dashboard'

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isSubRoute ? (
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Overview</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {isSubRoute && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

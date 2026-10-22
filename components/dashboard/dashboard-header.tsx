'use client'

import Link from 'next/link'

import { findProjectSpace } from '@/lib/project-spaces'

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

import { PROGRAMME_LABELS, programmeHome, type StaffProgramme } from '@/lib/staff-programme-access'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/kaurs': 'Kaurs',
  '/dashboard/vidyala': 'Sikhi Vidyala',
  '/dashboard/vidyala/webinar': 'Vidyala webinar signups',
  '/dashboard/vidyala/interest': 'Vidyala interest registrations',
  '/dashboard/newsletter': 'Devanhaar Monthly Newsletter',
  '/dashboard/submissions': 'Submissions',
  '/dashboard/emergency': 'Emergency Line',
  '/dashboard/vacancies': 'Vacancies',
  '/dashboard/donations': 'Donations',
  '/dashboard/activity': 'Activity Log',
  '/dashboard/settings': 'Settings',
  '/dashboard/family-initiative': 'Sikh Family Initiative',
  '/dashboard/family-initiative/retreat': 'Sikh Family Retreat',
  '/dashboard/family-initiative/extravaganza': 'Sikh Family Extravaganza',
  '/dashboard/family-initiative/wedding-fair': 'Wedding Fair',
}

export function DashboardHeader({ programmes = [], fullName = '' }: { programmes?: StaffProgramme[]; fullName?: string }) {
  const pathname = usePathname()
  const responseLabel = /\/roots\/forms\/[^/]+\/responses\/[^/]+$/.test(pathname) ? 'Response details' : /\/roots\/forms\/[^/]+\/responses$/.test(pathname) ? 'Form responses' : undefined
  const currentLabel = responseLabel || routeLabels[pathname] || (pathname.startsWith('/dashboard/projects/') ? findProjectSpace(pathname.split('/')[3])?.space.title : undefined) || 'Dashboard'
  const isSubRoute = pathname !== '/dashboard'

  return (
    <div>
    <header className="crm-header flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isSubRoute ? (
              <BreadcrumbLink asChild><Link href={programmeHome(programmes)} prefetch={false}>Dashboard</Link></BreadcrumbLink>
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
    {programmes.length > 0 ? <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900" role="status">
      <p className="font-semibold">{fullName} · Programme manager</p>
      <p className="mt-1">Your access: {programmes.map(key => PROGRAMME_LABELS[key]).join(' · ')} only.</p>
    </div> : null}
    </div>
  )
}

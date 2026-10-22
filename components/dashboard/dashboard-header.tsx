'use client'

import { findProjectSpace } from '@/lib/project-spaces'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
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
  '/dashboard/padel': 'SPA Operations',
  '/dashboard/roots': 'Roots Bookings',
  '/dashboard/recovery-payments': 'Recovered payments',
  '/dashboard/blog': 'Blog & insights',
  '/dashboard/images': 'Site images',
  '/dashboard/products': 'Products',
  '/dashboard/orders': 'Orders',
  '/dashboard/registration-windows': 'Registration windows',
  '/dashboard/users': 'User management',
  '/dashboard/website': 'Website & content',
  '/dashboard/website/pages': 'Website pages',
  '/dashboard/website/sfi': 'SFI page editor',
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
  const parentPath = Object.keys(routeLabels).filter(path => path !== '/dashboard' && pathname.startsWith(path + '/')).sort((a, b) => b.length - a.length)[0]
  const currentLabel = routeLabels[pathname] || (pathname.startsWith('/dashboard/projects/') ? findProjectSpace(pathname.split('/')[3])?.space.title : undefined) || (parentPath ? routeLabels[parentPath] + ' · Details' : 'Workspace')
  const isSubRoute = pathname !== '/dashboard'

  return (
    <div>
    <a href="#crm-content" className="crm-skip">Skip to content</a>
    <header className="crm-header">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isSubRoute ? (
              <BreadcrumbLink href={programmeHome(programmes)}>Dashboard</BreadcrumbLink>
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
      <Link prefetch={false} href="/" target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">View website<ArrowUpRight className="h-3.5 w-3.5" /><span className="sr-only"> (opens in a new tab)</span></Link>
    </header>
    {programmes.length > 0 ? <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900" role="status">
      <p className="font-semibold">{fullName} · Programme manager</p>
      <p className="mt-1">Your access: {programmes.map(key => PROGRAMME_LABELS[key]).join(' · ')} only.</p>
    </div> : null}
    </div>
  )
}

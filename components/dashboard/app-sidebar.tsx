'use client'

import {
  LayoutDashboard,
  Inbox,
  Phone,
  BriefcaseBusiness,
  CircleDot,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Lock,
  Package,
  ClipboardList,
  ImageIcon,
  ReceiptText,
  Trophy,
  BookOpen,
  Video,
  TreePine,
  CalendarDays,
  Newspaper,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { programmeHome, type StaffProgramme } from '@/lib/staff-programme-access'

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const managementNav: NavItem[] = [
  { title: 'Overview', url: '/dashboard', icon: LayoutDashboard },
  { title: 'SPA Operations', url: '/dashboard/padel', icon: Trophy },
  { title: 'Submissions', url: '/dashboard/submissions', icon: Inbox },
  { title: 'Emergency Line', url: '/dashboard/emergency', icon: Phone },
  { title: 'Vacancies', url: '/dashboard/vacancies', icon: BriefcaseBusiness },
]

const familyInitiativeNav: NavItem[] = [
  { title: 'Family overview', url: '/dashboard/family-initiative', icon: LayoutDashboard },
  { title: 'Sikh Family Retreat', url: '/dashboard/family-initiative/retreat', icon: Users },
  { title: 'Sikh Family Extravaganza', url: '/dashboard/family-initiative/extravaganza', icon: CalendarDays },
  { title: 'Wedding Fair', url: '/dashboard/family-initiative/wedding-fair', icon: Users },
]

const vidyalaNav: NavItem[] = [
  { title: 'Applications', url: '/dashboard/vidyala', icon: BookOpen },
  { title: 'Webinar Signups', url: '/dashboard/vidyala/webinar', icon: Video },
  { title: 'Interest Registrations', url: '/dashboard/vidyala/interest', icon: Users },
]

const padelNav: NavItem[] = [
  { title: 'Entries', url: '/dashboard/padel', icon: CircleDot },
  { title: 'Players', url: '/dashboard/padel/players', icon: Users },
  { title: 'Tournaments', url: '/dashboard/padel/tournaments', icon: Trophy },
  { title: 'Results', url: '/dashboard/padel/results', icon: ClipboardList },
  { title: 'Rankings V2', url: '/dashboard/padel/rankings', icon: Trophy },
  { title: 'Player identities', url: '/dashboard/padel/identities', icon: Shield },
]

const rootsNav: NavItem[] = [
  { title: 'Roots Bookings', url: '/dashboard/roots', icon: TreePine },
]

const eventsNav: NavItem[] = [
  { title: 'Wolf Run Fundraisers', url: '/dashboard/wolfrun', icon: Trophy },
  { title: 'Wolf Run Runners', url: '/dashboard/wolfrun-runners', icon: Users },
]

const operationsNav: NavItem[] = [
  { title: 'Recovered Payments', url: '/dashboard/recovery-payments', icon: ReceiptText },
  { title: 'Registration Windows', url: '/dashboard/registration-windows', icon: CalendarDays },
  { title: 'Site Images', url: '/dashboard/images', icon: ImageIcon },
  { title: 'User Management', url: '/dashboard/users', icon: Users, adminOnly: true },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings, adminOnly: true },
]

interface AppSidebarProps {
  user: {
    email: string
    fullName: string
    role: string
    programmes?: StaffProgramme[]
    canEditSfi?: boolean
  }
}

function SimpleNav({
  items,
  pathname,
}: {
  items: NavItem[]
  pathname: string
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={
              pathname === item.url ||
              (!['/dashboard', '/dashboard/website'].includes(item.url) && pathname.startsWith(item.url + '/'))
            }
          >
            <Link prefetch={false} href={item.url}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
              {item.adminOnly && <Lock className="ml-auto h-3 w-3 opacity-40" />}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function ProgrammeGroup({
  label,
  icon: Icon,
  items,
  pathname,
  groupName,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  pathname: string
  groupName: string
}) {
  const isCurrent = items.some(
    (item) => pathname === item.url || pathname.startsWith(item.url + '/')
  )

  return (
    <Collapsible defaultOpen={isCurrent} className={`group/${groupName}`}>
      <CollapsibleTrigger asChild>
        <SidebarGroupLabel className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 hover:bg-sidebar-accent/60">
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isCurrent ? '' : ''} group-data-[state=open]/${groupName}:rotate-180`} />
        </SidebarGroupLabel>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 border-l border-sidebar-border pl-2">
          <SidebarGroupContent>
            <SimpleNav items={items} pathname={pathname} />
          </SidebarGroupContent>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const programmes = user.programmes || []
  const isScoped = programmes.length > 0
  const isVacanciesOnly = user.role === 'vacancies_only' || isScoped

  const managementItems: NavItem[] = isScoped ? [
    ...(programmes.includes('family') ? familyInitiativeNav : []),
    ...(programmes.includes('kaurs') ? [{ title: 'Kaurs', url: '/dashboard/kaurs', icon: Users }] : []),
    ...(programmes.includes('vidyala') ? [{ title: 'Sikhi Vidyala', url: '/dashboard/vidyala', icon: BookOpen }] : []),
    ...(programmes.includes('newsletter') ? [{ title: 'Devanhaar Monthly Newsletter', url: '/dashboard/newsletter', icon: Newspaper }] : []),
  ] : isVacanciesOnly
    ? managementNav.filter((item) => item.url === '/dashboard/vacancies')
    : managementNav

  const canManageWebsite = !isVacanciesOnly
  const websiteItems: NavItem[] = [
    { title: 'Content overview', url: '/dashboard/website', icon: LayoutDashboard },
    { title: 'Website pages', url: '/dashboard/website/pages', icon: BookOpen },
    ...(user.canEditSfi ? [{ title: 'SFI page editor', url: '/dashboard/website/sfi', icon: Newspaper }] : []),
    { title: 'Blog & insights', url: '/dashboard/blog', icon: Newspaper },
    { title: 'Site images', url: '/dashboard/images', icon: ImageIcon },
    { title: 'Products', url: '/dashboard/products', icon: Package },
    { title: 'Orders', url: '/dashboard/orders', icon: ClipboardList },
  ]
  const isWebsite = websiteItems.some(item => pathname === item.url || pathname.startsWith(item.url + '/'))

  const operationItems = operationsNav.filter((item) => !item.adminOnly || isAdmin)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials =
    user.fullName
      ?.split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    user.email[0]?.toUpperCase() ||
    'U'

  return (
    <Sidebar collapsible="offcanvas">
      <div className="crm-navigation">
      <SidebarHeader className="px-5 py-6">
        <Link prefetch={false} href={programmeHome(programmes)} className="flex items-center gap-3" aria-label="Devanhaar dashboard home">
          <Image src="/logos/main-black-transparent.png" alt="Devanhaar" width={140} height={36} className="h-8 w-auto" unoptimized />
          <span className="ml-auto rounded-md border border-black/10 px-1.5 py-1 text-[9px] font-medium tracking-wider">WORKSPACE</span>
        </Link>
      </SidebarHeader>
      {canManageWebsite && <nav aria-label="Workspace" className="crm-workspaces">
        <Link prefetch={false} href={programmeHome(programmes)} aria-current={!isWebsite ? 'true' : undefined}><LayoutDashboard className="h-3.5 w-3.5" />Operations</Link>
        <Link prefetch={false} href="/dashboard/website" aria-current={isWebsite ? 'true' : undefined}><BookOpen className="h-3.5 w-3.5" />Website</Link>
      </nav>}
      <SidebarContent className="gap-2">
        {canManageWebsite && isWebsite ? <SidebarGroup>
          <SidebarGroupLabel>Website & content</SidebarGroupLabel>
          <SidebarGroupContent><SimpleNav items={websiteItems} pathname={pathname} /></SidebarGroupContent>
        </SidebarGroup> : <>
          <SidebarGroup>
            <SidebarGroupLabel>Your workspace</SidebarGroupLabel>
            <SidebarGroupContent><SimpleNav items={managementItems} pathname={pathname} /></SidebarGroupContent>
          </SidebarGroup>
          {!isVacanciesOnly && <SidebarGroup>
            <SidebarGroupLabel>Programmes</SidebarGroupLabel>
            <div className="space-y-1">
              <ProgrammeGroup label="Sikh Padel Association" icon={CircleDot} items={padelNav} pathname={pathname} groupName="padel" />
              <ProgrammeGroup label="Roots Residential" icon={TreePine} items={rootsNav} pathname={pathname} groupName="roots" />
              <ProgrammeGroup label="Events" icon={CalendarDays} items={eventsNav} pathname={pathname} groupName="events" />
            </div>
          </SidebarGroup>}
          {!isVacanciesOnly && <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent><SimpleNav items={operationItems.filter(item => !['/dashboard/images', '/dashboard/users', '/dashboard/settings'].includes(item.url))} pathname={pathname} /></SidebarGroupContent>
          </SidebarGroup>}
        </>}
        {!isVacanciesOnly && isAdmin && <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent><SimpleNav items={operationItems.filter(item => ['/dashboard/users', '/dashboard/settings'].includes(item.url))} pathname={pathname} /></SidebarGroupContent>
        </SidebarGroup>}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-0.5 text-left leading-none">
                    <span className="max-w-[130px] truncate text-sm font-medium">{user.fullName}</span>
                    <span className="text-xs capitalize opacity-70">{user.role?.replace('_', ' ')}</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      </div>
    </Sidebar>
  )
}


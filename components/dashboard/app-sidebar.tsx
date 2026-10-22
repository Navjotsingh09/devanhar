'use client'

import {
  LayoutDashboard,
  Inbox,
  Phone,
  BriefcaseBusiness,
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
import { AccessNavigationItem, AccessWorkspaceLink, SidebarAccessProvider, useSidebarAccess } from './sidebar-access'
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
          <AccessNavigationItem title={item.title} url={item.url} icon={item.icon} active={pathname === item.url || (!['/dashboard', '/dashboard/website'].includes(item.url) && pathname.startsWith(item.url + '/'))} />
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
  const { canOpen } = useSidebarAccess()
  const locked = items.every(item => !canOpen(item.url))
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
            {locked && <><Lock aria-hidden="true" className="h-3 w-3 shrink-0 text-muted-foreground" /><span className="sr-only">Restricted</span></>}
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
  const programmes = user.programmes || []
  const home = user.role === 'vacancies_only' ? '/dashboard/vacancies' : programmeHome(programmes)
  const managementItems = managementNav
  const websiteItems: NavItem[] = [
    { title: 'Content overview', url: '/dashboard/website', icon: LayoutDashboard },
    { title: 'Website pages', url: '/dashboard/website/pages', icon: BookOpen },
    { title: 'SFI page editor', url: '/dashboard/website/sfi', icon: Newspaper },
    { title: 'Blog & insights', url: '/dashboard/blog', icon: Newspaper },
    { title: 'Site images', url: '/dashboard/images', icon: ImageIcon },
    { title: 'Products', url: '/dashboard/products', icon: Package },
    { title: 'Orders', url: '/dashboard/orders', icon: ClipboardList },
  ]
  const isWebsite = websiteItems.some(item => pathname === item.url || pathname.startsWith(item.url + '/'))

  const operationItems = operationsNav

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
    <SidebarAccessProvider account={user}><Sidebar collapsible="offcanvas">
      <div className="crm-navigation">
      <SidebarHeader className="px-5 py-6">
        <Link prefetch={false} href={home} className="flex items-center gap-3" aria-label="Devanhaar dashboard home">
          <Image src="/logos/main-black-transparent.png" alt="Devanhaar" width={140} height={36} className="h-8 w-auto" sizes="100px" />
          <span className="ml-auto rounded-md border border-black/10 px-1.5 py-1 text-[9px] font-medium tracking-wider">WORKSPACE</span>
        </Link>
      </SidebarHeader>
      <nav aria-label="Workspace" className="crm-workspaces">
        <AccessWorkspaceLink title="Operations" url={home} icon={LayoutDashboard} active={!isWebsite} />
        <AccessWorkspaceLink title="Website" url="/dashboard/website" icon={BookOpen} active={isWebsite} />
      </nav>
      <SidebarContent className="gap-2">
          <SidebarGroup>
            <SidebarGroupLabel>Your workspace</SidebarGroupLabel>
            <SidebarGroupContent><SimpleNav items={managementItems} pathname={pathname} /></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Programmes</SidebarGroupLabel>
            <div className="space-y-1">
              <ProgrammeGroup label="Sikh Family Initiative" icon={Users} items={familyInitiativeNav} pathname={pathname} groupName="family" />
              <ProgrammeGroup label="Sikhi Vidyala" icon={BookOpen} items={vidyalaNav} pathname={pathname} groupName="vidyala" />
              <ProgrammeGroup label="Kaurs" icon={Users} items={[{ title: 'Kaurs', url: '/dashboard/kaurs', icon: Users }]} pathname={pathname} groupName="kaurs" />
              <ProgrammeGroup label="Monthly Newsletter" icon={Newspaper} items={[{ title: 'Newsletter', url: '/dashboard/newsletter', icon: Newspaper }]} pathname={pathname} groupName="newsletter" />
              <ProgrammeGroup label="Roots Residential" icon={TreePine} items={rootsNav} pathname={pathname} groupName="roots" />
              <ProgrammeGroup label="Events" icon={CalendarDays} items={eventsNav} pathname={pathname} groupName="events" />
            </div>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent><SimpleNav items={operationItems.filter(item => !['/dashboard/images', '/dashboard/users', '/dashboard/settings'].includes(item.url))} pathname={pathname} /></SidebarGroupContent>
          </SidebarGroup>
        <SidebarGroup><ProgrammeGroup label="Website & content" icon={BookOpen} items={websiteItems} pathname={pathname} groupName="website" /></SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent><SimpleNav items={operationItems.filter(item => ['/dashboard/users', '/dashboard/settings'].includes(item.url))} pathname={pathname} /></SidebarGroupContent>
        </SidebarGroup>
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
    </Sidebar></SidebarAccessProvider>
  )
}


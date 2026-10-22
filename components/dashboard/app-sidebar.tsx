'use client'

import { projectSpaces, projectSpacePath } from '@/lib/project-spaces'

import { AccessNavigationItem, SidebarAccessProvider, useSidebarAccess } from './sidebar-access'

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
  ShoppingBag,
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
  Boxes,
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

const contentCommerceNav: NavItem[] = [
  { title: 'Blog', url: '/dashboard/blog', icon: Newspaper },
  { title: 'Orders', url: '/dashboard/orders', icon: ClipboardList },
  { title: 'Products', url: '/dashboard/products', icon: Package },
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
          <AccessNavigationItem title={item.title} url={item.url} icon={item.icon} active={pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url + '/'))} />
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
            <Icon className="h3.5 w3.5 shrink-0" />
            <span className="truncate">{label}</span>
            {locked && <><Lock aria-hidden="true" className="h-3 w-3 shrink-0 text-muted-foreground" /><span className="sr-only">Restricted</span></>}
          </span>
          <ChevronDown className={`h3.5 w3.5 shrink-0 transition-transform ${isCurrent ? '' : ''} group-data-[state=open]/${groupName}:rotate-180`} />
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
    <SidebarAccessProvider account={user}><Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={home} prefetch={false}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Devanhaar</span>
                  <span className="text-xs opacity-70">Staff Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup className="pb-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em]">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SimpleNav items={managementItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

          <SidebarGroup className="border-t border-sidebar-border pt-2">
            <SidebarGroupLabel className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
              Projects & programmes
            </SidebarGroupLabel>
            <div className="space-y-1">
              {projectSpaces.map(space => <ProgrammeGroup key={space.id} label={space.title} icon={space.id === 'roots-residential' ? TreePine : space.id === 'wolfrun' ? Trophy : BookOpen} items={[
                { title: 'Overview', url: projectSpacePath(space), icon: LayoutDashboard },
                ...(space.children || []).map(child => ({ title: child.title, url: projectSpacePath(child), icon: BookOpen })),
                ...(space.tools || []).map(tool => ({ ...tool, icon: ClipboardList })),
              ]} pathname={pathname} groupName={space.id} />)}
            </div>
          </SidebarGroup>

          <SidebarGroup className="border-t border-sidebar-border pt-2">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em]">
              Content & Commerce
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SimpleNav items={contentCommerceNav} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="border-t border-sidebar-border pt-2">
            <SidebarGroupLabel className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Boxes className="h-3 w-3" />
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SimpleNav items={operationItems} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
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
    </Sidebar></SidebarAccessProvider>
  )
}


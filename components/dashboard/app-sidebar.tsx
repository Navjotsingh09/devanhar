'use client'

import { useState } from 'react'
import './workspace-navigation.css'
import { activeNavigationPath } from '@/lib/dashboard-navigation-access'
import { projectSpaces, projectSpacePath } from '@/lib/project-spaces'

import {
  Tent,
  GraduationCap,
  MessagesSquare,
  Network,
  Baby,
  LayoutDashboard,
  Inbox,
  Phone,
  BriefcaseBusiness,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  X,
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

const projectIcons: Record<string, NavItem['icon']> = {
  'singhs-camp': Tent, 'kaurs-camp': Tent, 'kids-camps': Baby,
  'roots-residential': TreePine, 'sikh-family-initiative': Users,
  'sikhi-vidyala': BookOpen, 'sikh-professional-network': BriefcaseBusiness,
  'university-projects': GraduationCap, 'khalsa-catalyst': Shield,
  'gurmat-academy': BookOpen, 'punjab-education-support': GraduationCap,
  'self-defence-academy': Shield, forums: MessagesSquare, sweb3: Network,
  newsletter: Newspaper, wolfrun: Trophy,
}

const managementNav: NavItem[] = [
  { title: 'Overview', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Submissions', url: '/dashboard/submissions', icon: Inbox },
  { title: 'Emergency Line', url: '/dashboard/emergency', icon: Phone },
  { title: 'Vacancies', url: '/dashboard/vacancies', icon: BriefcaseBusiness },
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
          <AccessNavigationItem title={item.title} url={item.url} icon={item.icon} active={activeNavigationPath(pathname,items.map(item=>item.url))===item.url} />
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
  open,
  onOpenChange,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  pathname: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { canOpen } = useSidebarAccess()
  const locked = items.every(item => !canOpen(item.url))
  const isCurrent = items.some(
    (item) => pathname === item.url || pathname.startsWith(item.url + '/')
  )

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="workspace-project" data-current={isCurrent || undefined}>
      <CollapsibleTrigger asChild>
        <button type="button" className="workspace-project-trigger !h-auto !min-h-10 !text-[13px] flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2">
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 whitespace-normal leading-snug">{label}</span>
            {locked && <><Lock aria-hidden="true" className="h-3 w-3 shrink-0 text-muted-foreground" /><span className="sr-only">Restricted</span></>}
          </span>
          <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
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

export function AppSidebar({ user, websiteEnabled = false }: AppSidebarProps & { websiteEnabled?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const currentProject = projectSpaces.find(space => [projectSpacePath(space), ...(space.children || []).map(projectSpacePath), ...(space.tools || []).map(tool => tool.url)].some(url => pathname === url || pathname.startsWith(url + '/')))?.id
  const [expanded, setExpanded] = useState<string | null>(null)
  const [changedOnPath, setChangedOnPath] = useState('')
  const openGroup = changedOnPath === pathname ? expanded : currentProject || (pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/settings') ? 'administration' : pathname.startsWith('/dashboard/recovery-payments') || pathname.startsWith('/dashboard/registration-windows') ? 'operations' : ['/dashboard/website', '/dashboard/blog', '/dashboard/images', '/dashboard/products', '/dashboard/orders'].some(path => pathname.startsWith(path)) ? 'website' : null)
  const setGroup = (id: string, open: boolean) => { setChangedOnPath(pathname); setExpanded(open ? id : null) }
  const search = query.trim().toLowerCase()
  const visibleProjects = projectSpaces.filter(space => [space.title, ...(space.children || []).map(child => child.title), ...(space.tools || []).map(tool => tool.title)].some(title => title.toLowerCase().includes(search)))
  const programmes = user.programmes || []
  const home = user.role === 'content_manager' ? '/dashboard/website' : user.role === 'vacancies_only' ? '/dashboard/vacancies' : programmeHome(programmes)
  const managementItems = managementNav
  const websiteItems: NavItem[] = [
    ...(websiteEnabled ? [{ title: 'Content overview', url: '/dashboard/website', icon: LayoutDashboard },
    { title: 'Website pages', url: '/dashboard/website/pages', icon: BookOpen },
    { title: 'SFI page editor', url: '/dashboard/website/sfi', icon: Newspaper },
    { title: 'Content assignments', url: '/dashboard/website/assignments', icon: Users }] : []),
    { title: 'Blog & insights', url: '/dashboard/blog', icon: Newspaper },
    { title: 'Site images', url: '/dashboard/images', icon: ImageIcon },
    { title: 'Products', url: '/dashboard/products', icon: Package },
    { title: 'Orders', url: '/dashboard/orders', icon: ClipboardList },
    { title: 'Activity log', url: '/dashboard/activity', icon: ClipboardList },
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
      <div className="workspace-navigation">
      <SidebarHeader className="px-5 pb-4 pt-6">
        <Link prefetch={false} href={home} className="flex items-center gap-3" aria-label="Devanhaar dashboard home">
          <Image src="/logos/main-black-transparent.png" alt="Devanhaar" width={140} height={36} className="h-8 w-auto" sizes="100px" />
          <span className="ml-auto rounded-md border border-black/10 px-1.5 py-1 text-[9px] font-medium tracking-wider">STAFF</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-3 px-3 pb-4">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent><SimpleNav items={managementItems} pathname={pathname} /></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects & programmes</SidebarGroupLabel>
            <div className="workspace-search">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
              <input aria-label="Find a project or subproject" placeholder="Find a project…" value={query} onChange={event => setQuery(event.target.value)} />
              {query && <button type="button" aria-label="Clear project search" onClick={() => setQuery('')}><X className="h-3.5 w-3.5" /></button>}
            </div>
            <div className="space-y-0.5">
              {!visibleProjects.length && <p role="status" className="px-2 py-4 text-xs text-muted-foreground">No projects found.</p>}
              {visibleProjects.map(space => <ProgrammeGroup key={space.id} label={space.title} icon={projectIcons[space.id] || BookOpen} items={[
                { title: 'Overview', url: projectSpacePath(space), icon: LayoutDashboard },
                ...(space.children || []).map(child => ({ title: child.title, url: projectSpacePath(child), icon: BookOpen })),
                ...(space.tools || []).map(tool => ({ ...tool, icon: ClipboardList })),
                ...(websiteEnabled && space.id === 'roots-residential' ? [{ title: 'Form builder', url: '/dashboard/roots/forms', icon: ClipboardList }] : []),
              ]} pathname={pathname} groupName={space.id} open={!!search || openGroup === space.id} onOpenChange={open => setGroup(space.id, open)} />)}
            </div>
          </SidebarGroup>
          <SidebarGroup className="workspace-tools">
            <ProgrammeGroup label="Operations" icon={ReceiptText} items={operationItems.filter(item => !['/dashboard/images', '/dashboard/users', '/dashboard/settings'].includes(item.url))} pathname={pathname} groupName="operations" open={openGroup === 'operations'} onOpenChange={open => setGroup('operations', open)} />
            <ProgrammeGroup label="Website & content" icon={BookOpen} items={websiteItems} pathname={pathname} groupName="website" open={openGroup === 'website'} onOpenChange={open => setGroup('website', open)} />
            <ProgrammeGroup label="Administration" icon={Settings} items={operationItems.filter(item => ['/dashboard/users', '/dashboard/settings'].includes(item.url))} pathname={pathname} groupName="administration" open={openGroup === 'administration'} onOpenChange={open => setGroup('administration', open)} />
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
                    <span className="text-xs capitalize opacity-70">{user.role?.replaceAll('_', ' ')}</span>
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


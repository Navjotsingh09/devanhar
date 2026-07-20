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
  ShoppingBag,
  Package,
  ClipboardList,
  ImageIcon,
  Trophy,
  BookOpen,
  Video,
  TreePine,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const mainNav: NavItem[] = [
  { title: 'Overview', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Submissions', url: '/dashboard/submissions', icon: Inbox },
  { title: 'Emergency Line', url: '/dashboard/emergency', icon: Phone },
  { title: 'Vacancies', url: '/dashboard/vacancies', icon: BriefcaseBusiness },
  { title: 'User Management', url: '/dashboard/users', icon: Users, adminOnly: true },
  { title: 'Site Images', url: '/dashboard/images', icon: ImageIcon },
]

const shopNav: NavItem[] = [
  { title: 'Orders', url: '/dashboard/orders', icon: ClipboardList },
  { title: 'Products', url: '/dashboard/products', icon: Package },
]


const eventsNav: NavItem[] = [
  { title: 'Wolf Run Fundraisers', url: '/dashboard/wolfrun', icon: Trophy },
  { title: 'Wolf Run Runners', url: '/dashboard/wolfrun-runners', icon: Users },
]

const vidyalaNav: NavItem[] = [
  { title: 'Webinar Signups', url: '/dashboard/vidyala', icon: Video },
]

const rootsNav: NavItem[] = [
  { title: 'Roots Bookings', url: '/dashboard/roots', icon: TreePine },
]
const systemNav: NavItem[] = [
  { title: 'Settings', url: '/dashboard/settings', icon: Settings, adminOnly: true },
]

interface AppSidebarProps {
  user: {
    email: string
    fullName: string
    role: string
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const isVacanciesOnly = user.role === 'vacancies_only'

  const filteredMainNav = isVacanciesOnly
    ? mainNav.filter((item) => item.url === '/dashboard/vacancies')
    : mainNav.filter((item) => !item.adminOnly || isAdmin)
  const filteredSystemNav = isVacanciesOnly
    ? []
    : systemNav.filter((item) => !item.adminOnly || isAdmin)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = user.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email[0]?.toUpperCase() || 'U'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex h8 w8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="h4 w4" />
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url))}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                      {item.adminOnly && <Lock className="ml-auto h3 w3 opacity-40" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isVacanciesOnly && (
        <SidebarGroup>
          <SidebarGroupLabel>
            <ShoppingBag className="h3 w3 mr-1" />
            Shop
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shopNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {!isVacanciesOnly && (
        <SidebarGroup>
          <SidebarGroupLabel>
            <Trophy className="h3 w3 mr-1" />
            Events
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {eventsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {!isVacanciesOnly && (
        <SidebarGroup>
          <SidebarGroupLabel>
            <BookOpen className="h3 w3 mr-1" />
            Sikhi Vidyala
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vidyalaNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {!isVacanciesOnly && (
        <SidebarGroup>
          <SidebarGroupLabel>
            <TreePine className="h3 w3 mr-1" />
            Roots Residential
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rootsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}


        {!isVacanciesOnly && (
        <SidebarGroup>
          <SidebarGroupLabel>
            <Users className="h3 w3 mr-1" />
            Sikh Family Retreat
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {familyRetreatNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {filteredSystemNav.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSystemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h4 w4" />
                      <span>{item.title}</span>
                      {item.adminOnly && <Lock className="ml-auto h3 w3 opacity-40" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h8 w8">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="text-sm font-medium truncate max-w[120px]">{user.fullName}</span>
                    <span className="text-xs opacity-70 capitalize">{user.role?.replace('_', ' ')}</span>
                  </div>
                  <ChevronDown className="ml-auto h4 w4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h4 w4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

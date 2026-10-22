'use client'

import { createContext, useContext, useRef, useState, type ComponentType, type ReactNode } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { canOpenDashboardSection, type NavigationAccount } from '@/lib/dashboard-navigation-access'
import { NavigationPending } from './navigation-pending'

const AccessContext = createContext<{ account: NavigationAccount; explain: (title: string) => void } | null>(null)
export function SidebarAccessProvider({ account, children }: { account: NavigationAccount; children: ReactNode }) {
  const lastTrigger = useRef<HTMLElement | null>(null)
  const [restricted, setRestricted] = useState<string | null>(null)
  return <AccessContext.Provider value={{ account, explain: title => { lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setRestricted(title) } }}>
    {children}
    <Dialog open={restricted !== null} onOpenChange={open => { if (!open) setRestricted(null) }}>
      <DialogContent onCloseAutoFocus={event => { event.preventDefault(); lastTrigger.current?.focus() }} className="sm:max-w-md">
        <DialogHeader><DialogTitle>Access restricted</DialogTitle><DialogDescription>Your account doesn’t have access to {restricted}. Contact a Devanhaar administrator if you need access to this section.</DialogDescription></DialogHeader>
      </DialogContent>
    </Dialog>
  </AccessContext.Provider>
}
export function useSidebarAccess() {
  const context = useContext(AccessContext)
  if (!context) throw new Error('Sidebar access provider is required')
  return { canOpen: (path: string) => canOpenDashboardSection(path, context.account), explain: context.explain }
}
export function AccessNavigationItem({ title, url, icon: Icon, active }: { title: string; url: string; icon: ComponentType<{ className?: string }>; active: boolean }) {
  const { canOpen, explain } = useSidebarAccess()
  if (!canOpen(url)) return <SidebarMenuButton type="button" data-locked="true" className="!h-auto min-h-9 py-2 text-muted-foreground" aria-label={`${title} (restricted)`} onClick={() => explain(title)}>
    <Icon className="h-4 w-4" /><span className="!whitespace-normal !overflow-visible !text-clip leading-snug">{title}</span><Lock aria-hidden="true" className="ml-auto h-3.5 w-3.5 shrink-0" />
  </SidebarMenuButton>
  return <SidebarMenuButton className="!h-auto min-h-9 py-2" asChild isActive={active}><Link href={url} prefetch={false} aria-current={active ? 'page' : undefined}><Icon className="h-4 w-4" /><span className="!whitespace-normal !overflow-visible !text-clip leading-snug">{title}</span><NavigationPending /></Link></SidebarMenuButton>
}
export function AccessWorkspaceLink({ title, url, icon: Icon, active }: { title: string; url: string; icon: ComponentType<{ className?: string }>; active: boolean }) {
  const { canOpen, explain } = useSidebarAccess()
  if (!canOpen(url)) return <button type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground" aria-label={`${title} (restricted)`} onClick={() => explain(title)}><Icon className="h-3.5 w-3.5" />{title}<Lock aria-hidden="true" className="h-3 w-3" /></button>
  return <Link href={url} prefetch={false} aria-current={active ? 'page' : undefined}><Icon className="h-3.5 w-3.5" />{title}</Link>
}

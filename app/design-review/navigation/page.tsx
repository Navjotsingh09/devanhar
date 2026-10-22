import { notFound } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
export default function NavigationReview() {
  if (process.env.VERCEL_ENV !== 'preview') notFound()
  return <SidebarProvider style={{ '--sidebar-width': '280px' } as React.CSSProperties}><AppSidebar user={{ email: 'design@example.invalid', fullName: 'Design review', role: 'super_admin' }} /><SidebarInset><header className="flex h-16 items-center gap-3 border-b px-6"><SidebarTrigger /><span className="text-sm">Workspace design review</span></header><main className="p-8"><p className="text-xs uppercase tracking-widest text-muted-foreground">Preview only · sample account</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">One place for your projects</h1><p className="mt-3 max-w-lg text-sm text-muted-foreground">Find a project, expand its spaces and open its tools. Account permissions still apply.</p></main></SidebarInset></SidebarProvider>
}

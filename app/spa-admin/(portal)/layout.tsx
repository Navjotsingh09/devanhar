import { requirePadelStaff } from '@/lib/padel-admin'
import { SpaPortalShell } from '@/components/padel/spa-portal-shell'
import { Toaster } from '@/components/ui/sonner'

export const metadata = { title: 'SPA Operations | Sikh Padel Association', robots: { index: false, follow: false } }

export default async function SpaPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await requirePadelStaff()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data: member }] = await Promise.all([
    supabase.from('admin_profiles').select('full_name').eq('id', user!.id).maybeSingle(),
    supabase.from('spa_members').select('full_name').eq('user_id', user!.id).maybeSingle(),
  ])
  return <SpaPortalShell fullName={member?.full_name || profile?.full_name || 'SPA organiser'}>{children}<Toaster /></SpaPortalShell>
}

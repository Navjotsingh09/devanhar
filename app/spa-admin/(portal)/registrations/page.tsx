import { requirePadelStaff } from '@/lib/padel-admin'
import { getPadelEntries } from '@/lib/padel-entries'
import { PadelEntriesDashboard } from '@/components/padel/padel-entries-dashboard'
export const dynamic = 'force-dynamic'
export default async function SpaRegistrationsPage() {
  const entries = await getPadelEntries(await requirePadelStaff())
  return <section className="space-y-6"><header><h1 className="text-3xl font-bold">Tournament registrations</h1><p className="mt-2 text-sm text-muted-foreground">Review applications and record verified entry fees. Approval and payment are separate records.</p></header><PadelEntriesDashboard entries={entries} /></section>
}

import Link from 'next/link'
import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { ProgrammeRecordsList } from '@/components/dashboard/programme-records-list'
import type { QueryParams } from '@/lib/crm/submissions'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Roots Bookings | Dashboard' }
export default async function RootsDashboardPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const client = await requireGeneralStaff()
  return <div className="space-y-6"><div className="crm-panel flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-medium">Roots form studio</h2><p className="mt-1 text-sm text-muted-foreground">Build camp registrations and custom forms, with optional payments.</p></div><Link href="/dashboard/roots/forms" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Open form studio →</Link></div><ProgrammeRecordsList client={client} programme="roots" input={await searchParams} /></div>
}

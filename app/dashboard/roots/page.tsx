import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { ProgrammeRecordsList } from '@/components/dashboard/programme-records-list'
import type { QueryParams } from '@/lib/crm/submissions'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Roots Bookings | Dashboard' }
export default async function RootsDashboardPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const client = await requireGeneralStaff()
  return <ProgrammeRecordsList client={client} programme="roots" input={await searchParams} />
}

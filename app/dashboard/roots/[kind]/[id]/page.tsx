import { type QueryParams } from '@/lib/crm/submissions'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { ProgrammeRecordDetail } from '@/components/dashboard/programme-record-detail'
export const dynamic = 'force-dynamic'
export default async function RootsRecord({ params, searchParams }: { params: Promise<{ kind: string; id: string }>; searchParams: Promise<QueryParams> }) {
  const client = await requireRootsStaff()
  return <ProgrammeRecordDetail client={client} programme="roots" {...await params} query={await searchParams} />
}

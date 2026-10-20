import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { ProgrammeRecordDetail } from '@/components/dashboard/programme-record-detail'
export const dynamic = 'force-dynamic'
export default async function RootsRecord({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const client = await requireGeneralStaff()
  return <ProgrammeRecordDetail client={client} programme="roots" {...await params} />
}

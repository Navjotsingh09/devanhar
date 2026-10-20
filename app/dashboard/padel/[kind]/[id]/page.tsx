import { requirePadelStaff } from '@/lib/padel-admin'
import { ProgrammeRecordDetail } from '@/components/dashboard/programme-record-detail'
export const dynamic = 'force-dynamic'
export default async function PadelRecord({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const client = await requirePadelStaff()
  return <ProgrammeRecordDetail client={client} programme="padel" {...await params} />
}

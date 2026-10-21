import { type QueryParams } from '@/lib/crm/submissions'
import { requirePadelStaff } from '@/lib/padel-admin'
import { ProgrammeRecordDetail } from '@/components/dashboard/programme-record-detail'
export const dynamic = 'force-dynamic'
export default async function PadelRecord({ params, searchParams }: { params: Promise<{ kind: string; id: string }>; searchParams: Promise<QueryParams> }) {
  const client = await requirePadelStaff()
  return <ProgrammeRecordDetail client={client} programme="padel" {...await params} query={await searchParams} />
}

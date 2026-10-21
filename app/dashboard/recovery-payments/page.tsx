import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { SubmissionsList } from '@/components/dashboard/submissions-list'
import { listParams, loadSubmissionList, type QueryParams } from '@/lib/crm/submissions'

export const dynamic = 'force-dynamic'
export default async function RecoveryPaymentsPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const client = await requireGeneralStaff()
  const params = listParams(await searchParams, 'recovery_payment_ledger')
  try {
    const result = await loadSubmissionList(client, params)
    return <SubmissionsList params={params} {...result} fixedSource="recovery_payment_ledger" />
  } catch {
    return <SubmissionsList params={params} rows={[]} count={0} fixedSource="recovery_payment_ledger" error="Unable to load recovered payments. Please try again or contact your administrator." />
  }
}

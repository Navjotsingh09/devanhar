import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { SubmissionsList } from '@/components/dashboard/submissions-list'
import { listParams, loadSubmissionList, type QueryParams } from '@/lib/crm/submissions'

export const dynamic = 'force-dynamic'
export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const client = await requireGeneralStaff()
  const params = listParams(await searchParams)
  try {
    const result = await loadSubmissionList(client, params)
    return <SubmissionsList params={params} {...result} />
  } catch {
    return <SubmissionsList params={params} rows={[]} count={0} error="Unable to load this dataset. Please try again or contact your administrator." />
  }
}

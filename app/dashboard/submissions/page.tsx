import Link from 'next/link'
import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { SubmissionsList } from '@/components/dashboard/submissions-list'
import { listParams, loadSubmissionList, type QueryParams } from '@/lib/crm/submissions'

export const dynamic = 'force-dynamic'
export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const client = await requireGeneralStaff()
  const params = listParams(await searchParams)
  try {
    const result = await loadSubmissionList(client, params)
    return <div className="space-y-6"><SubmissionsList params={params} {...result} /><aside className="rounded-xl border p-5"><h2 className="text-sm font-medium">Bulk camp actions and payment review</h2><p className="mt-1 text-sm text-muted-foreground">Use the existing operations console for bulk payment capture, repayment links and camp correspondence.</p><Link prefetch={false} href="/dashboard/submissions/legacy" className="mt-3 inline-block text-sm font-medium underline">Open advanced operations</Link></aside></div>
  } catch {
    return <SubmissionsList params={params} rows={[]} count={0} error="Unable to load this dataset. Please try again or contact your administrator." />
  }
}

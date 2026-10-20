import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { isSource, sources } from '@/lib/crm/submissions'
import { loadSubmissionDetail, validRecordId } from '@/lib/crm/submission-detail'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'

export const dynamic = 'force-dynamic'
export default async function SubmissionDetail({ params }: { params: Promise<{ source: string; id: string }> }) {
  const client = await requireGeneralStaff()
  const { source, id } = await params
  if (!isSource(source) || !validRecordId(id)) notFound()
  let record
  try { record = await loadSubmissionDetail(client, source, id) }
  catch { return <div role="alert" className="space-y-3"><h1 className="text-xl font-semibold">Unable to load this record</h1><p>Please retry or contact your administrator.</p><Link href={`/dashboard/submissions?source=${source}`} className="underline">Return to list</Link></div> }
  if (!record) notFound()
  return <div className="space-y-5"><Link href={`/dashboard/submissions?source=${source}`} className="underline">← {sources[source].label}</Link><h1 className="text-2xl font-bold">Submission details</h1>
    <p className="text-sm text-muted-foreground">One selected record. Existing statuses and actions are preserved. Payment status shown here is the stored webhook status.</p>
    {record.submission ? <SubmissionsTable submissions={[record.submission]} recordOnly /> : <dl className="divide-y rounded-lg border p-4">{Object.entries(record.row || {}).map(([key, value]) => <div key={key} className="grid gap-2 py-3 md:grid-cols-3"><dt className="font-medium">{key.replaceAll('_', ' ')}</dt><dd className="whitespace-pre-wrap break-all md:col-span-2">{value == null ? '—' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</dd></div>)}</dl>}
  </div>
}

import Link from 'next/link'
import {EnquiryWorkflow} from '@/components/dashboard/enquiry-workflow'
import { ArrowLeft, Mail, Phone, CalendarDays, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'
import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { isSource, sources, listParams, listHref, type QueryParams } from '@/lib/crm/submissions'
import { loadSubmissionDetail, validRecordId } from '@/lib/crm/submission-detail'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { RecordStatus } from '@/components/dashboard/record-status'

export const dynamic = 'force-dynamic'
export default async function SubmissionDetail({ params, searchParams }: { params: Promise<{ source: string; id: string }>; searchParams: Promise<QueryParams> }) {
  const client = await requireGeneralStaff()
  const { source, id } = await params
  if (!isSource(source) || !validRecordId(id)) notFound()
  const back = listHref(listParams(await searchParams, source))
  let record
  try { record = await loadSubmissionDetail(client, source, id) }
  catch { return <div role="alert" className="crm-page crm-panel p-8"><h1 className="crm-page-title">Unable to load this record</h1><p className="crm-subtitle mt-3">Please retry or contact your administrator.</p><Link prefetch={false} href={back} className="crm-action mt-5"><ArrowLeft />Return to list</Link></div> }
  if (!record) notFound()
  const entry = record.submission
  let workflow:null|{id:string;status:string;assigned_to:string|null;internal_notes:string|null;updated_at:string}=null,staff:{id:string;full_name:string|null}[]=[]
  if(source==='form_submissions'&&entry){
    const[row,profiles,grants]=await Promise.all([client.from('form_submissions').select('id,status,assigned_to,internal_notes,updated_at').eq('id',id).single(),client.from('admin_profiles').select('id,full_name,role').in('role',['staff','admin','super_admin']).order('full_name'),client.from('staff_programme_access').select('user_id')])
    if(row.error||profiles.error||grants.error)throw new Error('The enquiry workflow could not be loaded')
    workflow=row.data;staff=(profiles.data??[]).filter(p=>p.role!=='staff'||!(grants.data??[]).some(g=>g.user_id===p.id))
  }
  return <div className="crm-page space-y-6">
    <Link prefetch={false} href={back} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to {sources[source].label.toLowerCase()}</Link>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="crm-eyebrow mb-3">{sources[source].label}</p><h1 className="crm-page-title">{entry?.full_name || 'Submission details'}</h1><p className="crm-subtitle mt-2">Record details and correspondence.</p></div>{entry && <RecordStatus status={entry.status} />}</div>
    {workflow&&<EnquiryWorkflow record={workflow} staff={staff}/>}
    {entry ? <>
      <section className="crm-panel grid gap-6 p-6 sm:grid-cols-3" aria-label="Contact details">
        <div><p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" />Email</p><p className="break-all text-sm">{entry.email || '—'}</p></div>
        <div><p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" />Phone</p><p className="text-sm">{entry.phone || '—'}</p></div>
        <div><p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Received</p><p className="text-sm">{new Date(entry.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium', timeZone: 'Europe/London' })}</p></div>
      </section>
      {entry.message && <section className="crm-panel p-6"><h2 className="mb-4 flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-muted-foreground" />Message</h2><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{entry.message}</p></section>}
      <section className="space-y-4"><div><h2 className="text-base font-medium">Manage this record</h2><p className="crm-subtitle mt-1">View the full submission, add a note or use the available actions.</p></div><SubmissionsTable submissions={[entry]} recordOnly /></section>
    </> : <section className="crm-panel overflow-hidden"><div className="border-b p-6"><h2 className="text-base font-medium">Record information</h2></div><dl className="crm-detail-fields">{Object.entries(record.row || {}).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{value == null ? '—' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</dd></div>)}</dl></section>}
    <p className="text-xs text-muted-foreground">Payment information reflects the latest stored payment status.</p>
  </div>
}

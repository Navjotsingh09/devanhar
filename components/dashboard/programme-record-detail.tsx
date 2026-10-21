import Link from 'next/link'
import { notFound } from 'next/navigation'
import { programmeRecord } from '@/lib/crm/programme-record-detail'
import { listHref, type QueryParams } from '@/lib/crm/submissions'
import { programmeList, programmes, type CrmProgramme } from '@/lib/crm/programme-records'
import { PadelEntriesDashboard } from '@/components/padel/padel-entries-dashboard'
import { RootsBookingsTable } from '@/components/roots/roots-bookings-table'

export async function ProgrammeRecordDetail({ client, programme, kind, id, query = {} }: { client: any; programme: CrmProgramme; kind: string; id: string; query?: QueryParams }) {
  const config = programmes[programme]
  const state = programmeList(programme, { ...query, source: kind === 'recovered' ? 'recovery_payment_ledger' : config.live })
  const back = listHref(state.params, {}, config.path)
  let record
  try { record = await programmeRecord(client, programme, kind, id) }
  catch { return <div role="alert" className="space-y-3"><h1 className="text-xl font-semibold">Unable to load this record</h1><p>Please retry or contact your administrator.</p><Link prefetch={false} href={back} className="underline">Return to list</Link></div> }
  if (!record) notFound()
  return <div className="crm-page space-y-6"><Link prefetch={false} href={back} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">← {config.title}</Link><h1 className="crm-page-title">{kind === 'recovered' ? 'Recovered evidence details' : 'Record details'}</h1><p className="text-sm text-muted-foreground">View the record and use the available actions.</p>
    {record.type === 'padel' ? <PadelEntriesDashboard entries={[record.entry]} recordOnly /> : record.type === 'roots' ? <RootsBookingsTable bookings={[record.booking]} recordOnly /> : <dl className="crm-detail-fields crm-panel overflow-hidden">{Object.entries(record.row).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{value == null ? '—' : String(value)}</dd></div>)}</dl>}
  </div>
}

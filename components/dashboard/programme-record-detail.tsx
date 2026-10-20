import Link from 'next/link'
import { notFound } from 'next/navigation'
import { programmeRecord } from '@/lib/crm/programme-record-detail'
import { programmes, type CrmProgramme } from '@/lib/crm/programme-records'
import { PadelEntriesDashboard } from '@/components/padel/padel-entries-dashboard'
import { RootsBookingsTable } from '@/components/roots/roots-bookings-table'

export async function ProgrammeRecordDetail({ client, programme, kind, id }: { client: any; programme: CrmProgramme; kind: string; id: string }) {
  const config = programmes[programme]
  const back = config.path + (kind === 'recovered' ? '?source=recovery_payment_ledger' : '')
  let record
  try { record = await programmeRecord(client, programme, kind, id) }
  catch { return <div role="alert" className="space-y-3"><h1 className="text-xl font-semibold">Unable to load this record</h1><p>Please retry or contact your administrator.</p><Link prefetch={false} href={back} className="underline">Return to list</Link></div> }
  if (!record) notFound()
  return <div className="space-y-5"><Link prefetch={false} href={back} className="underline">← {config.title}</Link><h1 className="text-2xl font-bold">{kind === 'recovered' ? 'Recovered evidence details' : 'Record details'}</h1><p className="text-sm text-muted-foreground">One selected record. Existing decision and payment workflows are preserved.</p>
    {record.type === 'padel' ? <PadelEntriesDashboard entries={[record.entry]} recordOnly /> : record.type === 'roots' ? <RootsBookingsTable bookings={[record.booking]} recordOnly /> : <dl className="divide-y rounded-lg border p-4">{Object.entries(record.row).map(([key, value]) => <div key={key} className="grid gap-2 py-3 md:grid-cols-3"><dt className="font-medium">{key.replaceAll('_', ' ')}</dt><dd className="whitespace-pre-wrap break-all md:col-span-2">{value == null ? '—' : String(value)}</dd></div>)}</dl>}
  </div>
}

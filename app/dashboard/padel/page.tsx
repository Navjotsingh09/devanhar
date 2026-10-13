import Link from 'next/link'
import { requirePadelStaff } from '@/lib/padel-admin'
import { getPadelEntries } from '@/lib/padel-entries'
import { PadelEntriesDashboard, type PadelEntry } from '@/components/padel/padel-entries-dashboard'

export const dynamic = 'force-dynamic'

export default async function PadelDashboardPage() {
  const supabase = await requirePadelStaff()
  const entries = await getPadelEntries(supabase)
  const recovered = await supabase.from('recovery_payment_ledger')
    .select('id,source,occurred_at,amount,currency,payment_status,customer_name,customer_email,customer_phone,linked_record_id')
    .ilike('description','%Padel%').order('occurred_at', { ascending: false })
  // Linked ledger rows already appear as registrations; show unmatched records once.
  const ids = new Set(entries.map(entry => entry.id))
  const recoveredEntries: PadelEntry[] = (recovered.data || []).filter(row => !ids.has(row.linked_record_id)).map(row => ({
    id: row.id, name: row.customer_name || 'Unknown', email: row.customer_email || '', phone: row.customer_phone,
    amount: row.amount, currency: row.currency, status: 'pending',
    paymentStatus: row.payment_status === 'Paid' ? 'paid' : 'unverified',
    eventName: 'Recovered SPA payment', source: row.source, created_at: row.occurred_at || new Date().toISOString(),
  }))
  return <div className="space-y-6">
    <header><h1 className="text-3xl font-bold">SPA management</h1><p className="mt-2 text-sm text-muted-foreground">Manage registrations, tournaments, players and rankings.</p><Link href="/spa-admin" className="mt-4 inline-block rounded-full bg-[#0f2940] px-5 py-2.5 text-sm font-semibold text-white">Open dedicated SPA portal →</Link></header>
    <div className="flex flex-wrap gap-3">{[['players','Players'],['tournaments','Tournaments'],['results','Results'],['rankings','Rankings & parity'],['identities','Identity review']].map(([path,label]) => <Link className="rounded-lg border bg-white px-4 py-3 text-sm font-medium" key={path} href={`/dashboard/padel/${path}`}>{label}</Link>)}</div>
    <section id="registrations"><h2 className="mb-2 text-xl font-semibold">Tournament registrations</h2><p className="mb-4 text-sm text-muted-foreground">Application decisions and verified payment are shown separately. Declining does not refund money.</p><PadelEntriesDashboard entries={[...entries,...recoveredEntries]} /></section>
  </div>
}

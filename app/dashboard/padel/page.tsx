import Link from 'next/link'
import { requirePadelStaff } from '@/lib/padel-admin'
import { ProgrammeRecordsList } from '@/components/dashboard/programme-records-list'
import type { QueryParams } from '@/lib/crm/submissions'

export const dynamic = 'force-dynamic'

export default async function PadelDashboardPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const supabase = await requirePadelStaff()
  return <div className="space-y-6">
    <header><h1 className="text-3xl font-bold">SPA management</h1><p className="mt-2 text-sm text-muted-foreground">Manage registrations, tournaments, players and rankings.</p><Link prefetch={false} href="/spa-admin" className="mt-4 inline-block rounded-full bg-[#0f2940] px-5 py-2.5 text-sm font-semibold text-white">Open dedicated SPA portal →</Link></header>
    <div className="flex flex-wrap gap-3">{[['players','Players'],['tournaments','Tournaments'],['results','Results'],['rankings','Rankings & parity'],['identities','Identity review']].map(([path,label]) => <Link prefetch={false} className="rounded-lg border bg-white px-4 py-3 text-sm font-medium" key={path} href={`/dashboard/padel/${path}`}>{label}</Link>)}</div>
    <section id="registrations"><ProgrammeRecordsList client={supabase} programme="padel" input={await searchParams} /></section>
  </div>
}

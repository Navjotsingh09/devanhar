import Link from 'next/link'
import { requirePadelStaff } from '@/lib/padel-admin'
import { getPublicPadelLeaderboard } from '@/lib/padel-leaderboard'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
const card = 'rounded-[14px] border border-[#dedfe3] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)]'

export default async function SpaOperationsPage() {
  const supabase = await requirePadelStaff()
  const [tournamentQuery, resultsQuery, playerQuery, registrationsQuery, leaderboard] = await Promise.all([
    supabase.from('padel_tournaments').select('id,name,event_date,status,is_public,event_time,venue,address').order('event_date', { ascending: false }),
    supabase.from('padel_tournament_results').select('id,tournament_id'),
    supabase.from('padel_players').select('id,first_name,last_name,country_code,is_active'),
    supabase.from('padel_registrations').select('id,status,payment_status'),
    getPublicPadelLeaderboard(),
  ])
  const error = tournamentQuery.error || resultsQuery.error || playerQuery.error || registrationsQuery.error
  const tournaments = tournamentQuery.data || []
  const results = resultsQuery.data || []
  const players = playerQuery.data || []
  const names = new Map<string, number>()
  for (const player of players.filter(p => p.is_active)) {
    const name = `${player.first_name} ${player.last_name || ''}`.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()
    names.set(name, (names.get(name) || 0) + 1)
  }
  const collisions = [...names.values()].filter(n => n > 1).length
  const current = tournaments.find(t => t.is_public) || tournaments[0]
  const currentResults = results.filter(r => r.tournament_id === current?.id).length
  const activeRegistrations = (registrationsQuery.data || []).filter(r => r.status !== 'archived')
  const pendingPayments = activeRegistrations.filter(r => r.payment_status !== 'paid').length
  const health = [
    ['Ranking data', error ? 'Check connection' : 'Available', error ? 'warning' : 'complete'],
    ['Spreadsheet parity', 'Comparison required', 'warning'],
    ['Identity issues', String(collisions), collisions ? 'warning' : 'complete'],
    ['Unfinalised events', String(tournaments.filter(t => t.status !== 'finalized').length), 'warning'],
    ['Payment matching', 'Receipt verification', 'warning'],
  ]
  return <div className="space-y-[18px]">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-[28px] font-bold leading-[38px]">SPA operations</h1><p className="mt-1 text-xs text-[#6a6d77]">Tournament progress, ranking health and release readiness.</p></div><div className="flex gap-2"><Button variant="outline" asChild className="rounded-full"><Link href="/spa-admin/results">Import results</Link></Button><Button asChild className="rounded-full bg-[#0f2940] text-white"><Link href="/spa-admin/tournaments">Create tournament</Link></Button></div></header>
    <section className={`${card} flex flex-wrap items-center gap-3`}><span className="rounded-full bg-[#fff2dc] px-3 py-1.5 text-[10px] font-semibold text-[#9a610c]">PARITY CHECK REQUIRED</span><div className="flex-1"><p className="text-sm font-semibold">Compare the official spreadsheet before release sign-off</p><p className="mt-1 text-xs text-[#6a6d77]">Names, points, dense ranks and nationality must match. Counts alone do not verify the ranking.</p></div><Link href="/spa-admin/rankings#parity" className="text-xs font-semibold underline underline-offset-4">Run comparison →</Link></section>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Some SPA data could not be loaded: {error.message}</p>}
    <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">{[
      [leaderboard.length,'Ranked players','Official current table'],
      [tournaments.length,'Tournaments',`${tournaments.filter(t => t.status === 'finalized').length} finalised · ${tournaments.filter(t => t.status !== 'finalized').length} draft`],
      [results.length,'Saved result records','Performance data'],
      [activeRegistrations.length,'Active registrations',`${pendingPayments} payments pending or unverified`],
    ].map(([value,label,description]) => <div key={String(label)} className="rounded-xl border border-[#dedfe3] bg-white p-[14px]"><p className="text-[22px] font-bold leading-[30px]">{value}</p><p className="mt-1 text-xs font-semibold">{label}</p><p className="mt-1 text-[11px] text-[#6a6d77]">{description}</p></div>)}</div>
    <div className="grid items-start gap-[14px] lg:grid-cols-2 xl:grid-cols-[1fr_1fr_315px]">
      <section className={`${card} space-y-3`}><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-bold">Current tournament</h2><p className="mt-1 text-xs text-[#6a6d77]">{current?.name || 'No tournament yet'}</p></div>{current && <span className="rounded-full bg-[#fff2dc] px-3 py-1 text-[10px] font-semibold text-[#9a610c]">{current.status === 'finalized' ? 'FINAL' : 'DRAFT'}</span>}</div>
        <div className="rounded-[10px] bg-[#f4f4f6] p-3"><p className="text-[10px] font-bold tracking-wide text-[#c98616]">WORKFLOW POSITION</p><p className="mt-2 text-sm font-semibold">{currentResults ? 'Tournament results saved' : current ? 'Event setup complete' : 'Create your first tournament'}</p><p className="mt-1 text-xs text-[#6a6d77]">{currentResults ? 'Review identities and spreadsheet parity' : 'Next: enter player results'}</p></div>
        {[
          ['Event setup', current ? 'complete' : 'waiting'],
          ['Results entry', currentResults ? 'complete' : 'warning'],
          ['Identity check', collisions ? 'warning' : 'complete'],
          ['Validation', 'waiting'], ['Finalise', current?.status === 'finalized' ? 'complete' : 'waiting'],
        ].map(([label,tone]) => <div key={label} className="flex items-center gap-[9px] text-xs text-[#6a6d77]"><img src={`/spa-admin-assets/${tone}.svg`} alt="" width={9} height={9} />{label}</div>)}
        <Button asChild className="rounded-full bg-[#0f2940] text-white"><Link href={current ? `/spa-admin/tournaments/${current.id}/results` : '/spa-admin/tournaments'}>Continue tournament →</Link></Button>
      </section>
      <section className={`${card} space-y-3`}><div className="flex items-center justify-between"><h2 className="text-base font-bold">Recent tournaments</h2><Link href="/spa-admin/tournaments" className="text-xs font-semibold">View all →</Link></div>{tournaments.slice(0,5).map(t => <Link key={t.id} href={`/spa-admin/tournaments/${t.id}/results`} className="flex items-center justify-between gap-3 border-b border-[#dedfe3] py-3 last:border-0"><div><p className="text-xs font-semibold">{t.name}</p><p className="mt-1 text-[11px] text-[#6a6d77]">{new Date(t.event_date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · {results.filter(r => r.tournament_id === t.id).length} result records</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${t.status === 'finalized' ? 'bg-[#e9f4ee] text-[#2f7d5a]' : 'bg-[#fff2dc] text-[#9a610c]'}`}>{t.status === 'finalized' ? 'FINAL' : 'DRAFT'}</span></Link>)}{!tournaments.length && <p className="py-4 text-sm text-[#6a6d77]">No tournaments recorded.</p>}</section>
      <section className={`${card} min-h-[480px] space-y-4`}><h2 className="text-base font-bold">System health</h2>{health.map(([label,value,tone]) => <div key={label} className="flex items-center justify-between gap-3"><div><p className="text-[11px] text-[#6a6d77]">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div><img src={`/spa-admin-assets/health-${tone}.svg`} alt="" width={8} height={8} /></div>)}<div className="border-t border-[#dedfe3] pt-4"><p className="text-[10px] font-bold tracking-wide text-[#c98616]">QUICK ACTIONS</p><div className="mt-3 space-y-2">{[['/spa-admin/rankings#parity','Run parity check'],['/spa-admin/identities','Resolve identities'],['/spa-admin/players','Manage players'],['/spa-admin/registrations','Review registrations']].map(([href,label]) => <Link key={href} href={href} className="flex items-center justify-between rounded-[10px] bg-[#f4f4f6] px-3 py-2.5 text-xs font-semibold"><span>{label}</span><span>→</span></Link>)}</div></div></section>
    </div>
  </div>
}

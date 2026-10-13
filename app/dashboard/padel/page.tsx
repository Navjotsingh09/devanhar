import Link from "next/link"
import { ClipboardCheck, ClipboardList, Flag, Trophy, Users, ArrowUpRight } from "lucide-react"
import { requirePadelStaff } from "@/lib/padel-admin"
import { createClient } from "@supabase/supabase-js"
import { PadelEntriesDashboard, type PadelEntry } from "@/components/padel/padel-entries-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export const dynamic = "force-dynamic"
async function getData(): Promise<PadelEntry[]> { const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || ""); const [live, recovery] = await Promise.all([supabase.from("padel_registrations").select("*").order("created_at", { ascending: false }), supabase.from("recovery_payment_ledger").select("id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, customer_phone").ilike("description", "%Padel%").order("occurred_at", { ascending: false })]); const liveEntries = (live.data || []).map((r) => ({ id: r.id, name: `${r.captain_first_name} ${r.captain_last_name}`, email: r.captain_email, phone: r.captain_phone, amount: r.entry_fee_pence ? r.entry_fee_pence / 100 : null, currency: "GBP", status: r.status === "approved" ? "confirmed" : r.status === "payment_pending" ? "awaiting" : "not_paid", source: "Live registration", created_at: r.created_at, details: r, isLiveRegistration: true } as PadelEntry)); const recoveredEntries = (recovery.data || []).map((r) => ({ id: r.id, name: r.customer_name || "Unknown", email: r.customer_email || "", phone: r.customer_phone, amount: r.amount, currency: r.currency, status: r.payment_status === "Paid" || (r.source === "donation_manager" && r.payment_status === "recorded") ? "confirmed" : r.payment_status === "requires_payment_method" ? "awaiting" : "not_paid", source: r.source === "donation_manager" ? "Recovered Donation Manager" : "Recovered Stripe", created_at: r.occurred_at || new Date().toISOString() } as PadelEntry)); return [...liveEntries, ...recoveredEntries].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) }
export default async function PadelDashboardPage() {
 const staffSupabase = await requirePadelStaff()
 const [playerCount, tournamentCount, resultCount, statsReady] = await Promise.all([
  staffSupabase.from("padel_players").select("id", { count: "exact", head: true }),
  staffSupabase.from("padel_tournaments").select("id", { count: "exact", head: true }),
  staffSupabase.from("padel_tournament_results").select("id", { count: "exact", head: true }),
  staffSupabase.from("padel_players").select("id, country_code").limit(1),
 ])
 const entries = await getData(); const confirmed = entries.filter((entry) => entry.status === "confirmed").length; const awaiting = entries.filter((entry) => entry.status === "awaiting").length; const notPaid = entries.filter((entry) => entry.status === "not_paid").length; return <div className="space-y-6">
 <section className="overflow-hidden rounded-2xl bg-[#0f2940] p-6 text-white md:p-8">
   <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="max-w-2xl">
     <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f0b83b]">Sikh Padel Association · Operations</p>
     <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">SPA management</h1>
     <p className="mt-3 text-sm leading-6 text-white/75 md:text-base">
      Manage registrations, approved player identities, tournaments, results and the automatic six-level ranking system in one place.
     </p>
    </div>
    <Link href="/spa/leaderboard" target="_blank" rel="noopener noreferrer"
     className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
      View public rankings <ArrowUpRight className="h-4 w-4" />
    </Link>
   </div>
 </section>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
   {([
     { href: "/dashboard/padel/players", title: "Players", value: playerCount.error ? "—" : String(playerCount.count ?? 0), icon: Users, detail: "Profiles & nationality" },
     { href: "/dashboard/padel/tournaments", title: "Tournaments", value: tournamentCount.error ? "—" : String(tournamentCount.count ?? 0), icon: Trophy, detail: "Events & scoring stages" },
     { href: "/dashboard/padel/results", title: "Result records", value: resultCount.error ? "—" : String(resultCount.count ?? 0), icon: ClipboardList, detail: "Saved performance data" },
     { href: "/dashboard/padel/rankings", title: "Ranking V2", value: statsReady.error ? "Check setup" : "Manage", icon: ClipboardCheck, detail: "Dense ranks & source parity" }
   ]).map((item) => {
     const Icon = item.icon
     return <Link href={item.href} key={item.title} className="group rounded-xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between"><Icon className="h-5 w-5 text-muted-foreground" /><ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" /></div>
      <p className="text-sm font-semibold">{item.title}</p>
      <p className="mt-1 text-2xl font-bold">{item.value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
     </Link>
   })}
 </div>
 <div className="flex flex-wrap gap-3">
   <Link className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted" href="/dashboard/padel/identities"><Flag className="mr-2 inline h-4 w-4" />Review identities</Link>
   <Link className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted" href="/dashboard/padel/rankings">Compare approved spreadsheet</Link>
   <Link className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted" href="/dashboard/padel/tournaments">Manage tournaments</Link>
 </div>
 <div id="registrations" className="rounded-xl border bg-card p-5">
 <h2 className="text-lg font-semibold">Tournament registrations</h2>
 <p className="mt-1 text-sm text-muted-foreground">Existing live registration and recovered-payment workflow, kept separate from the ranking engine.</p>
 </div>
 <div><h1 className="text-xl font-semibold text-foreground">Registration overview</h1><p className="mt-1 text-sm text-muted-foreground">Live registrations and recovered records grouped by payment status.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total entries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{entries.length}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Confirmed paid</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">{confirmed}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Awaiting payment</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{awaiting}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Not paid</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{notPaid}</p></CardContent></Card></div><div><h2 className="mb-3 text-lg font-semibold">Entries</h2><PadelEntriesDashboard entries={entries} /></div></div> }

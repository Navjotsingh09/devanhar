import Link from "next/link"
import { AlertTriangle, ArrowUpRight, CheckCircle2, ClipboardCheck, Trophy, Users } from "lucide-react"
import { requirePadelStaff } from "@/lib/padel-admin"
import { getPublicPadelLeaderboard, formatCountryFlag } from "@/lib/padel-leaderboard"
import { SPAParityChecker } from "@/components/padel/spa-parity-checker"
import { checkSPAWorkbookParity } from '@/lib/spa-handoff'
import { SPAWorkbookUploader } from '@/components/padel/spa-workbook-uploader'

export const dynamic = "force-dynamic"

function normalizeName(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB")
}

export default async function SPARankingsAdminPage() {
  const supabase = await requirePadelStaff()

  const [rawPlayers, schemaCheck, rawResults, events] = await Promise.all([
    supabase.from("padel_players").select("id, first_name, last_name, is_active"),
    supabase.from("padel_players").select("id, country_code").limit(1),
    supabase.from("padel_tournament_results")
      .select("id, matches_played, match_wins, group_points_won, group_points_possible").limit(1),
    supabase.from('padel_tournaments').select('id, name, event_date').order('event_date'),
  ])

  let leaderboard: Awaited<ReturnType<typeof getPublicPadelLeaderboard>> = []
  let leaderboardError: string | null = null
  try {
    leaderboard = await getPublicPadelLeaderboard()
  } catch (error) {
    leaderboardError = error instanceof Error ? error.message : "Leaderboard data is unavailable"
  }

  const names = new Map<string, number>()
  for (const player of rawPlayers.data || []) {
    if (!player.is_active) continue
    const name = normalizeName([player.first_name, player.last_name].filter(Boolean).join(" "))
    if (name) names.set(name, (names.get(name) || 0) + 1)
  }
  const potentialDuplicates = [...names.entries()].filter(([, count]) => count > 1)
  const schemaReady = !schemaCheck.error && !rawResults.error
  const activeCount = (rawPlayers.data || []).filter((player) => player.is_active).length
  const errorMessage = rawPlayers.error?.message || leaderboardError
  const parity = checkSPAWorkbookParity(leaderboard)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">SPA Ranking System V2</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Ranking operations</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Read-only official ranking order. To change a rank, correct its player or tournament
            results; the six-level engine recalculates dense ranks automatically.
          </p>
        </div>
        <Link href="/spa/leaderboard" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          Public leaderboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <Users className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="text-3xl font-bold tabular-nums">{leaderboard.length}</p>
          <p className="text-sm text-muted-foreground">Ranked players ({activeCount} active records)</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <Trophy className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="text-3xl font-bold tabular-nums">{leaderboard[0]?.total_points.toLocaleString("en-GB") ?? "—"}</p>
          <p className="text-sm text-muted-foreground">Highest ranking points</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          {schemaReady ? <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" /> : <AlertTriangle className="mb-3 h-5 w-5 text-amber-600" />}
          <p className="text-lg font-bold">{schemaReady ? "V2 columns available" : "Migration check needed"}</p>
          <p className="text-sm text-muted-foreground">Nationality and performance statistics</p>
        </div>
      </div>

      <SPAWorkbookUploader events={events.data || []} importReady />

      <div className={`rounded-xl border p-4 text-sm ${parity.passed ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-amber-300 bg-amber-50 text-amber-950'}`}>
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{parity.passed ? 'Workbook parity verified — all 99 players' : `Workbook parity: ${parity.issues.length} issue(s)`}</p>
            <p className="mt-1">Live comparison checks immutable player identities, names, points, dense ranks and all six ranking inputs against the October 2026 handoff. Country flags remain independently editable.</p>
            {!parity.passed && <ul className="mt-2 list-disc pl-5">{parity.issues.slice(0, 5).map((issue) => <li key={issue}>{issue}</li>)}</ul>}
            <p className="mt-2">London group scores use the handoff's 32-points-per-game assumption. Correct the scored and total points if shortened games or walkovers are confirmed. The London date is retained from the existing event record.</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load SPA data: {errorMessage}
        </div>
      )}

      {!schemaReady && (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          Apply the additive <code>supabase-padel-ranking-v2.sql</code> migration in the correct
          Supabase project before editing nationality or entering complete V2 match stats.
          Database migrations are not applied automatically by Vercel.
        </p>
      )}

      {potentialDuplicates.length > 0 && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>{potentialDuplicates.length} possible duplicate player names.</strong>
          {" "}Review before importing results. Identical names are not sufficient proof that
          two records represent the same person.{" "}
          <Link href="/dashboard/padel/identities" className="font-semibold underline">Review identities</Link>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <h2 className="font-semibold">Calculated ranking</h2>
          <span className="text-xs text-muted-foreground">Points → titles → runners-up → wins → win % → group points %</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rank</th><th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Titles</th>
                <th className="px-4 py-3 text-right">Runner-up</th>
                <th className="px-4 py-3 text-right">Wins</th>
                <th className="px-4 py-3 text-right">Win %</th>
                <th className="px-4 py-3 text-right">Group pts %</th>
                <th className="px-4 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-bold tabular-nums">#{row.rank}</td>
                  <td className="px-4 py-3 font-medium">{formatCountryFlag(row.country_code)} {[row.first_name, row.last_name].filter(Boolean).join(" ")}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{row.total_points.toLocaleString("en-GB")}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.titles}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.runner_up_finishes}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.match_wins}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.win_percentage.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.group_points_won_percentage.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="text-primary underline-offset-4 hover:underline" href={`/spa/leaderboard/${row.id}`} target="_blank">View</Link>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                No ranking data yet. Import approved players and tournament results first.
              </td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <SPAParityChecker leaderboard={leaderboard.map((row) => ({
        id: row.id,
        name: [row.first_name, row.last_name].filter(Boolean).join(" "),
        rank: row.rank,
        points: row.total_points,
      }))} />

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/padel/players" className="rounded-lg border px-4 py-2 hover:bg-muted">Manage players</Link>
        <Link href="/dashboard/padel/tournaments" className="rounded-lg border px-4 py-2 hover:bg-muted">Manage tournaments</Link>
        <Link href="/dashboard/padel/results" className="rounded-lg border px-4 py-2 hover:bg-muted">Enter results</Link>
      </div>
    </div>
  )
}

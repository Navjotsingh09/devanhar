import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Trophy, ExternalLink } from "lucide-react"
import { getPublicSupabaseClient } from "@/lib/supabase/public"
import { computeDenseLeaderboardRanks } from "@/lib/padel-ranking"
import { PadelLeaderboardTable, type LeaderboardRow } from "@/components/padel/padel-leaderboard-table"
import { PADEL_LIVE_SCORES_URL } from "@/components/padel/padel-event"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Leaderboard | Sikh Padel Association | Devanhaar",
  description:
    "Season-long individual player rankings for the Sikh Padel Association.",
}

async function getLeaderboardRows(): Promise<LeaderboardRow[]> {
  const supabase = getPublicSupabaseClient()

  // Preferred v2 source: database view implements the spreadsheet rules exactly.
  const { data: v2Rows, error: v2Error } = await supabase
    .from("padel_leaderboard_v2")
    .select("id, display_name, photo_url, ranking_points, titles, runner_up_finishes, match_wins, appearances, pending_finishes, win_percentage, matches_played, group_points_won_pct, rank")
    .order("rank", { ascending: true })
    .order("display_name", { ascending: true })

  if (!v2Error && v2Rows) {
    return v2Rows.map((row) => ({
      id: row.id,
      display_name: row.display_name,
      photo_url: row.photo_url,
      total_points: row.ranking_points,
      ranking_points: row.ranking_points,
      titles: row.titles,
      runner_up_finishes: row.runner_up_finishes,
      match_wins: row.match_wins,
      appearances: row.appearances,
      pending_finishes: row.pending_finishes,
      win_percentage: Number(row.win_percentage || 0),
      matches_played: row.matches_played,
      group_points_won_pct: Number(row.group_points_won_pct || 0),
      rank: row.rank,
      movement: "same",
    }))
  }

  // Backward-compatible fallback before the v2 migration is applied.
  const { data: players } = await supabase
    .from("padel_players")
    .select("id, first_name, last_name, photo_url, total_points")
    .eq("is_active", true)

  const ranked = computeDenseLeaderboardRanks(
    (players || []).map((p) => ({
      id: p.id,
      display_name: `${p.first_name} ${p.last_name}`.trim(),
      photo_url: p.photo_url,
      ranking_points: p.total_points,
      titles: 0,
      runner_up_finishes: 0,
      match_wins: 0,
      appearances: 0,
      pending_finishes: 0,
      win_percentage: 0,
      matches_played: 0,
      group_points_won_pct: 0,
    }))
  )

  return ranked.map((p) => ({
    ...p,
    total_points: p.ranking_points,
    movement: "same",
  }))
}

export default async function PadelLeaderboardPage() {
  const rows = await getLeaderboardRows()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-20 max-w-6xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
              <Trophy className="h-8 w-8 text-[hsl(43,100%,29%)]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Player leaderboard
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Rankings update automatically from tournament results using SPA&apos;s official points and tie-break rules.
            </p>
            {PADEL_LIVE_SCORES_URL && (
              <a
                href={PADEL_LIVE_SCORES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[hsl(43,100%,29%)] hover:underline"
              >
                Live tournament scores <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <PadelLeaderboardTable rows={rows} />

          <div className="mt-10 text-center">
            <Link href="/initiatives/sikh-padel-association">
              <Button variant="secondary" className="rounded-full px-6">
                Back to Sikh Padel Association
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Trophy, ExternalLink } from "lucide-react"
import { getPublicSupabaseClient } from "@/lib/supabase/public"
import { computeRanksWithTies, getMovement } from "@/lib/padel-ranking"
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

  const { data: players } = await supabase
    .from("padel_players")
    .select("id, first_name, last_name, photo_url, total_points")
    .eq("is_active", true)

  const ranked = computeRanksWithTies(
    (players || []).map((p) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      photo_url: p.photo_url,
      total_points: p.total_points,
    }))
  )

  const { data: tournaments } = await supabase
    .from("padel_tournaments")
    .select("id, event_date")
    .order("event_date", { ascending: false })

  const { data: snapshots } = await supabase
    .from("padel_ranking_snapshots")
    .select("tournament_id, player_id, rank")

  const snapshotTournamentIds = new Set((snapshots || []).map((s) => s.tournament_id))
  const orderedSnapshotTournaments = (tournaments || []).filter((t) => snapshotTournamentIds.has(t.id))
  const previousTournamentId = orderedSnapshotTournaments[1]?.id || null

  const previousRankByPlayer = new Map<string, number>()
  if (previousTournamentId) {
    for (const s of snapshots || []) {
      if (s.tournament_id === previousTournamentId) previousRankByPlayer.set(s.player_id, s.rank)
    }
  }

  return ranked.map((p) => ({
    ...p,
    movement: getMovement(p.rank, previousRankByPlayer.get(p.id) ?? null),
  }))
}

export default async function PadelLeaderboardPage() {
  const rows = await getLeaderboardRows()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-20 max-w-4xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
              <Trophy className="h-8 w-8 text-[hsl(43,100%,29%)]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Player leaderboard
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Season-long individual player rankings, updated after every Sikh Padel Association tournament.
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

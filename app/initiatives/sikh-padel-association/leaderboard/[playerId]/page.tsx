import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { UserCircle2, ArrowLeft } from "lucide-react"
import { getPublicSupabaseClient } from "@/lib/supabase/public"
import { getPositionLabel } from "@/lib/padel-ranking"

export const dynamic = "force-dynamic"

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export default async function PadelPlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params
  const supabase = getPublicSupabaseClient()

  const { data: rankedPlayer, error: rankedError } = await supabase
    .from("padel_leaderboard_v2")
    .select("id, display_name, photo_url, city_country, ranking_points, titles, runner_up_finishes, match_wins, appearances, win_percentage, matches_played, group_points_won_pct, rank")
    .eq("id", playerId)
    .maybeSingle()

  let player = rankedPlayer
  if (rankedError || !rankedPlayer) {
    const { data: fallback } = await supabase
      .from("padel_players")
      .select("id, first_name, last_name, photo_url, city_country, total_points, is_active")
      .eq("id", playerId)
      .single()

    if (!fallback) notFound()

    player = {
      id: fallback.id,
      display_name: `${fallback.first_name} ${fallback.last_name}`.trim(),
      photo_url: fallback.photo_url,
      city_country: fallback.city_country,
      ranking_points: fallback.total_points,
      titles: 0,
      runner_up_finishes: 0,
      match_wins: 0,
      appearances: 0,
      win_percentage: 0,
      matches_played: 0,
      group_points_won_pct: 0,
      rank: null,
    }
  }

  const { data: results } = await supabase
    .from("padel_tournament_results")
    .select("finishing_position, points_awarded, partner_player_id, source_tournament_code, match_wins, matches_played, group_points_scored, group_points_conceded, padel_tournaments(name, event_date)")
    .eq("player_id", player.id)
    .not("source_result_id", "is", null)

  const partnerIds = (results || []).map((r) => r.partner_player_id).filter((id): id is string => Boolean(id))
  const { data: partners } = partnerIds.length
    ? await supabase.from("padel_players").select("id, first_name, last_name, display_name").in("id", partnerIds)
    : { data: [] }

  const partnerNameById = new Map(
    (partners || []).map((p) => [p.id, p.display_name || `${p.first_name} ${p.last_name}`.trim()])
  )

  const history = (results || [])
    .map((r) => {
      const tournament = Array.isArray(r.padel_tournaments) ? r.padel_tournaments[0] : r.padel_tournaments
      const groupTotal = Number(r.group_points_scored || 0) + Number(r.group_points_conceded || 0)
      return {
        tournamentName: tournament?.name || r.source_tournament_code || "Tournament",
        eventDate: tournament?.event_date || "",
        finishingPosition: r.finishing_position,
        partnerName: r.partner_player_id ? partnerNameById.get(r.partner_player_id) || null : null,
        points: Number(r.points_awarded || 0),
        matchWins: Number(r.match_wins || 0),
        matchesPlayed: Number(r.matches_played || 0),
        groupPct: groupTotal > 0 ? Number(r.group_points_scored || 0) / groupTotal : 0,
      }
    })
    .sort((a, b) => {
      if (a.eventDate && b.eventDate) return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      return b.tournamentName.localeCompare(a.tournamentName)
    })

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-20 max-w-4xl">
          <Link
            href="/initiatives/sikh-padel-association/leaderboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to leaderboard
          </Link>

          <div className="flex items-center gap-6 mb-8">
            {player.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo_url} alt={player.display_name} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <UserCircle2 className="h-24 w-24 text-muted-foreground" />
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">{player.display_name}</h1>
              {player.city_country && <p className="text-muted-foreground">{player.city_country}</p>}
              <div className="mt-2 flex items-center gap-4 text-sm">
                {player.rank && <span className="font-semibold text-foreground">Rank #{player.rank}</span>}
                <span className="font-semibold text-[hsl(43,100%,29%)]">{player.ranking_points} points</span>
              </div>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-6">
            <div className="rounded-lg border p-3"><div className="text-xl font-bold">{player.titles}</div><div className="text-xs text-muted-foreground">Titles</div></div>
            <div className="rounded-lg border p-3"><div className="text-xl font-bold">{player.runner_up_finishes}</div><div className="text-xs text-muted-foreground">Runner-up</div></div>
            <div className="rounded-lg border p-3"><div className="text-xl font-bold">{player.match_wins}</div><div className="text-xs text-muted-foreground">Match wins</div></div>
            <div className="rounded-lg border p-3"><div className="text-xl font-bold">{player.matches_played}</div><div className="text-xs text-muted-foreground">Matches</div></div>
            <div className="rounded-lg border p-3"><div className="text-xl font-bold">{pct(Number(player.win_percentage || 0))}</div><div className="text-xs text-muted-foreground">Win rate</div></div>
            <div className="rounded-lg border p-3"><div className="text-xl font-bold">{pct(Number(player.group_points_won_pct || 0))}</div><div className="text-xs text-muted-foreground">Group pts won</div></div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Tournament history</h2>
          {history.length === 0 ? (
            <p className="text-muted-foreground">No tournament results recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tournament</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Finish</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partner</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">W / M</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Group %</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{row.tournamentName}</div>
                        {row.eventDate && <div className="text-xs text-muted-foreground">{row.eventDate}</div>}
                      </td>
                      <td className="px-4 py-3">{row.finishingPosition ? getPositionLabel(row.finishingPosition) : "Pending"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.partnerName || "-"}</td>
                      <td className="px-4 py-3 text-right">{row.matchWins} / {row.matchesPlayed}</td>
                      <td className="px-4 py-3 text-right">{pct(row.groupPct)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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

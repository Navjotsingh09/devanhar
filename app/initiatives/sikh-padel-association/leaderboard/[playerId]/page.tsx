import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { UserCircle2, ArrowLeft } from "lucide-react"
import { getPublicSupabaseClient } from "@/lib/supabase/public"
import { computeRanksWithTies, getPositionLabel } from "@/lib/padel-ranking"

export const dynamic = "force-dynamic"

export default async function PadelPlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params
  const supabase = getPublicSupabaseClient()

  const { data: player } = await supabase
    .from("padel_players")
    .select("id, first_name, last_name, photo_url, city_country, total_points, is_active")
    .eq("id", playerId)
    .single()

  if (!player) notFound()

  const { data: activePlayers } = await supabase
    .from("padel_players")
    .select("id, total_points")
    .eq("is_active", true)
  const ranked = computeRanksWithTies((activePlayers || []).map((p) => ({ id: p.id, total_points: p.total_points })))
  const currentRank = ranked.find((p) => p.id === player.id)?.rank ?? null

  const { data: results } = await supabase
    .from("padel_tournament_results")
    .select("finishing_position, points_awarded, partner_player_id, padel_tournaments(name, event_date)")
    .eq("player_id", player.id)

  const partnerIds = (results || []).map((r) => r.partner_player_id).filter((id): id is string => Boolean(id))
  const { data: partners } = partnerIds.length
    ? await supabase.from("padel_players").select("id, first_name, last_name").in("id", partnerIds)
    : { data: [] }
  const partnerNameById = new Map((partners || []).map((p) => [p.id, `${p.first_name} ${p.last_name}`]))

  const history = (results || [])
    .map((r) => {
      const tournament = Array.isArray(r.padel_tournaments) ? r.padel_tournaments[0] : r.padel_tournaments
      return {
        tournamentName: tournament?.name || "Tournament",
        eventDate: tournament?.event_date || "",
        finishingPosition: r.finishing_position,
        partnerName: r.partner_player_id ? partnerNameById.get(r.partner_player_id) || null : null,
        points: r.points_awarded,
      }
    })
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-20 max-w-3xl">
          <Link
            href="/initiatives/sikh-padel-association/leaderboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to leaderboard
          </Link>

          <div className="flex items-center gap-6 mb-10">
            {player.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo_url} alt={`${player.first_name} ${player.last_name}`} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <UserCircle2 className="h-24 w-24 text-muted-foreground" />
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">{player.first_name} {player.last_name}</h1>
              {player.city_country && <p className="text-muted-foreground">{player.city_country}</p>}
              <div className="mt-2 flex items-center gap-4 text-sm">
                {currentRank && <span className="font-semibold text-foreground">Rank #{currentRank}</span>}
                <span className="font-semibold text-[hsl(43,100%,29%)]">{player.total_points} points</span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Tournament history</h2>
          {history.length === 0 ? (
            <p className="text-muted-foreground">No tournament results recorded yet.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tournament</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Finishing position</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partner</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{row.tournamentName}</div>
                        <div className="text-xs text-muted-foreground">{row.eventDate}</div>
                      </td>
                      <td className="px-4 py-3">{getPositionLabel(row.finishingPosition)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.partnerName || "—"}</td>
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

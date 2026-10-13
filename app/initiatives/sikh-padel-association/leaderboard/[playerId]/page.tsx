import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { getPublicSupabaseClient } from "@/lib/supabase/public"
import { formatCountryFlag, getPublicPadelLeaderboard } from "@/lib/padel-leaderboard"
import { getPositionLabel } from "@/lib/padel-ranking"

export const dynamic = "force-dynamic"

export default async function PadelPlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params
  const supabase = getPublicSupabaseClient()

  const leaderboard = await getPublicPadelLeaderboard()
  const rankedPlayer = leaderboard.find((player) => player.id === playerId)
  if (!rankedPlayer) notFound()

  const [{ data: player }, { data: results }, { data: snapshots }, { data: tournaments }] =
    await Promise.all([
      supabase
        .from("padel_players")
        .select("id, city_country, is_active")
        .eq("id", playerId)
        .single(),
      supabase
        .from("padel_tournament_results")
        .select(
          "finishing_position, points_awarded, partner_player_id, matches_played, match_wins, group_points_won, group_points_possible, tournament_id"
        )
        .eq("player_id", playerId),
      supabase
        .from("padel_ranking_snapshots")
        .select("tournament_id, rank, total_points")
        .eq("player_id", playerId),
      supabase
        .from("padel_tournaments")
        .select("id, name, event_date")
        .order("event_date", { ascending: false }),
    ])

  const tournamentById = new Map(
    (tournaments || []).map((tournament) => [tournament.id, tournament])
  )

  const partnerIds = (results || [])
    .map((result) => result.partner_player_id)
    .filter((id): id is string => Boolean(id))

  const { data: partners } = partnerIds.length
    ? await supabase
        .from("padel_players")
        .select("id, first_name, last_name")
        .in("id", partnerIds)
    : { data: [] }

  const partnerNameById = new Map(
    (partners || []).map((partner) => [
      partner.id,
      [partner.first_name, partner.last_name].filter(Boolean).join(" "),
    ])
  )

  const history = (results || [])
    .map((result) => {
      const tournament = tournamentById.get(result.tournament_id)
      return {
        tournamentName: tournament?.name || "Tournament",
        eventDate: tournament?.event_date || "",
        finishingPosition: result.finishing_position,
        partnerName: result.partner_player_id
          ? partnerNameById.get(result.partner_player_id) || null
          : null,
        points: result.points_awarded,
        matchWins: result.match_wins || 0,
        matchesPlayed: result.matches_played || 0,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    )

  const trajectory = (snapshots || [])
    .map((snapshot) => {
      const tournament = tournamentById.get(snapshot.tournament_id)
      return {
        rank: snapshot.rank,
        tournamentName: tournament?.name || "Tournament",
        eventDate: tournament?.event_date || "",
      }
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
    .slice(-5)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafb] pt-20">
        <section className="bg-[#0f2940]">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-12">
            <div>
              <Link
                href="/spa/leaderboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8d4dc] hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to leaderboard
              </Link>

              <span className="mt-6 inline-flex rounded-full bg-[#e6a429] px-3 py-1.5 text-[10px] font-semibold text-[#0f2940]">
                {formatCountryFlag(rankedPlayer.country_code)} {rankedPlayer.country_code === "NO" ? "NORWAY" : rankedPlayer.country_code === "GB" ? "UNITED KINGDOM" : rankedPlayer.country_code}
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                {rankedPlayer.first_name} {rankedPlayer.last_name}
              </h1>
              <p className="mt-2 text-sm text-[#b9c8d1]">
                SPA player · {history.length} ranked {history.length === 1 ? "event" : "events"}
                {player?.city_country ? " · " + player.city_country : ""}
              </p>

              <div className="mt-6 flex flex-wrap gap-8">
                <div>
                  <p className="text-[9px] font-bold text-[#e6a429]">CURRENT RANK</p>
                  <p className="mt-1 text-lg font-semibold text-white">#{rankedPlayer.rank}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#e6a429]">RANKING POINTS</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {rankedPlayer.total_points.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#e6a429]">BEST FINISH</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {rankedPlayer.titles > 0 ? "Champion" : rankedPlayer.runner_up_finishes > 0 ? "Runner-up" : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[270px] rounded-[16px] bg-white p-5 text-[#0f2940] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <p className="text-[9px] font-bold text-[#e6a429]">CURRENT POSITION</p>
              <p className="mt-2 text-5xl font-bold">#{rankedPlayer.rank}</p>
              <p className="mt-3 text-xs font-semibold text-[#2f7d5a]">
                {rankedPlayer.movement === "up"
                  ? "↑ Up since previous update"
                  : rankedPlayer.movement === "down"
                    ? "↓ Down since previous update"
                    : rankedPlayer.movement === "new"
                      ? "New to the ranking"
                      : "No change"}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-12 lg:py-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              [rankedPlayer.total_points.toLocaleString(), "Points"],
              [String(rankedPlayer.titles), "Titles"],
              [String(rankedPlayer.runner_up_finishes), "Runner-up"],
              [String(rankedPlayer.match_wins), "Match wins"],
              [Math.round(rankedPlayer.win_percentage) + "%", "Win rate"],
              [Math.round(rankedPlayer.group_points_won_percentage) + "%", "Group pts won"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[14px] border border-[#dedfe3] bg-white p-4"
              >
                <p className="text-2xl font-bold text-[#0f2940]">{value}</p>
                <p className="mt-1 text-[10px] font-semibold text-[#6a6d77]">{label}</p>
              </div>
            ))}
          </div>

          {trajectory.length > 0 ? (
            <section className="rounded-[14px] border border-[#dedfe3] bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0f2940]">Ranking trajectory</h2>
                  <p className="mt-1 text-xs text-[#6a6d77]">Last {trajectory.length} ranking updates.</p>
                </div>
                <span className="rounded-full bg-[#f4f4f6] px-3 py-1 text-[9px] font-semibold text-[#0f2940]">
                  RANK HISTORY
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {trajectory.map((point, index) => (
                  <div key={point.tournamentName + point.eventDate} className="text-center">
                    <div
                      className={
                        "mx-auto flex h-24 w-12 items-end justify-center rounded-[10px] pb-2 text-xs font-bold text-white " +
                        (index === trajectory.length - 1 ? "bg-[#e6a429]" : "bg-[#183f5d]")
                      }
                    >
                      #{point.rank}
                    </div>
                    <p className="mt-2 truncate text-[9px] font-medium text-[#6a6d77]">
                      {point.tournamentName}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-[14px] border border-[#dedfe3] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-4">
              <h2 className="text-lg font-bold text-[#0f2940]">Tournament history</h2>
              <p className="mt-1 text-[10px] text-[#6a6d77]">
                Each finalised event contributes to the player&apos;s competitive record.
              </p>
            </div>

            {history.length === 0 ? (
              <p className="border-t border-[#dedfe3] px-5 py-10 text-sm text-[#6a6d77]">
                No tournament results recorded yet.
              </p>
            ) : (
              <>
                <div className="divide-y divide-[#dedfe3] md:hidden">
                  {history.map((row) => (
                    <div key={row.tournamentName + row.eventDate} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0f2940]">{row.tournamentName}</p>
                          <p className="mt-1 text-[10px] text-[#6a6d77]">{row.eventDate}</p>
                        </div>
                        <p className="text-sm font-bold text-[#0f2940]">+{row.points} pts</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[9px] text-[#6a6d77]">Finish</p>
                          <p className="mt-1 font-semibold text-[#15171c]">
                            {getPositionLabel(row.finishingPosition)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#6a6d77]">Match record</p>
                          <p className="mt-1 font-semibold text-[#15171c]">
                            {row.matchWins}–{Math.max(0, row.matchesPlayed - row.matchWins)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block">
                  <div className="grid grid-cols-[minmax(260px,1fr)_180px_150px_150px_120px] bg-[#f4f4f6] px-5 py-2.5 text-[9px] font-bold text-[#6a6d77]">
                    <span>EVENT</span>
                    <span>FINISH</span>
                    <span>PARTNER</span>
                    <span>MATCH RECORD</span>
                    <span>POINTS</span>
                  </div>
                  {history.map((row) => (
                    <div
                      key={row.tournamentName + row.eventDate}
                      className="grid grid-cols-[minmax(260px,1fr)_180px_150px_150px_120px] items-center border-t border-[#dedfe3] px-5 py-3 text-[11px]"
                    >
                      <span>
                        <span className="block font-semibold text-[#0f2940]">{row.tournamentName}</span>
                        <span className="mt-0.5 block text-[9px] text-[#6a6d77]">{row.eventDate}</span>
                      </span>
                      <span>{getPositionLabel(row.finishingPosition)}</span>
                      <span className="truncate text-[#6a6d77]">{row.partnerName || "—"}</span>
                      <span>
                        {row.matchWins}–{Math.max(0, row.matchesPlayed - row.matchWins)}
                      </span>
                      <span className="font-semibold text-[#0f2940]">+{row.points}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <div className="rounded-[12px] bg-[#f4f4f6] px-4 py-3 text-[10px] leading-5 text-[#6a6d77]">
            Nationality and identity come from the canonical player record. Performance
            statistics and ranking position are derived from finalised tournament data.
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

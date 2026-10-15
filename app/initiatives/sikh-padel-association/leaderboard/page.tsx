import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { PadelLeaderboardTable } from "@/components/padel/padel-leaderboard-table"
import { getPublicPadelLeaderboard } from "@/lib/padel-leaderboard"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Player Rankings | Sikh Padel Association | Devanhaar",
  description:
    "Official Sikh Padel Association player rankings, updated from finalised tournament results.",
}

export default async function PadelLeaderboardPage() {
  const rows = await getPublicPadelLeaderboard().catch(() => {
    console.error("[SPA] Public rankings are temporarily unavailable")
    return null
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafb] pt-20">
        <section className="bg-[#0f2940]">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-16">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-[#e6a429] px-3 py-1.5 text-[10px] font-semibold text-[#0f2940]">
                OFFICIAL SPA RANKINGS
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                The table that moves with every tournament.
              </h1>
              <p className="mt-4 text-base text-[#d2dce3] md:text-lg">
                Results are the source. The ranking engine does the rest.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/spa"
                  className="inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  ← Back to SPA
                </Link>
                <Link
                  href="/spa/tournaments"
                  className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2940]"
                >
                  Previous tournaments
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[14px] bg-[#183f5d] p-5 text-white">
              <p className="text-[9px] font-bold text-[#e6a429]">RANKING STATUS</p>
              <p className="mt-2 text-2xl font-bold">{rows === null ? "Temporarily unavailable" : `${rows.length} ranked players`}</p>
              <div className="my-4 h-px bg-[#35546a]" />
              <p className="text-[11px] font-semibold">6 tie-break levels</p>
              <p className="mt-1 text-[10px] text-[#b8c8d2]">
                Dense ranking · no manual rank overrides
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-12">
          {rows === null ? (
            <div role="status" className="rounded-[14px] border border-[#dedfe3] bg-white p-6">
              <h2 className="text-xl font-bold text-[#0f2940]">Rankings will be back shortly</h2>
              <p className="mt-2 text-sm leading-6 text-[#6a6d77]">
                We cannot load the player rankings right now. Please try again later.
              </p>
            </div>
          ) : <PadelLeaderboardTable rows={rows} />}

          <section
            id="ranking-method"
            className="mt-8 grid gap-4 rounded-[14px] border border-[#dedfe3] bg-white p-5 md:grid-cols-[1.2fr_1fr]"
          >
            <div>
              <p className="text-[9px] font-bold text-[#e6a429]">RANKING METHOD</p>
              <h2 className="mt-2 text-xl font-bold text-[#0f2940]">
                No manual ranking edits.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6a6d77]">
                Every position is derived from saved tournament data. If something is wrong,
                the underlying result or player record is corrected and the ranking is recalculated.
              </p>
            </div>
            <ol className="grid gap-2 text-sm text-[#15171c] sm:grid-cols-2">
              <li><strong>1.</strong> Ranking points</li>
              <li><strong>2.</strong> Titles</li>
              <li><strong>3.</strong> Runner-up finishes</li>
              <li><strong>4.</strong> Match wins</li>
              <li><strong>5.</strong> Win percentage</li>
              <li><strong>6.</strong> Group-points-won percentage</li>
            </ol>
          </section>

          <div className="mt-4 rounded-[14px] bg-[#fff4df] px-5 py-4 text-sm text-[#6a521e]">
            Spreadsheet parity remains the release gate: names, points and ranking positions
            must match the approved source before this table is promoted publicly.
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

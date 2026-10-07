import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, MapPin, Trophy } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { padelGalleryImages } from "@/components/padel/padel-shared-data"
import {
  getArchivedPadelTournament,
  getArchivedPadelResults,
  formatPadelArchiveDate,
  formatFinishingPosition,
} from "@/lib/padel-tournament-archive"

export const dynamic = "force-dynamic"

export default async function PadelTournamentArchiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tournament, results] = await Promise.all([
    getArchivedPadelTournament(id),
    getArchivedPadelResults(id),
  ])

  if (!tournament) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-[#0d2b1a] text-white">
          <div className="container mx-auto max-w-6xl px-6 py-14 lg:px-12 md:py-20">
            <Link href="/initiatives/sikh-padel-association/tournaments" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d6c7a4]">
              <ArrowLeft className="h-4 w-4" />
              Previous tournaments
            </Link>
            <p className="mt-9 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d6c7a4]">Tournament archive</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">{tournament.name}</h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatPadelArchiveDate(tournament.event_date)}</span>
              {tournament.venue ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{tournament.venue}</span> : null}
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-6 py-12 lg:px-12 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {padelGalleryImages.slice(0, 3).map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image} src={image} alt={`${tournament.name} event photo ${index + 1}`} className="h-64 w-full rounded-2xl object-cover" />
            ))}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Event record</p>
              <h2 className="mt-3 text-3xl font-bold">Tournament details</h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {tournament.public_description ? <p>{tournament.public_description}</p> : null}
                <p><strong className="text-foreground">Date:</strong> {formatPadelArchiveDate(tournament.event_date)}</p>
                {tournament.event_time ? <p><strong className="text-foreground">Time:</strong> {tournament.event_time}</p> : null}
                {tournament.venue ? <p><strong className="text-foreground">Venue:</strong> {tournament.venue}</p> : null}
                {tournament.address ? <p><strong className="text-foreground">Address:</strong> {tournament.address}</p> : null}
                {tournament.category ? <p><strong className="text-foreground">Category:</strong> {tournament.category}</p> : null}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Results</p>
                  <h2 className="mt-3 text-3xl font-bold">Recorded standings</h2>
                </div>
                <Link href="/initiatives/sikh-padel-association/leaderboard" className="text-sm font-semibold text-[hsl(43,100%,29%)] underline underline-offset-4">
                  Season leaderboard
                </Link>
              </div>

              {results.length > 0 ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                  {results.map((result, index) => (
                    <div key={result.id} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold">{index + 1}</div>
                      <div>
                        <div className="font-semibold">{result.playerName}{result.partnerName ? ` & ${result.partnerName}` : ""}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatFinishingPosition(result.finishing_position)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.points_awarded}</div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                  <Trophy className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">No player results have been recorded for this tournament yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

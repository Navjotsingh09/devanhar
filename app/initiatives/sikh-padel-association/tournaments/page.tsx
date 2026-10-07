import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { padelGalleryImages } from "@/components/padel/padel-shared-data"
import { getArchivedPadelTournaments, formatPadelArchiveDate } from "@/lib/padel-tournament-archive"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Previous Tournaments | Sikh Padel Association | Devanhaar",
  description: "Explore previous Sikh Padel Association tournaments, event highlights and recorded results.",
}

export default async function PadelTournamentArchivePage() {
  const tournaments = await getArchivedPadelTournaments()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-[#0d2b1a] text-white">
          <div className="container mx-auto max-w-6xl px-6 py-16 lg:px-12 md:py-24">
            <Link href="/initiatives/sikh-padel-association" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d6c7a4]">
              <ArrowLeft className="h-4 w-4" />
              Sikh Padel Association
            </Link>
            <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d6c7a4]">Tournament archive</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">Previous tournaments</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              A record of Sikh Padel Association tournaments, the people who played them and the results that shaped the season.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-6 py-16 lg:px-12 md:py-24">
          {tournaments.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {tournaments.map((tournament, index) => {
                const image = padelGalleryImages[index % padelGalleryImages.length]
                return (
                  <article key={tournament.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="relative h-64 overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-black">
                        {tournament.status === "finalized" ? "Completed" : "Previous event"}
                      </div>
                    </div>

                    <div className="p-6 md:p-7">
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatPadelArchiveDate(tournament.event_date)}</span>
                        {tournament.venue ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{tournament.venue}</span> : null}
                      </div>
                      <h2 className="mt-4 text-2xl font-bold tracking-tight">{tournament.name}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {tournament.public_description || "Tournament history, event information and recorded player results."}
                      </p>
                      <Link href={`/initiatives/sikh-padel-association/tournaments/${tournament.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(43,100%,29%)]">
                        View tournament
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">No previous tournaments yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Completed events will appear here automatically.</p>
            </div>
          )}
        </section>
      </main>
      <FooterSection />
    </>
  )
}

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { PadelHeroWithRegister } from "@/components/padel/padel-hero-with-register"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { ScrollingGallery } from "@/components/camps/scrolling-gallery"
import { ApplicationProcessTimeline } from "@/components/camps/application-process-timeline"
import {
  padelPillars,
  padelSteps,
  padelDescription,
  padelGalleryImages,
  padelFaqs,
} from "@/components/padel/padel-shared-data"
import { getPublicPadelEvent } from "@/lib/padel-public-event"
import { formatCountryFlag, getPublicPadelLeaderboard } from "@/lib/padel-leaderboard"

export const metadata = {
  title: "Sikh Padel Association | Devanhaar",
  description:
    "The Sikh Padel Association brings the Sikh community together through padel, tournaments and an ongoing player ranking system.",
}

export const dynamic = "force-dynamic"

export default async function SikhPadelAssociationPage() {
  const [event, leaderboard] = await Promise.all([
    getPublicPadelEvent(),
    getPublicPadelLeaderboard(),
  ])
  const topPlayers = leaderboard.slice(0, 3)

  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <PadelHeroWithRegister event={event} />

        <section className="bg-[#fafafb] py-10 md:py-14">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="rounded-[18px] border border-[#dedfe3] bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)] md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#e0a126]">
                    OFFICIAL SPA RANKINGS
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0f2940] md:text-3xl">
                    See where every player stands.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6a6d77]">
                    Rankings update from finalised tournament results using points, titles,
                    runner-up finishes, match wins, win percentage and group-points-won percentage.
                  </p>
                </div>
                <Link
                  href="/initiatives/sikh-padel-association/leaderboard"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0f2940] px-6 py-3 text-sm font-semibold text-white md:w-auto"
                >
                  View player rankings
                </Link>
              </div>

              {topPlayers.length > 0 ? (
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {topPlayers.map((player, index) => (
                    <Link
                      key={player.id}
                      href={"/initiatives/sikh-padel-association/leaderboard/" + player.id}
                      className={
                        "rounded-[14px] border p-4 transition-transform hover:-translate-y-0.5 " +
                        (index === 0
                          ? "border-[#0f2940] bg-[#0f2940] text-white"
                          : "border-[#dedfe3] bg-[#fafafb] text-[#0f2940]")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            "text-2xl font-bold " +
                            (index === 0 ? "text-[#e6a429]" : "text-[#0f2940]")
                          }
                        >
                          #{player.rank}
                        </span>
                        <span className="text-[10px] font-semibold">
                          {player.movement === "up"
                            ? "↑ Up"
                            : player.movement === "down"
                              ? "↓ Down"
                              : player.movement === "new"
                                ? "New"
                                : "Same"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold">
                        {formatCountryFlag(player.country_code)} {player.first_name} {player.last_name}
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {player.total_points.toLocaleString()} pts
                      </p>
                      <p
                        className={
                          "mt-1 text-[10px] " +
                          (index === 0 ? "text-[#b9c8d1]" : "text-[#6a6d77]")
                        }
                      >
                        {player.titles} titles · {Math.round(player.win_percentage)}% win
                      </p>
                    </Link>
                  ))}
                </div>
              ) : null}

              <p className="mt-5 text-[11px] font-medium text-[#6a6d77]">
                SPA rankings update after every finalised tournament.
              </p>
            </div>
          </div>
        </section>

        <div className="w-full bg-[#0d2b1a] py-10 md:py-14 flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/initiatives/sikh-padel-association-logo.png"
            alt="Sikh Padel Association crest"
            className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-xl"
          />
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-amber-300/80">
            Sikh Padel Association
          </p>
        </div>

        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            About the Sikh Padel Association
          </h2>
          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            {padelDescription.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Upcoming event
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {event.name}
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                Our next showcase tournament takes place on {event.date}
                {event.time ? `, ${event.time}` : ""}. Teams of two compete across multiple
                rounds, with games, points and rankings tracked throughout the day.
              </p>
              {event.detailsComplete ? (
                <>
                  <p className="font-bold text-foreground">
                    Entry is £{event.feePerPerson} per person (£{event.teamFee} per pair).
                  </p>
                  <p>
                    <strong className="text-foreground">{event.venue}</strong>, {event.address}.
                    Spaces are limited, so register your team using the form above.
                  </p>
                </>
              ) : (
                <p className="font-medium text-foreground">
                  Full venue, time and registration details will be published shortly.
                </p>
              )}
            </div>
            {event.detailsComplete && event.mapUrl ? (
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm font-semibold text-[hsl(43,100%,29%)] underline underline-offset-4"
              >
                Open venue address
              </a>
            ) : null}
          </div>
        </section>

        <CorePillarsGrid
          pillars={padelPillars}
          heading="What the Association is about"
          subheading="The Sikh Padel Association is built on community, sport and friendly competition."
        />

        <ScrollingGallery images={padelGalleryImages} heading="On the court" />

        <ApplicationProcessTimeline
          steps={padelSteps}
          heading="How registration works"
          subheading="From registering your team to climbing the leaderboard — here is what to expect."
        />

        <FAQSection items={padelFaqs} />
      </main>
      <FooterSection />
    </>
  )
}

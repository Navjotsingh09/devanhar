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
import Link from "next/link"

export const metadata = {
  title: "Sikh Padel Association | Devanhaar",
  description:
    "The Sikh Padel Association brings the Sikh community together through padel. Register your team for the upcoming 6 September tournament.",
}

export const dynamic = "force-dynamic"

export default async function SikhPadelAssociationPage() {
  const event = await getPublicPadelEvent()

  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <PadelHeroWithRegister event={event} />

        {/* Brand identity band */}
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
            {padelDescription.map((p, i) => (
              <p key={i}>{p}</p>
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
                {event.time ? `, ${event.time}` : ""}.
                Teams of two compete across multiple rounds, with games, points and rankings
                tracked on a live leaderboard throughout the day.
              </p>
              {event.detailsComplete ? (
                <>
                  <p className="font-bold text-foreground">Entry is £{event.feePerPerson} per person (£{event.teamFee} per pair).</p>
                  <p>
                    <strong className="text-foreground">{event.venue}</strong>, {event.address}. Spaces are limited, so register your team using the form above.
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

        <section className="border-t border-border py-12 md:py-16">
          <div className="container mx-auto px-6 lg:px-12 max-w-5xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-2">
                Player rankings
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                See where every player stands
              </h2>
            </div>
            <Link
              href="/initiatives/sikh-padel-association/leaderboard"
              className="inline-flex w-fit rounded-full bg-[hsl(43,100%,29%)] px-6 py-3 text-sm font-semibold text-white"
            >
              View player leaderboard
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-[#0d2b1a] py-16 text-white md:py-20">
          <div className="container mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d6c7a4]">
                Tournament archive
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Previous tournaments, results and event highlights
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
                Revisit past Sikh Padel Association tournaments, browse event photography and see recorded player results in one place.
              </p>
            </div>
            <Link
              href="/initiatives/sikh-padel-association/tournaments"
              className="inline-flex w-fit rounded-full bg-[#d6c7a4] px-6 py-3 text-sm font-semibold text-[#0d2b1a]"
            >
              Explore previous tournaments
            </Link>
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

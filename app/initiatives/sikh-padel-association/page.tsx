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
import { PADEL_EVENT, PREVIOUS_PADEL_EVENT } from "@/components/padel/padel-event"
import Link from "next/link"

export const metadata = {
  title: "Sikh Padel Association | Devanhaar",
  description:
    "The Sikh Padel Association brings the Sikh community together through padel. Register your team for the upcoming 6 September tournament.",
}

export default function SikhPadelAssociationPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <PadelHeroWithRegister />

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
              Tournament — {PADEL_EVENT.date}
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                Our next showcase tournament takes place on {PADEL_EVENT.date}, from {PADEL_EVENT.time}.
                Teams of two compete across multiple rounds, with games, points and rankings
                tracked on a live leaderboard throughout the day.
              </p>
              <p className="font-bold text-foreground">Entry is £{PADEL_EVENT.feePerPerson} per person (£{PADEL_EVENT.teamFee} per pair).</p>
              <p>
                <strong className="text-foreground">{PADEL_EVENT.venue}</strong>, {PADEL_EVENT.address}. Spaces are limited, so register your team using the form above.
              </p>
            </div>
            <a
              href={PADEL_EVENT.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex text-sm font-semibold text-[hsl(43,100%,29%)] underline underline-offset-4"
            >
              Open venue address
            </a>
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

        <section className="container mx-auto grid gap-8 px-6 lg:px-12 py-16 md:py-24 max-w-5xl md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Previous tournament
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {PREVIOUS_PADEL_EVENT.date} — {PREVIOUS_PADEL_EVENT.venue}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Revisit the previous Sikh Padel Association tournament through the event photos and live results archive.
            </p>
          </div>
          <a
            href={PREVIOUS_PADEL_EVENT.leaderboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit rounded-full bg-[hsl(43,100%,29%)] px-6 py-3 text-sm font-semibold text-white"
          >
            View previous leaderboard
          </a>
        </section>

        <section className="bg-[#0d2b1a] py-12 md:py-16">
          <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d6c7a4]/25 pb-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[#d6c7a4]">
                  SPA match centre
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                  Previous tournament stats
                </h3>
              </div>
              <span className="font-mono text-sm font-semibold tracking-[0.18em] text-[#d6c7a4]">
                TOURNAMENT {PREVIOUS_PADEL_EVENT.tournamentNumber}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#d6c7a4]/25 bg-[#d6c7a4]/25 md:grid-cols-4">
              <div className="bg-[#0d2b1a] p-5 md:p-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#d6c7a4]/70">DATE</p>
                <p className="mt-3 text-lg font-bold text-white">{PREVIOUS_PADEL_EVENT.fullDate}</p>
              </div>
              <div className="bg-[#0d2b1a] p-5 md:p-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#d6c7a4]/70">VENUE</p>
                <p className="mt-3 text-lg font-bold text-white">{PREVIOUS_PADEL_EVENT.venueDetail}</p>
              </div>
              <div className="bg-[#0d2b1a] p-5 md:p-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#d6c7a4]/70">STATUS</p>
                <p className="mt-3 text-lg font-bold text-[#d6c7a4]">COMPLETED</p>
              </div>
              <div className="bg-[#0d2b1a] p-5 md:p-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#d6c7a4]/70">PURPOSE</p>
                <p className="mt-3 text-lg font-bold text-white">{PREVIOUS_PADEL_EVENT.purpose}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d6c7a4]/25 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#d6c7a4]">
                Standings &amp; match schedule
              </p>
              <a
                href={PREVIOUS_PADEL_EVENT.leaderboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-white underline underline-offset-4"
              >
                Open full results archive
              </a>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 lg:px-12 pb-16 md:pb-24 max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3">
            {padelGalleryImages.slice(0, 3).map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image}
                src={image}
                alt={`Previous tournament photo ${index + 1}`}
                className="h-64 w-full rounded-xl object-cover"
              />
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-xl bg-[#0d2b1a]">
            <video
              className="mx-auto max-h-[680px] w-full object-contain"
              controls
              playsInline
              preload="metadata"
              poster="/initiatives/sikh-padel-previous-tournament-poster.jpg"
            >
              <source src="/initiatives/sikh-padel-previous-tournament.mp4" type="video/mp4" />
              Your browser does not support the tournament video.
            </video>
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

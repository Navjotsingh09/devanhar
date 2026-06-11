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

export const metadata = {
  title: "Sikh Padel Association | Devanhaar",
  description:
    "The Sikh Padel Association brings the Sikh community together through padel. Register your team for the upcoming 4th July tournament.",
}

export default function SikhPadelAssociationPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <PadelHeroWithRegister />

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
              Tournament — 4th July
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                Our next showcase tournament takes place on 4th July. Teams of two
                compete across multiple rounds, with games, points and rankings
                tracked on a live leaderboard throughout the day.
              </p>
              <p>
                Spaces are limited. Register your team using the form above to
                secure your place — full event details, including venue and
                timings, will be shared with confirmed teams by email.
              </p>
            </div>
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

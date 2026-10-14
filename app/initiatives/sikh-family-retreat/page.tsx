import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FamilyRetreatFAQ } from "@/components/family-retreat/family-retreat-faq"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { FamilyRetreatHero } from "@/components/family-retreat/family-retreat-hero"
import { FamilyRetreatInterestForm } from "@/components/family-retreat/family-retreat-interest-form"
import {
  retreatDetailCards,
  retreatExperienceCards,
  retreatDescription,
} from "@/components/family-retreat/family-retreat-shared-data"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sikh Family Retreat | Sikh Family Initiative | Devanhaar",
  description: "Register interest for the Spring and Summer 2027 Sikh Family Retreats.",
}

export default function SikhFamilyRetreatPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <FamilyRetreatHero />

        <section className="border-t border-border py-14">
          <div className="container mx-auto grid max-w-4xl gap-4 px-6 sm:grid-cols-2 lg:px-12">
            <div className="rounded-2xl border border-border bg-secondary/30 p-6">
              <div className="flex items-center gap-2 text-[hsl(43,100%,29%)]"><CalendarDays className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Spring retreat</span></div>
              <p className="mt-3 text-2xl font-bold">1–4 April 2027</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-6">
              <div className="flex items-center gap-2 text-[hsl(43,100%,29%)]"><CalendarDays className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Summer retreat</span></div>
              <p className="mt-3 text-2xl font-bold">22–25 July 2027</p>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-6 lg:px-12">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">About the retreat</p>
            <h2 className="mb-8 text-3xl font-bold md:text-4xl">A retreat for the whole family</h2>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {retreatDescription.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </section>

        <CorePillarsGrid
          pillars={retreatDetailCards}
          heading="What to expect"
          subheading="Family sessions, children's activities, reflective discussions, time in sangat and practical opportunities to learn together."
        />

        <CorePillarsGrid
          pillars={retreatExperienceCards}
          heading="Built around sangat, learning and family connection"
          subheading="Designed to leave every family inspired, connected and enriched."
        />

        <section id="interest-form" className="border-t border-border bg-secondary/20 py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-6 lg:px-12">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Register interest</p>
            <h2 className="text-3xl font-bold md:text-4xl">Interested in joining us in 2027?</h2>
            <p className="mb-9 mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Leave the lead contact details for your family group and we will keep you updated as booking information for the Spring and Summer retreats is released.
            </p>
            <FamilyRetreatInterestForm />
          </div>
        </section>

        <FamilyRetreatFAQ />

        <section className="border-t border-border py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-6 lg:px-12">
            <h2 className="text-3xl font-bold">Have a question?</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Contact the Sikh Family Initiative team if you would like to discuss the retreats before registering interest.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>Email: <a href="mailto:TheSikhFI@devanhaar.com" className="font-medium text-foreground hover:underline">TheSikhFI@devanhaar.com</a></p>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(43,100%,29%)] py-16 text-center text-white">
          <div className="container mx-auto max-w-3xl px-6 lg:px-12">
            <h2 className="text-3xl font-bold">Explore the full Sikh Family Initiative</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">Retreats, the Sikh Family Extravaganza and Wedding Fair all sit under one family programme.</p>
            <Button asChild variant="secondary" className="mt-7 rounded-full px-7">
              <Link href="/initiatives/sikh-family-initiative">View all family projects</Link>
            </Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

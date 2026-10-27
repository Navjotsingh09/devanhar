
import {NativePageSections} from '@/components/cms/native-page-sections'
import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import Link from "next/link"
import "./roots-page.css"
import { Bus, ExternalLink, Instagram, Shield } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { ApplicationProcessTimeline } from "@/components/camps/application-process-timeline"
import { RootsHero } from "@/components/roots/roots-hero"
import { PublicCampForm } from "@/components/roots/public-camp-form"
import {
  rootsAboutLong,
  rootsAboutShort,
  rootsExperienceCards,
  rootsWhoIsItFor,
  rootsForParents,
  rootsBookingSteps,
  rootsFAQs,
} from "@/components/roots/roots-shared-data"
import { Button } from "@/components/ui/button"

const originalMetadata = {
  title: "Roots Residential | Devanhaar",
  description:
    "A three-day residential adventure for young Sikhs aged 12–16. Residential dates will be announced soon. Outdoor activities, leadership, personal development and Sikh values.",
  keywords: ["Roots Residential", "Sikh youth camp", "Sikh residential", "Devanhaar", "young Sikhs UK"],
  openGraph: {
    title: "Roots Residential | Devanhaar",
    description: "A three-day residential adventure for young Sikhs aged 12–16. Residential dates will be announced soon.",
    url: "https://devanhaar.com/initiatives/roots-residential",
  },
  alternates: { canonical: "https://devanhaar.com/initiatives/roots-residential" },
}

export const dynamic = 'force-dynamic'

export default async function RootsResidentialPage({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}) {
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-roots-residential')

  return withPageCopy(((
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="roots-page min-h-screen">
        <RootsHero />

        <nav className="roots-jumpnav" aria-label="Explore Roots">
          <div><a href="#about-roots">Discover Roots</a><a href="#residentials">Residentials</a><a href="#roots-experience">The experience</a><a href="#roots-venue">Venue</a><a href="#boots-camp-applications" className="roots-jump-cta">Boys&apos; Boots Camp <span aria-hidden="true">↗</span></a></div>
        </nav>

        <section data-cms-section="4f6b6e4b9db7e85c" id="boots-camp-applications" className="border-t border-border py-10 md:py-14 scroll-mt-28">
          <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-xl">
              <div className="grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                    Separate programme · Boys only
                  </p>
                  <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                    Boys&apos; Boots Camp applications are now open
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                    Boots Camp is a focused, activity-based programme for boys, with practical challenges and teamwork to build confidence and resilience. It is a separate programme from the main Roots Residential.
                  </p>
                  <p className="mt-5 text-xs leading-relaxed text-slate-400 md:text-sm">
                    Please note that this Boots Camp is open to boys only.
                  </p>
                </div>
                <Button asChild className="w-full rounded-full bg-amber-400 px-7 text-slate-950 hover:bg-amber-300 md:w-auto">
                  <a href="#booking-form">Apply for Boys&apos; Boots Camp</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Roots I — A Residential Adventure Experience */}
        <section data-cms-section="598249549294494b" id="about-roots" className="roots-story border-t border-border py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <figure className="roots-story-photo"><img src="/initiatives/roots-gallery-07.jpg" alt="Young people taking part in an outdoor Roots adventure" loading="lazy" /><figcaption>Adventure. Friendship. Identity.</figcaption></figure>
            <div className="roots-story-copy">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              About Roots
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              A Residential Adventure Experience
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {rootsAboutLong.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div></div>
          </div>
        </section>

        {/* Safe space — separate residentials */}
        <section data-cms-section="bbfdf0e93a142ffe" id="residentials" className="roots-residentials border-t border-border bg-secondary/30 py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              A safe space for everyone
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Separate residentials for girls and boys
            </h2>
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="rounded-2xl border border-border bg-background p-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/initiatives/roots-kaurs-logo.jpg" alt="Bibia Kaurs Roots — girls' residential" className="h-28 w-auto object-contain mb-5" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Girls&apos; Residential</h3>
                <p className="text-sm font-semibold text-[hsl(43,100%,29%)] mb-3">Dates coming soon</p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  A dedicated residential for girls, led by female mentors, where every participant feels safe, supported and free to be themselves.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/initiatives/roots-singhs-logo.jpg" alt="Singhs Roots — boys' residential" className="h-28 w-auto object-contain mb-5" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Boys&apos; Residential</h3>
                <p className="text-sm font-semibold text-[hsl(43,100%,29%)] mb-3">Dates coming soon</p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  A dedicated residential for boys, led by male mentors, offering the same safe, supportive and welcoming environment.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[hsl(43,100%,29%)]/30 bg-[hsl(43,100%,29%)]/5 p-6 md:p-7 flex items-start gap-4">
              <Shield className="w-6 h-6 text-[hsl(43,100%,29%)] shrink-0 mt-0.5" />
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                Girls and boys attend separate residentials, giving every young person a safe, comfortable space to take part, build friendships and grow with confidence. Safeguarding and welfare are at the heart of everything we do.
              </p>
            </div>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Dates for the main girls&apos; and boys&apos; residentials will be announced soon.
            </p>
          </div>
        </section>

        {/* About Roots II */}
        <section data-cms-section="76f0d7fd0ac9dfe1" id="roots-identity" className="roots-identity border-t border-border bg-secondary/30 py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              About Roots
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Adventure. Friendship. Identity.
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {rootsAboutShort.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <img className="roots-identity-photo" src="/initiatives/roots-gallery-12.jpg" alt="Shared outdoor experiences at Roots" loading="lazy" />
          </div>
        </section>

        {/* The Experience — 6 cards */}
        <div id="roots-experience" className="roots-experience scroll-mt-28"><CorePillarsGrid
          pillars={rootsExperienceCards}
          heading="Three Days Full of Adventure"
          subheading="Every day at Roots offers something different. From climbing and bushcraft to campfires and team competitions, no two days are the same, and every day leaves a lasting impression."
        />

        </div>
        {/* Photo gallery — portrait cards to avoid cropping tall photos */}
        <section data-cms-section="ef8bb470a9c01b55" className="roots-gallery py-20 md:py-28 border-t border-border overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 max-w-6xl mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Moments from Roots</h2>
          </div>
          <div className="relative w-full">
            <div className="roots-gallery-track" tabIndex={0} role="region" aria-label="Roots photo gallery — scroll to explore">
              {[
                "/initiatives/roots-gallery-07.jpg",
                "/initiatives/roots-gallery-08.jpg",
                "/initiatives/roots-gallery-09.jpg",
                "/initiatives/roots-gallery-10.jpg",
                "/initiatives/roots-gallery-11.jpg",
                "/initiatives/roots-gallery-12.jpg",
                "/initiatives/roots-gallery-13.jpg",
                "/initiatives/roots-gallery-14.jpg",
                "/initiatives/roots-gallery-15.jpg",
              ].map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative h-[26rem] md:h-[32rem] w-[20rem] md:w-[24rem] flex-shrink-0 rounded-2xl overflow-hidden bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Roots residential activity — photo ${i+1}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

        </section>

        <div className="roots-audience">
        {/* Who Roots Is For */}
        <section data-cms-section="935034087c21cfef" className="border-t border-border py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Who Roots is for
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Everyone Belongs
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {rootsWhoIsItFor.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* For Parents */}
        <section data-cms-section="51ad48931f87cf08" className="border-t border-border bg-secondary/30 py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              For Parents
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              An Experience That Lasts Beyond Summer
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {rootsForParents.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        </div>
        {/* Hilston Park */}
        <section data-cms-section="9d198fa881713c5a" id="roots-venue" className="roots-venue border-t border-border py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              The Venue
            </p>
            <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Hilston Park, Wales
                </h2>
                <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                  <p>
                    Roots takes place at Hilston Park, a residential activity centre in Wales set in beautiful grounds. The site provides the perfect backdrop for three days of adventure, reflection and community, with facilities, outdoor spaces and accommodation all in one place.
                  </p>
                  <p>
                    From the grounds to the accommodation, every part of the site is designed to support an immersive residential experience.
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-full px-7 gap-2">
                  <Link href="https://hilstonpark.com/" target="_blank" rel="noopener noreferrer">
                    Visit Hilston Park website <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <figure className="overflow-hidden rounded-2xl border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/initiatives/roots-hilston-park.jpg" alt="Hilston Park venue in Wales" className="h-full min-h-72 w-full object-cover" />
              </figure>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section data-cms-section="6a3401e5d991e5ae" className="roots-pricing border-t border-border bg-secondary/30 py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Getting there
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Travel information
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Arrival and transport details will be shared with confirmed participants.
            </p>
            <div className="mb-8 rounded-2xl border border-[hsl(43,100%,29%)]/30 bg-background p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[hsl(43,100%,29%)]/10 p-3 text-[hsl(43,100%,29%)]">
                  <Bus className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">Travel information</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Transport arrangements are still to be confirmed. We will let families know whether supported coach travel will run from London or Birmingham, or whether participants should make their own way to Hilston Park.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coach routes</p>
                      <p className="mt-1 text-sm font-medium text-foreground">London / Birmingham: to be confirmed</p>
                    </div>
                    <div className="rounded-lg border border-border px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arrival</p>
                      <p className="mt-1 text-sm font-medium text-foreground">Own way: to be confirmed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-[hsl(43,100%,29%)]">Main residential dates: coming soon</p>
          </div>
        </section>

        {/* Testimonials */}
        <section data-cms-section="f4b2d70f76762a85" className="border-t border-border py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              What others think
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              See what young people, parents and mentors have said about their Roots experience. Testimonials are shared regularly on our Instagram page.
            </p>
            <Button asChild variant="outline" className="rounded-full px-7 gap-2">
              <Link
                href="https://www.instagram.com/rootsprojectuk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4" />
                View testimonials on Instagram
              </Link>
            </Button>
          </div>
        </section>

        {/* Booking Process */}
        <div className="roots-process"><ApplicationProcessTimeline
          steps={rootsBookingSteps}
          heading="How the Boots Camp application works"
          subheading="From submitting an application to receiving confirmation, here is what to expect."
        />

        </div>
        <section data-cms-section="0af46199de274a35" id="booking-form" className="roots-registration scroll-mt-28">
          <div className="roots-registration-layout">
            <aside className="roots-registration-intro">
              <p className="roots-eyebrow">Boys&apos; Boots Camp</p>
              <h2>Apply for a focused<br /><span>Roots experience.</span></h2>
              <p>Complete one application for the participant. The Roots team will review it and contact you with the next steps for the Boys&apos; Boots Camp.</p>
              <div className="roots-registration-facts"><p><strong>Boys only</strong></p><p><strong>Focused activities</strong></p><p><strong>Teamwork &amp; confidence</strong></p><p><strong>Separate from the residential</strong></p></div>
              <img src="/initiatives/roots-gallery-10.jpg" alt="Outdoor adventure with the Roots team" loading="lazy" />
              <p className="roots-registration-note">Questions about the Boots Camp?<br /><a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a></p>
            </aside>
            <div className="roots-registration-card"><PublicCampForm /></div>
          </div>
        </section>

        {/* FAQ */}
        <FAQSection
          items={rootsFAQs}
          heading="Frequently asked questions"
          subheading="Common questions about Roots and the separate Boys' Boots Camp."
        />

        {/* Contact */}
        <section data-cms-section="12584b8109507822" className="border-t border-border py-10 md:py-14">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Get in touch
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Have a question before booking?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              If you would like to speak to someone before completing the form, please get in touch. We're happy to help with questions about the residential, accommodation, costs or the booking process.
            </p>
            <div className="space-y-2 mb-8 text-base text-muted-foreground">
              <p>
                Email:{" "}
                <a
                  href="mailto:Roots@Devanhaar.com"
                  className="text-foreground font-medium hover:underline"
                >
                  Roots@Devanhaar.com
                </a>
              </p>
              <p>
                Phone / WhatsApp:{" "}
                <a
                  href="https://wa.me/447735048882"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:underline"
                >
                  +44 7735 048882
                </a>
              </p>
            </div>
            <Button
              asChild
              className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
            >
              <Link href="/contact">Contact an organiser</Link>
            </Button>
          </div>
        </section>

        {/* Final CTA */}
        <section data-cms-section="77dd74a29549783b" className="roots-final-cta border-t border-border bg-[hsl(43,100%,29%)] py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Main residential dates are coming soon
            </h2>
            <p className="text-base md:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto">
              The main Roots Residential is separate from the Boys&apos; Boots Camp. Explore the Boots Camp application while residential dates are being confirmed.
            </p>
            <Button asChild variant="secondary" className="rounded-full px-8 py-6 text-base">
              <a href="#boots-camp-applications">Explore Boys&apos; Boots Camp</a>
            </Button>
          </div>
        </section>
      </main>
      <><NativePageSections /><FooterSection hideContact /></>
    </>
  )), cmsCopy)
}


export async function generateMetadata(){return getMigratedPageMetadata('content-roots-residential',originalMetadata)}

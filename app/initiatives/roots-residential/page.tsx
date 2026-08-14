import Link from "next/link"
import { ExternalLink, Instagram, Shield } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { ApplicationProcessTimeline } from "@/components/camps/application-process-timeline"
import { RootsHero } from "@/components/roots/roots-hero"
import { RootsBookingForm } from "@/components/roots/roots-booking-form"
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

export const metadata = {
  title: "Roots Residential | Devanhaar",
  description:
    "A four-day residential adventure for young Sikhs aged 13-16. Outdoor activities, leadership, personal development and Sikh values, all in one unforgettable experience.",
  keywords: ["Roots Residential", "Sikh youth camp", "Sikh residential", "Devanhaar", "young Sikhs UK"],
  openGraph: {
    title: "Roots Residential | Devanhaar",
    description: "A four-day residential adventure for young Sikhs aged 13-16.",
    url: "https://devanhaar.com/initiatives/roots-residential",
  },
  alternates: { canonical: "https://devanhaar.com/initiatives/roots-residential" },
}

export default function RootsResidentialPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <RootsHero />

        {/* Bookings intro card */}
        <section className="border-t border-border">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl py-16 md:py-20">
            <div className="rounded-2xl border border-border bg-secondary/30 p-8 md:p-10">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
                Bookings
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Applications are now open
              </h2>
              <div className="mb-4 rounded-xl border border-[hsl(43,100%,29%)]/30 bg-[hsl(43,100%,29%)]/10 px-5 py-4 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(43,100%,29%)]">Current price</p>
                <p className="mt-1 text-2xl font-bold text-foreground sm:mt-0">£75 per participant</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mb-8">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
                  <p className="mt-1 text-lg font-bold text-foreground">Hilston Park, Wales</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dates</p>
                  <p className="mt-1 text-lg font-bold text-foreground">23rd–30th August</p>
                </div>
              </div>
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                <p>
                  Please complete one application per participant. The form will ask for the participant's details, parent or guardian contact information, medical and dietary needs, emergency contact details, and anything else that will help us support the young person during the residential.
                </p>
                <p>
                  Once submitted, your booking request will be reviewed by the Roots team. An organiser will then contact you directly to confirm availability, discuss the cost, and explain how to make payment. The current cost is £75 per participant.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
                >
                  <a href="#booking-form">Complete the application</a>
                </Button>
                <a
                  href="https://www.instagram.com/rootsuk13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:underline"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram @rootsuk13
                </a>
              </div>
              <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-xl">
                Submitting the form does not automatically confirm your place. Your booking is only confirmed once the Roots team has reviewed your details and contacted you directly.
              </p>
            </div>
          </div>
        </section>

        {/* About Roots I — A Residential Adventure Experience */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
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
            </div>
          </div>
        </section>

        {/* Safe space — separate residentials */}
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
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
                <p className="text-sm font-semibold text-[hsl(43,100%,29%)] mb-3">Girls: 27th–30th August</p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  A dedicated residential for girls, led by female mentors, where every participant feels safe, supported and free to be themselves.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/initiatives/roots-singhs-logo.jpg" alt="Singhs Roots — boys' residential" className="h-28 w-auto object-contain mb-5" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Boys&apos; Residential</h3>
                <p className="text-sm font-semibold text-[hsl(43,100%,29%)] mb-3">Boys: 23rd–26th August</p>
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
              The boys&apos; residential runs from 23rd–26th August, followed by the girls&apos; residential from 27th–30th August.
            </p>
          </div>
        </section>

        {/* About Roots II */}
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
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
          </div>
        </section>

        {/* The Experience — 6 cards */}
        <CorePillarsGrid
          pillars={rootsExperienceCards}
          heading="Four Days Full of Adventure"
          subheading="Every day at Roots offers something different. From climbing and bushcraft to campfires and team competitions, no two days are the same, and every day leaves a lasting impression."
        />

        {/* Photo gallery — portrait cards to avoid cropping tall photos */}
        <section className="py-20 md:py-28 border-t border-border overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 max-w-6xl mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Moments from Roots</h2>
          </div>
          <div className="relative w-full">
            <div className="flex gap-5 animate-[roots-scroll-x_260s_linear_infinite] w-max">
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
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes roots-scroll-x {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
        </section>

        {/* Who Roots Is For */}
        <section className="border-t border-border py-16 md:py-24">
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
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
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

        {/* Hilston Park */}
        <section className="border-t border-border py-16 md:py-24">
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
                    Roots takes place at Hilston Park, a residential activity centre in Wales set in beautiful grounds. The site provides the perfect backdrop for four days of adventure, reflection and community, with facilities, outdoor spaces and accommodation all in one place.
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
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-5xl md:text-6xl text-[hsl(43,100%,29%)]">&pound;75.00</span>
              <span className="text-lg md:text-xl font-normal text-muted-foreground ml-3">per participant</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              The current cost is £75 per participant. This is subject to change, and the final amount will be confirmed when we contact you following your application.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transport arrangements, including whether supported coach travel will run from London or Birmingham, are still to be confirmed. Families will receive clear arrival and travel information before the residential.
            </p>
            <Button
              asChild
              className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
            >
              <a href="#booking-form">Book your place</a>
            </Button>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border py-16 md:py-24">
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
        <ApplicationProcessTimeline
          steps={rootsBookingSteps}
          heading="How booking works"
          subheading="From completing the form to confirming your place, here is what to expect."
        />

        {/* Booking Form */}
        <section id="booking-form" className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Book your place
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
              Please complete one application per participant. After submitting, we'll be in touch to discuss availability, costs and how to make payment.
            </p>
            <RootsBookingForm />
          </div>
        </section>

        {/* FAQ */}
        <FAQSection
          items={rootsFAQs}
          heading="Frequently asked questions"
          subheading="Common questions about Roots Residential."
        />

        {/* Contact */}
        <section className="border-t border-border py-16 md:py-24">
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
        <section className="border-t border-border bg-[hsl(43,100%,29%)] py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Join us for Roots Residential
            </h2>
            <p className="text-base md:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto">
              Adventure. Friendship. Identity. Complete the form today and we'll be in touch with you directly.
            </p>
            <Button asChild variant="secondary" className="rounded-full px-8 py-6 text-base">
              <a href="#booking-form">Book your place</a>
            </Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

import Link from "next/link"
import { ExternalLink, Instagram } from "lucide-react"
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
    "A four-day residential adventure for young Sikhs aged 13-16. Outdoor activities, leadership, personal development and Sikh values — all in one unforgettable experience.",
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
                Camper bookings are now open
              </h2>
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                <p>
                  Please complete one booking form per camper. The form will ask for camper details, parent or guardian contact information, accommodation preferences, medical and dietary needs, emergency contact details, and anything else that will help us support the young person during the residential.
                </p>
                <p>
                  Once submitted, your booking request will be reviewed by the Roots team. An organiser will then contact you directly to confirm availability, discuss the cost, and explain how to make payment.
                </p>
              </div>
              <Button
                asChild
                className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
              >
                <a href="#booking-form">Complete the booking form</a>
              </Button>
              <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-xl">
                Submitting the form does not automatically confirm your place. Your booking is only confirmed once the Roots team has reviewed your details and contacted you directly.
              </p>
            </div>
          </div>
        </section>

        {/* About Roots I — More Than Just a Summer Camp */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              About Roots
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              More Than Just a Summer Camp
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {rootsAboutLong.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* About Roots II — Adventure. Friendship. Identity. */}
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              About Roots
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Adventure. Friendship. Identity.
            </h2>
            <p className="text-base md:text-xl font-medium text-foreground/70 mb-8">
              A four-day residential for young people aged 13&ndash;16.
            </p>
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
          heading="Five Days Full of Adventure"
          subheading="Every day at Roots offers something different. From climbing and bushcraft to campfires, team competitions, inspiring conversations, no two days are the same — but every day leaves a lasting impression."
        />

        {/* Who Roots Is For */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Who Roots is for
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Everyone Belongs
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 font-medium">
              Wherever they are on their journey.
            </p>
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

        {/* Histon Park */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              The Venue
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Hilston Park
            </h2>
            <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              <p>
                Roots takes place at Hilston Park, a stunning residential activity centre set in beautiful grounds. The site provides the perfect backdrop for four days of adventure, reflection and community — with facilities, outdoor spaces and accommodation all in one place.
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
        </section>

        {/* Pricing */}
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-5xl md:text-6xl text-[hsl(43,100%,29%)]">&pound;125.00</span>
              <span className="text-lg md:text-xl font-normal text-muted-foreground ml-3">per camper</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Price is subject to change. The exact cost will be confirmed by an organiser when they contact you following your booking submission.
            </p>
            <Button
              asChild
              className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
            >
              <a href="#booking-form">Book your camper&apos;s place</a>
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
          subheading="From completing the form to confirming your camper's place, here is what to expect."
        />

        {/* Booking Form */}
        <section id="booking-form" className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Book your camper&apos;s place
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
              Please complete one form per camper. After submitting, an organiser from the Roots team will contact you to discuss availability, costs and how to make payment.
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
              If you would like to speak to someone before completing the booking form, please contact the Roots team. An organiser can help with questions about the residential, accommodation, costs or the booking process.
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
              Adventure. Friendship. Identity. Complete the booking form today and the Roots team will follow up with you directly.
            </p>
            <Button asChild variant="secondary" className="rounded-full px-8 py-6 text-base">
              <a href="#booking-form">Book your camper&apos;s place</a>
            </Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

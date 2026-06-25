import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { ApplicationProcessTimeline } from "@/components/camps/application-process-timeline"
import { FamilyRetreatHero } from "@/components/family-retreat/family-retreat-hero"
import { FamilyRetreatBookingForm } from "@/components/family-retreat/family-retreat-booking-form"
import {
  retreatDetailCards,
  retreatExperienceCards,
  bookingSteps,
  retreatFAQs,
  retreatDescription,
} from "@/components/family-retreat/family-retreat-shared-data"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sikh Family Retreat | Devanhaar",
  description:
    "A family-focused Sikh retreat bringing parents, children and young people together through Gurbani, Sikh history, seva and time in sangat.",
}

export default function SikhFamilyRetreatPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <FamilyRetreatHero />

        {/* Intro Booking Card */}
        <section className="border-t border-border">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl py-16 md:py-20">
            <div className="rounded-2xl border border-border bg-secondary/30 p-8 md:p-10">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
                Bookings
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Family bookings are now open
              </h2>
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                <p>
                  Please complete one booking form per family or household group. The form will ask for adult details, children attending, accommodation preferences, medical and dietary needs, emergency contact details and anything that will help us support your family during the retreat.
                </p>
                <p>
                  Once submitted, your booking request will be reviewed by the retreat team. A sevadaar will then contact you directly to confirm availability, discuss the cost for your family and explain how to make payment.
                </p>
              </div>
              <Button
                asChild
                className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
              >
                <a href="#booking-form">Complete the booking form</a>
              </Button>
              <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-xl">
                Submitting the form does not automatically confirm your place. Your booking is only confirmed once the retreat team has reviewed your details and contacted you directly.
              </p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              About the retreat
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              A retreat for the whole family
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {retreatDescription.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* What to expect */}
        <CorePillarsGrid
          pillars={retreatDetailCards}
          heading="What to expect"
          subheading="The retreat will include a mixture of family sessions, children's activities, reflective discussions, time in sangat and opportunities to learn more about Sikhi in a practical and engaging way."
        />

        {/* Why this matters */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Why this matters
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Creating memories that strengthen families
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                Modern family life is busy. The Sikh Family Retreat gives families dedicated time to step away from normal pressures and spend time together in an environment shaped by Sikh values.
              </p>
              <p>
                For children and young people, the retreat can help make Sikhi feel alive, relevant and positive. For adults, it offers time to reflect, learn and connect with other parents and families.
              </p>
              <p>
                The aim is for every family to leave with stronger bonds, new friendships, deeper inspiration and memories they can carry forward.
              </p>
            </div>
          </div>
        </section>

        {/* What families will experience */}
        <CorePillarsGrid
          pillars={retreatExperienceCards}
          heading="Built around sangat, learning and family connection"
          subheading="Six ways the Sikh Family Retreat is designed to leave every family inspired, connected and enriched."
        />

        {/* Booking process */}
        <ApplicationProcessTimeline
          steps={bookingSteps}
          heading="How booking works"
          subheading="From completing the form to confirming your place, here is what to expect."
        />

        {/* Accommodation */}
        <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
              Accommodation
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Accommodation will be allocated carefully
            </h2>
            <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                The retreat site has a range of accommodation options. Families will be asked to share their preferences on the booking form, including whether they would like to request ensuite accommodation or deluxe POD accommodation if available.
              </p>
              <p>
                Accommodation is limited and will be allocated by the organising team. We will do our best to support family needs, but specific accommodation cannot be guaranteed unless confirmed by the retreat team.
              </p>
              <p>
                If your family has mobility needs, medical needs, young children or other important accommodation considerations, please include this clearly on the booking form.
              </p>
            </div>
          </div>
        </section>

        {/* Booking form */}
        <section id="booking-form" className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to book your family place?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
              Please complete the form below. It should only be completed once per family or household group. After submitting, a sevadaar will contact you to discuss availability, costs and how to make payment.
            </p>
            <FamilyRetreatBookingForm />
          </div>
        </section>

        {/* FAQ */}
        <FAQSection
          items={retreatFAQs}
          heading="Frequently asked questions"
          subheading="Common questions about the Sikh Family Retreat."
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
              If you would like to speak to someone before completing the booking form, please contact the Sikh Family Retreat team. A sevadaar can help with questions about the retreat, accommodation, family needs, costs or the booking process.
            </p>
            <div className="space-y-2 mb-8 text-base text-muted-foreground">
              <p>Email: <a href="mailto:TheSikhFI@devanhaar.com" className="text-foreground font-medium hover:underline">TheSikhFI@devanhaar.com</a></p>
              <p>Phone / WhatsApp: <a href="https://wa.me/447780334940" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:underline">07780 334 940</a></p>
            </div>
            <Button
              asChild
              className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
            >
              <Link href="/contact">Contact a sevadaar</Link>
            </Button>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-[hsl(43,100%,29%)] py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
              Join us for the Sikh Family Retreat
            </h2>
            <p className="text-base md:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto">
              A space for families to learn, reflect, connect and create memories together in sangat. Complete the booking form today and a sevadaar will follow up with you directly.
            </p>
            <Button asChild variant="secondary" className="rounded-full px-8 py-6 text-base">
              <a href="#booking-form">Book your family place</a>
            </Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

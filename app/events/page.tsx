import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { ArrowRight, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const eventsConfig = [
  {
    slug: "horse-riding",
    image: "/images/events/horse-riding.jpg",
    title: "Horse Riding",
    badge: "Life Skills",
    dateLabel: "March onwards",
    shortDescription:
      "Build confidence and discipline through guided horse riding sessions with a seva-centred atmosphere.",
    priceLabel: "",
  },
  {
    slug: "shooting",
    image: "/images/events/shooting.jpg",
    title: "Shooting",
    badge: "Skills",
    dateLabel: "Weekly sessions",
    shortDescription:
      "Regular target shooting sessions designed to build focus, discipline, and consistency.",
    priceLabel: "",
  },
  {
    slug: "wolfrun",
    image: "/images/events/wolfrun-hero.jpg",
    title: "Wolf Run",
    badge: "Challenge",
    dateLabel: "12 September 2026",
    shortDescription:
      "A high-energy obstacle challenge through mud, water, and woodland testing teamwork and resilience.",
    priceLabel: "GBP 45 per person",
  },
  {
    slug: "yorkshire-3-peaks",
    image: "/images/events/yorkshire-3-peaks.jpg",
    title: "Yorkshire 3 Peaks",
    badge: "Challenge",
    dateLabel: "27 June 2026",
    shortDescription:
      "A full-day charity hike across Pen-y-ghent, Whernside, and Ingleborough with coach fee included.",
    priceLabel: "GBP 20 per person (coach fee included)",
  },
]

export const metadata: Metadata = {
  title: "Events | Devanhaar Sikh Charity",
  description:
    "Explore Devanhaar events including Horse Riding, Shooting, Wolf Run, and Yorkshire 3 Peaks with tailored registration forms.",
}

export default function EventsPage() {
  return (
    <div>
      <Navbar />
      <ScrollAnimations />
      <main className="pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute -top-24 -right-10 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-8 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl" />
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/60 mb-4">
                  Events
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                  Event Pathways With Dedicated Registration
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                  Each event now has its own page and event-specific interest
                  form. Choose an event below to review details and submit your
                  registration inputs.
                </p>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-sm font-semibold">
                  <Link href="#events-grid">Browse Events</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="/images/events/wolfrun-hero.jpg"
                    alt="Wolf Run obstacle course event"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="events-grid" className="py-16 md:py-24 border-t border-border">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Active Event Pages
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              Events now follow an initiative-style flow with dedicated detail pages and tailored forms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {eventsConfig.map((event) => (
                <article
                  key={event.title}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-7">
                  <span className="inline-block text-[10px] font-semibold tracking-[0.15em] uppercase text-foreground/70 mb-4 border border-border rounded-full px-3 py-1">
                    {event.badge}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <CalendarDays className="w-4 h-4" />
                    {event.dateLabel}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.shortDescription}
                  </p>
                  {event.priceLabel && <p className="mt-4 text-xs font-semibold text-foreground">{event.priceLabel}</p>}
                  <Button asChild className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold">
                    <Link href={`/events/${event.slug}`}>
                      View Event Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                    </div>
                  </article>
              ))}
            </div>
          </div>
        </section>

        <FooterSection />
      </main>
    </div>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { EventInterestForm } from "@/components/event-interest-form"
import { ScrollAnimations } from "@/components/scroll-animations"

const events = {
  "horse-riding": {
    title: "Horse Riding",
    price: "",
    image: "/images/events/horse-riding.jpg",
  },
  shooting: {
    title: "Shooting",
    price: "",
    image: "/images/events/shooting.jpg",
  },
  "yorkshire-3-peaks": {
    title: "Yorkshire 3 Peaks",
    price: "GBP 20 per person, coach included",
    image: "/images/events/yorkshire-3-peaks.jpg",
  },
} as const

type EventSlug = keyof typeof events

function isEventSlug(value: string): value is EventSlug {
  return value in events
}

export function generateStaticParams() {
  return Object.keys(events).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!isEventSlug(slug)) return { title: "Event Not Found | Devanhaar" }
  return { title: `${events[slug].title} | Events | Devanhaar` }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isEventSlug(slug)) notFound()

  const event = events[slug]

  return (
    <div>
      <Navbar />
      <ScrollAnimations />
      <main className="pt-28">
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-amber-900/80" />
          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-4">Event</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
            {event.price && <p className="text-white/70">{event.price}</p>}
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Interest Form</h2>
            <EventInterestForm eventTitle={event.title} slug={slug} />
          </div>
        </section>

        <FooterSection />
      </main>
    </div>
  )
}

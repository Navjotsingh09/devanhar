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
  },
  shooting: {
    title: "Shooting",
    price: "",
  },
  "yorkshire-3-peaks": {
    title: "Yorkshire 3 Peaks",
    price: "GBP 20 per person, coach included",
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
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/60 mb-4">Event</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{event.title}</h1>
            {event.price && <p className="text-muted-foreground">{event.price}</p>}
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

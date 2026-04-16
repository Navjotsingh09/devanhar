import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

const events = {
  "horse-riding": {
    title: "Horse Riding",
    price: "Interested in paying X amount",
  },
  shooting: {
    title: "Shooting",
    price: "GBP 250 per year",
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
            <p className="text-muted-foreground">{event.price}</p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Interest Form</h2>
            <form className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2" action="mailto:admin@devanhaar.com" method="post" encType="text/plain">
              <input aria-label="Event" name="event" defaultValue={event.title} className="hidden" />
              <input name="name" placeholder="Name" required className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              <input name="age" placeholder="Age" required className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              <input name="phone" placeholder="Phone No" required className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              <input name="email" type="email" placeholder="Email" required className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />

              {slug === "horse-riding" && <div className="md:col-span-2 rounded-xl border border-border p-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="paying_x" /> Interested in paying X amount</label><input name="times_available" placeholder="Times available (morning/evening)" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" /><input name="cadence" placeholder="Weekly/Monthly" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" /></div>}

              {slug === "shooting" && <div className="md:col-span-2 rounded-xl border border-border p-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="membership_12_week" /> Interested in a 12 week membership?</label><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="pay_250" /> Interested in paying GBP 250 a year?</label><input name="weekly_commitment" placeholder="Weekly commitment" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" /><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" name="commitment_policy" /> If not committed, can be removed from course.</label></div>}


              {slug === "yorkshire-3-peaks" && <div className="md:col-span-2 rounded-xl border border-border p-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="terms" required /> Agree to T and Cs *</label><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="fee_20" required /> GBP 20 per person, coach included *</label><input name="hiked_before" placeholder="Hiked before?" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" /><input name="hiking_level" placeholder="What level?" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" /></div>}

              <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" required name="terms_global" /> Agree to T and Cs *</label>
              <button type="submit" className="md:col-span-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Submit Interest</button>
            </form>
          </div>
        </section>

        <FooterSection />
      </main>
    </div>
  )
}

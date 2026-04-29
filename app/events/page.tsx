import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Events | Devanhaar Sikh Charity",
  description:
    "Join Devanhaar at upcoming events including charity challenges, outdoor adventures, and community gatherings across the UK.",
}

const engagementEvents = [
  {
    title: "Yorkshire 3 Peaks",
    date: "27 June 2026",
    description:
      "A charity challenge taking on the iconic Yorkshire Three Peaks — Pen-y-ghent, Whernside, and Ingleborough — to raise funds and build community spirit.",
    category: "Challenge",
  },
  {
    title: "Wolf Run",
    date: "12 September 2026",
    description:
      "An obstacle course adventure through mud, water, and woodland. A test of grit and teamwork for a great cause.",
    category: "Challenge",
  },
  {
    title: "Paintballing",
    date: "30 January 2027",
    description:
      "A fun, high-energy team event bringing together the community for friendly competition and camaraderie.",
    category: "Social",
  },
]

const skillsEvents = [
  {
    title: "Shooting",
    date: "Weekly sessions",
    description:
      "Regular target shooting sessions developing focus, discipline, and precision. Annual membership available.",
    category: "Skills",
    note: "£250/year membership",
  },
  {
    title: "Bushcraft",
    date: "May / June",
    description:
      "Learn essential outdoor survival skills including fire-making, shelter building, and navigation in the British countryside.",
    category: "Life Skills",
  },
  {
    title: "Wild Camping",
    date: "May / June",
    description:
      "An immersive overnight outdoor experience connecting with nature and building resilience away from everyday comforts.",
    category: "Life Skills",
  },
  {
    title: "Horse Riding & Seva",
    date: "March onwards",
    description:
      "Combining horsemanship with seva, participants learn riding skills while contributing to community service.",
    category: "Life Skills",
  },
]

export default function EventsPage() {
  return (
    <div>
      <Navbar />
      <ScrollAnimations />
      <main className="pt-28">
        {/* Hero */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                Events
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                Upcoming Events & Activities
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                From charity challenges to outdoor adventures and life skills
                workshops, get involved with Devanhaar beyond our core
                initiatives.
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                <Link href="/#contact">Register Interest</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Engagement Events */}
        <section className="py-16 md:py-24 border-t border-border">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Engagement Events
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              Community challenges and social events that bring people together.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {engagementEvents.map((event) => (
                <div
                  key={event.title}
                  className="rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-colors"
                >
                  <span className="inline-block text-[10px] font-semibold tracking-[0.15em] uppercase text-primary mb-4 border border-primary/30 rounded-full px-3 py-1">
                    {event.category}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills & Life Events */}
        <section className="py-16 md:py-24 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Skills & Life Events
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              Hands-on experiences building practical skills, confidence, and
              resilience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skillsEvents.map((event) => (
                <div
                  key={event.title}
                  className="rounded-2xl border border-border bg-card p-7 hover:border-primary/30 transition-colors"
                >
                  <span className="inline-block text-[10px] font-semibold tracking-[0.15em] uppercase text-primary mb-3 border border-primary/30 rounded-full px-3 py-1">
                    {event.category}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                  {event.note && (
                    <p className="text-xs text-primary font-medium mt-3">
                      {event.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 bg-[#1a1f2e]">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Want to Join an Event?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Get in touch to register your interest or find out more about
              upcoming activities.
            </p>
            <Button asChild className="bg-white text-[#1a1f2e] hover:bg-white/90 rounded-full px-8 py-6 text-base">
              <Link href="/#contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <FooterSection />
      </main>
    </div>
  )
}

import Link from "next/link"
import { CalendarDays, ArrowRight, HeartHandshake, Sparkles, UsersRound } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { FamilyInitiativeUpcomingCards } from "@/components/family-initiative/family-initiative-upcoming-cards"

export const metadata = {
  title: "Sikh Family Initiative | Devanhaar",
  description: "The umbrella for Sikh Family Retreat, Sikh Family Extravaganza and Wedding Fair.",
}

const projects = [
  {
    title: "Sikh Family Retreat",
    description: "Residential family retreats built around sangat, Sikhi, learning and shared memories.",
    href: "/initiatives/sikh-family-retreat",
    icon: HeartHandshake,
    dates: ["31 Dec 2026–3 Jan 2027 · New Year Reset", "1–4 April 2027 · Spring", "22–25 July 2027 · Summer"],
    cta: "Explore the retreat",
  },
  {
    title: "Sikh Family Extravaganza",
    description: "A large family celebration bringing generations together through activities, connection and community.",
    href: "/initiatives/sikh-family-extravaganza",
    icon: Sparkles,
    dates: ["May 2027"],
    cta: "Explore the extravaganza",
  },
  {
    title: "Wedding Fair",
    description: "A Sikh-focused wedding fair connecting families with trusted suppliers, inspiration and practical guidance.",
    href: "/initiatives/wedding-fair",
    icon: UsersRound,
    dates: ["13 February 2027"],
    cta: "Explore the wedding fair",
  },
]

export default function SikhFamilyInitiativePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="relative overflow-hidden bg-[#101b2d] text-white">
          <img
            src="/initiatives/sikh-family-retreat-top.png"
            alt="Sikh families together"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101b2d] via-[#101b2d]/85 to-[#101b2d]/35" />
          <div className="relative z-10 container mx-auto max-w-6xl px-6 pb-14 pt-36 lg:px-12 lg:pb-16 lg:pt-44">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">Sikh Family Initiative</p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">One umbrella. Three ways for Sikh families to connect.</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              Sikh Family Initiative brings together our family-focused projects: Sikh Family Retreat, Sikh Family Extravaganza and Wedding Fair.
            </p>

            <FamilyInitiativeUpcomingCards />
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Our family projects</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Choose the experience that fits your family</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                Each project has its own page, dates and registration journey, while remaining part of the same Sikh Family Initiative.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {projects.map((project) => {
                const Icon = project.icon
                return (
                  <article key={project.title} className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold">{project.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{project.description}</p>
                    <div className="mt-6 space-y-2 border-t border-border pt-5">
                      {project.dates.map((date) => (
                        <div key={date} className="flex items-center gap-2 text-sm font-medium">
                          <CalendarDays className="h-4 w-4 text-[hsl(43,100%,29%)]" />
                          {date}
                        </div>
                      ))}
                    </div>
                    <Button asChild className="mt-6 w-full rounded-full bg-[hsl(43,100%,29%)] text-white hover:bg-[hsl(43,100%,25%)]">
                      <Link href={project.href}>{project.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-secondary/30 py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6 text-center lg:px-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Built for families</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">One community, year-round reasons to come back together</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              From residential retreats to large family events and wedding planning, the initiative is designed to create continuity, familiarity and stronger relationships from one event to the next.
            </p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

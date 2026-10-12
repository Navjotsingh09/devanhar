import Link from "next/link"
import { CalendarDays, ArrowRight, HeartHandshake, Sparkles, UsersRound } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

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
    dates: ["1–4 April 2027", "22–25 July 2027"],
    cta: "Explore the retreat",
  },
  {
    title: "Sikh Family Extravaganza",
    description: "A large family celebration bringing generations together through activities, connection and community.",
    href: "/initiatives/sikh-family-extravaganza",
    icon: Sparkles,
    dates: ["Provisional: Dec 2027 – Jan 2028"],
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

const upcoming = [
  { label: "Wedding Fair", date: "13 February 2027", href: "/initiatives/wedding-fair" },
  { label: "Sikh Family Retreat · Spring", date: "1–4 April 2027", href: "/initiatives/sikh-family-retreat" },
  { label: "Sikh Family Retreat · Summer", date: "22–25 July 2027", href: "/initiatives/sikh-family-retreat" },
  { label: "Sikh Family Extravaganza", date: "Provisional · Dec 2027 – Jan 2028", href: "/initiatives/sikh-family-extravaganza" },
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

            <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {upcoming.map((event, index) => (
                <Link key={event.label + event.date} href={event.href} className="group rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition hover:bg-white/15">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold text-white/60">0{index + 1}</span>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-white">{event.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-200">{event.date}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white">
                    View project <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
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

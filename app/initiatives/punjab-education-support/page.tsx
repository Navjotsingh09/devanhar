import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, BookOpen, GraduationCap, HeartHandshake, School, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Punjab Education Support Project | Devanhaar",
  description:
    "Devanhaar's Punjab Education Support initiative helps strengthen educational opportunity for children and young people in Punjab.",
  openGraph: {
    title: "Punjab Education Support | Devanhaar",
    description:
      "Supporting education, opportunity and long-term development for children and young people in Punjab.",
    url: "https://devanhaar.com/pes",
  },
  alternates: {
    canonical: "https://devanhaar.com/pes",
  },
}

const pillars = [
  {
    icon: BookOpen,
    title: "Access to learning",
    description:
      "Helping remove practical barriers that can prevent children and young people from continuing their education.",
  },
  {
    icon: School,
    title: "Educational support",
    description:
      "Working towards useful, needs-led support that strengthens learning environments and student development.",
  },
  {
    icon: GraduationCap,
    title: "Long-term opportunity",
    description:
      "Focusing on education as a route to greater confidence, independence and future opportunity.",
  },
]

export default function PunjabEducationSupportPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="relative overflow-hidden bg-[#101b2d] text-white">
          <img
            src="/images/initiatives-hero.jpg"
            alt="Punjab Education Support"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101b2d] via-[#101b2d]/90 to-[#101b2d]/55" />
          <div className="relative z-10 container mx-auto max-w-6xl px-6 pb-20 pt-36 lg:px-12 lg:pb-24 lg:pt-44">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              Devanhaar Initiative
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
              Punjab Education Support Project
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-xl">
              Supporting education, opportunity and long-term development for children and young people in Punjab.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-amber-400 px-7 text-slate-950 hover:bg-amber-300">
                <Link href="/contact">
                  Get involved <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white">
                <Link href="/donate">Support the initiative</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                Why this matters
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Education can change the direction of a life.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-7 text-muted-foreground md:text-lg">
              <p>
                Punjab Education Support is Devanhaar&apos;s initiative focused on helping children and young people access stronger educational opportunities and the support they need to progress.
              </p>
              <p>
                The programme is being developed around practical need rather than one-size-fits-all assistance. As projects and partnerships are confirmed, this page will provide the team and community with the latest programme information.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="mb-10 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                Our focus
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Practical support with long-term purpose
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <article key={pillar.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-5xl px-6 lg:px-12">
            <div className="rounded-3xl bg-[#101b2d] p-8 text-white md:p-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center gap-2 text-amber-300">
                    <HeartHandshake className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Build it together</span>
                  </div>
                  <h2 className="text-3xl font-bold md:text-4xl">Help strengthen educational opportunity in Punjab.</h2>
                  <p className="mt-4 text-base leading-7 text-white/70">
                    If you would like to support, partner with, volunteer for or learn more about the initiative, contact the Devanhaar team.
                  </p>
                </div>
                <Button asChild className="shrink-0 rounded-full bg-amber-400 px-7 text-slate-950 hover:bg-amber-300">
                  <Link href="/contact">
                    Contact the team <Users className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

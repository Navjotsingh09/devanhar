import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, BookOpen, GraduationCap, HeartHandshake, MapPin, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Punjab Education Support | Devanhaar",
  description:
    "Punjab Education Support is a Devanhaar education initiative focused on supporting children and young people in Punjab.",
  openGraph: {
    title: "Punjab Education Support | Devanhaar",
    description:
      "Education support for children and young people in Punjab, developed as part of Devanhaar's wider education work.",
    url: "https://devanhaar.vercel.app/initiatives/punjab-education-support",
  },
  alternates: {
    canonical: "https://devanhaar.vercel.app/initiatives/punjab-education-support",
  },
}

const projectQuestions = [
  {
    number: "01",
    title: "What is it?",
    text: "Punjab Education Support is Devanhaar's education-focused initiative for Punjab. It gives the organisation a dedicated place to develop and present practical education support work in the region.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Who is it for?",
    text: "The project is centred on children and young people in Punjab whose education can be strengthened through the right support, opportunities and local partnerships.",
    icon: Users,
  },
  {
    number: "03",
    title: "Why does it matter?",
    text: "Education can create long-term opportunity. The project is intended to support learning in a way that is useful, dignified and connected to the needs of the people and communities involved.",
    icon: GraduationCap,
  },
  {
    number: "04",
    title: "How can I get involved?",
    text: "Supporters, volunteers and potential partners can speak to the Devanhaar team. Specific ways to take part will be added as each programme and partnership is confirmed.",
    icon: HeartHandshake,
  },
]

export default function PunjabEducationSupportPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="relative isolate min-h-[680px] overflow-hidden bg-[#151c2b] text-white">
          <img
            src="/images/initiatives-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/90 to-[#111827]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

          <div className="relative z-10 container mx-auto flex min-h-[680px] max-w-7xl items-end px-6 pb-16 pt-36 lg:px-12 lg:pb-20">
            <div className="max-w-4xl">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                <span>Education</span>
                <span className="h-1 w-1 rounded-full bg-amber-300/70" />
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Punjab
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-[0.98] tracking-tight md:text-7xl lg:text-[5.5rem]">
                Punjab
                <span className="block text-white/70">Education Support</span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
                A dedicated Devanhaar project focused on education, opportunity and long-term support for children and young people in Punjab.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-amber-400 px-7 py-6 text-slate-950 hover:bg-amber-300">
                  <Link href="/contact">
                    Get involved
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 py-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/projects">View all projects</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  The project
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                  Education support with a clear purpose.
                </h2>
              </div>

              <div className="space-y-5 text-base leading-8 text-muted-foreground md:text-lg">
                <p>
                  Punjab Education Support gives Devanhaar a dedicated platform for education-focused work in Punjab, while keeping the project connected to the organisation&apos;s wider mission of developing, empowering, elevating and connecting.
                </p>
                <p>
                  The page is intentionally structured around the four questions every Devanhaar project should answer: what the project is, who it is for, why it matters, and how people can get involved.
                </p>
                <p>
                  Programme-specific details can be added here as they are confirmed by the team, without changing the core structure of the page.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f3ed] py-16 text-slate-950 md:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-12 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b00]">
                Understanding the initiative
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                Four questions. One clear project.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {projectQuestions.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.number} className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm md:p-9">
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold tracking-[0.18em] text-black/30">{item.number}</span>
                    </div>
                    <h3 className="mt-8 text-2xl font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-4 max-w-xl text-base leading-7 text-black/60">{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="overflow-hidden rounded-[2rem] bg-[#111827] text-white">
              <div className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Get involved
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                    Help shape the next stage of Punjab Education Support.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-white/70">
                    If you want to support the initiative, volunteer, collaborate or discuss a potential education partnership, contact the Devanhaar team.
                  </p>
                </div>

                <Button asChild className="rounded-full bg-amber-400 px-7 py-6 text-slate-950 hover:bg-amber-300">
                  <Link href="/contact">
                    Contact Devanhaar
                    <ArrowRight className="ml-2 h-4 w-4" />
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

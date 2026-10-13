import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  HandHeart,
  School,
  Sparkles,
  UsersRound,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Punjab Education Support Project | Devanhaar",
  description:
    "Building stronger schools through partnership, opportunity and shared learning between Punjab and the UK.",
  openGraph: {
    title: "Punjab Education Support Project | Devanhaar",
    description:
      "A long-term education partnership supporting teachers, pupils and schools in Punjab.",
    url: "https://devanhaar.com/pes",
  },
  alternates: {
    canonical: "https://devanhaar.com/pes",
  },
}

const focusAreas = [
  {
    icon: GraduationCap,
    title: "Teacher development",
    description:
      "Continuing Professional Development that helps teachers and school leaders exchange ideas, strengthen classroom practice and build confidence.",
  },
  {
    icon: School,
    title: "UK–Punjab school partnerships",
    description:
      "Long-term relationships between schools, educators and organisations so knowledge, experience and resources can be shared in both directions.",
  },
  {
    icon: UsersRound,
    title: "Opportunities for pupils",
    description:
      "Activities, enrichment and wider learning experiences that give young people more opportunities to develop skills, confidence and ambition.",
  },
  {
    icon: BookOpen,
    title: "Educational resources",
    description:
      "Practical, needs-led support for learning environments, teaching materials and school development where it can make a lasting difference.",
  },
]

export default function PunjabEducationSupportPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-[#101b2d] text-white">
          <img
            src="/images/pes-school-group-hero-live.webp"
            alt="Punjab Education Support Project"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101b2d]/82 via-[#101b2d]/45 to-transparent" />
          <div className="relative z-10 container mx-auto max-w-6xl px-6 pb-32 pt-36 lg:px-12 lg:pb-40 lg:pt-44">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              Punjab Education Support Project
            </p>
            <h1 className="mt-4 max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Building stronger schools through partnership, opportunity and shared learning
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 md:text-xl">
              The Punjab Education Support Project is an educational initiative working with schools in Punjab to create sustainable improvements in teaching, learning and opportunities for young people.
            </p>
          </div>
        </section>

        <section className="relative z-20 -mt-16 pb-8">
          <div className="container mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-3 lg:px-12">
            <article className="rounded-[1.5rem] border border-border bg-white p-6 shadow-xl shadow-black/5">
              <GraduationCap className="h-6 w-6 text-[hsl(43,100%,29%)]" />
              <p className="mt-4 text-sm font-semibold text-foreground">Investing in teachers</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sustainable improvement starts with the people who teach and lead schools every day.
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-white p-6 shadow-xl shadow-black/5">
              <School className="h-6 w-6 text-[hsl(43,100%,29%)]" />
              <p className="mt-4 text-sm font-semibold text-foreground">Connecting schools</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Building practical relationships between educators in Punjab and the UK.
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-white p-6 shadow-xl shadow-black/5">
              <UsersRound className="h-6 w-6 text-[hsl(43,100%,29%)]" />
              <p className="mt-4 text-sm font-semibold text-foreground">Supporting pupils</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Creating wider learning, development and opportunity for young people.
              </p>
            </article>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(43,100%,29%)]">
                A partnership approach
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Sustainable change, built together.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              <p>
                Our approach is based on partnership.
              </p>
              <p>
                Rather than simply providing short-term support, we want to connect schools, teachers and education leaders in Punjab with colleagues and organisations in the UK so that knowledge, experience and resources can be shared over the longer term.
              </p>
              <p>
                At the heart of the project is Maharaja Ranjit Singh Public School in Tarn Taran Sahib, Punjab, where we are developing a programme of teacher development, pupil activities, international school partnerships and educational support.
              </p>
              <p>
                The project is still growing, but important work has already begun.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f8f5] py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div className="rounded-[2rem] bg-[#101b2d] p-8 text-white md:p-10">
                <GraduationCap className="h-7 w-7 text-amber-300" />
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Investing in teachers
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  Supporting the people who make the biggest difference
                </h2>
              </div>
              <div className="space-y-5 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                <p>
                  One of our main priorities is teacher CPD — Continuing Professional Development.
                </p>
                <p>
                  Buildings, technology and resources are important, but sustainable improvement comes from investing in teachers and school leaders.
                </p>
                <p>
                  Through the Punjab Education Support Project, we are developing opportunities for teachers in Punjab to work alongside experienced UK educators. The aim is not to impose one education system on another, but to create opportunities to exchange ideas, examine different approaches and identify practical improvements that can work in the local school context.
                </p>
                <p>
                  Over time, we want this to grow into an ongoing programme of professional learning, mentoring and shared practice rather than a one-off training visit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-2">
              <article className="rounded-[2rem] border border-border p-8 md:p-10">
                <School className="h-7 w-7 text-[hsl(43,100%,29%)]" />
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                  Connecting schools in Punjab and the UK
                </p>
                <h2 className="mt-3 text-3xl font-bold">Partnership beyond a single visit.</h2>
                <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
                  <p>
                    We want schools in Punjab and the UK to build genuine relationships that can continue over time.
                  </p>
                  <p>
                    These partnerships can give teachers and school leaders a way to share experience, compare approaches and collaborate on areas such as teaching practice, curriculum enrichment, pupil development and school leadership.
                  </p>
                  <p>
                    The strongest partnerships are two-way. Schools in both countries have experience and ideas to contribute, and the project is designed around that principle.
                  </p>
                </div>
              </article>

              <article className="rounded-[2rem] border border-border p-8 md:p-10">
                <UsersRound className="h-7 w-7 text-[hsl(43,100%,29%)]" />
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                  Supporting young people directly
                </p>
                <h2 className="mt-3 text-3xl font-bold">More opportunities to learn and grow.</h2>
                <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
                  <p>
                    Alongside teacher development, we want pupils to benefit directly from new opportunities.
                  </p>
                  <p>
                    This includes activities that strengthen confidence, communication, creativity, digital skills and wider awareness, as well as opportunities to connect with pupils and schools outside their immediate community.
                  </p>
                  <p>
                    Our aim is to complement the work already happening in school and help young people see a wider range of possibilities for their future.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#101b2d] py-16 text-white md:py-20">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Project launch
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-amber-300" />
                  <p className="text-2xl font-bold">Monday 26 October 2026</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Turning the partnership into a long-term programme.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">
                  The launch marks the next stage of the Punjab Education Support Project: bringing educators, supporters and partners together around a clear programme for teacher development, pupil opportunity and long-term school collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f8f5] py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(43,100%,29%)]">
                What we want to build
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                A programme that becomes stronger every year.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
                The long-term vision is not a single donation or one-off intervention. It is an education partnership that can deepen over time as more schools, teachers and supporters become involved.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {focusAreas.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-[1.75rem] border border-border bg-white p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f1e7] text-[hsl(43,100%,29%)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-2 lg:px-12">
            <article className="rounded-[2rem] bg-[#101b2d] p-8 text-white md:p-10">
              <HandHeart className="h-7 w-7 text-amber-300" />
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Help us make a difference
              </p>
              <h2 className="mt-3 text-3xl font-bold">Support the project.</h2>
              <p className="mt-4 text-base leading-7 text-white/75">
                Donations help us develop teacher training, pupil activities, educational resources and the practical work needed to sustain partnerships between schools in Punjab and the UK.
              </p>
              <Button asChild className="mt-7 rounded-full bg-amber-400 px-7 text-slate-950 hover:bg-amber-300">
                <Link href="/donate">
                  Donate to the project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </article>

            <article className="rounded-[2rem] border border-border bg-white p-8 md:p-10">
              <Sparkles className="h-7 w-7 text-[hsl(43,100%,29%)]" />
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                More than giving
              </p>
              <h2 className="mt-3 text-3xl font-bold">Get involved.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                We would also like to hear from teachers, school leaders, education professionals, organisations and volunteers who can contribute time, expertise, resources or partnership opportunities.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                If you can help build a useful connection between Punjab and the UK, we would be glad to speak with you.
              </p>
              <Button asChild variant="outline" className="mt-7 rounded-full px-7">
                <Link href="/contact">
                  Get involved <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </article>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

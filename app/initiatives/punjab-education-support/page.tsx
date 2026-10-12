import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Lightbulb,
  School,
  Users,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Punjab Education Support Project | Devanhaar",
  description:
    "Building stronger schools through partnership, opportunity and shared learning in Punjab.",
  openGraph: {
    title: "Punjab Education Support Project | Devanhaar",
    description:
      "An educational initiative working with schools in Punjab to create sustainable improvements in teaching, learning and opportunities for young people.",
    url: "https://devanhaar.vercel.app/initiatives/punjab-education-support",
  },
  alternates: {
    canonical: "https://devanhaar.vercel.app/initiatives/punjab-education-support",
  },
}

const teacherSupport = [
  "Classroom practice and approaches to teaching and learning",
  "Curriculum planning and development",
  "Sharing high-quality teaching resources",
  "Assessment and quality assurance",
  "School improvement",
  "Leadership development",
  "Professional exchange between teachers in the UK and Punjab",
]

const vision = [
  {
    title: "Teacher Development",
    icon: GraduationCap,
    text: "Regular CPD, professional exchange and opportunities for teachers to learn from colleagues in both Punjab and the UK.",
  },
  {
    title: "School Partnerships",
    icon: Handshake,
    text: "Meaningful twinning relationships connecting pupils, teachers and school leaders.",
  },
  {
    title: "Pupil Opportunities",
    icon: Lightbulb,
    text: "STEM challenges, international projects, English support, mentoring and other activities that broaden pupils' experiences.",
  },
  {
    title: "Leadership Support",
    icon: School,
    text: "Opportunities for experienced education leaders to work alongside local school leadership teams on school development and improvement.",
  },
]

export default function PunjabEducationSupportPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-[#111827] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.16),transparent_34%)]" />
          <div className="container relative mx-auto max-w-7xl px-6 pb-20 pt-36 lg:px-12 lg:pb-24 lg:pt-44">
            <div className="max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Punjab Education Support Project
              </p>
              <h1 className="mt-5 max-w-5xl text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                Building stronger schools through partnership, opportunity and shared learning
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/75 md:text-xl">
                An educational initiative working with schools in Punjab to create sustainable improvements in teaching, learning and opportunities for young people.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-amber-400 px-7 py-6 text-slate-950 hover:bg-amber-300">
                  <Link href="/donate">
                    Support the project <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 py-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/contact">Get involved</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About the project</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                Partnership, not short-term intervention.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted-foreground md:text-lg">
              <p>
                The Punjab Education Support Project is an educational initiative working with schools in Punjab to create sustainable improvements in teaching, learning and opportunities for young people.
              </p>
              <p>
                Our approach is based on partnership. Rather than simply providing short-term support, we want to connect schools, teachers and education leaders in Punjab with colleagues and organisations in the UK so that knowledge, experience and resources can be shared over the longer term.
              </p>
              <p>
                At the heart of the project is <strong className="font-semibold text-foreground">Maharaja Ranjit Singh Public School in Tarn Taran Sahib, Punjab</strong>, where we are developing a programme of teacher development, pupil activities, international school partnerships and educational support.
              </p>
              <p>The project is still growing, but important work has already begun.</p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Investing in Teachers</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                  Supporting the people who make the biggest difference
                </h2>
                <div className="mt-7 space-y-5 text-base leading-8 text-muted-foreground md:text-lg">
                  <p>
                    One of our main priorities is teacher <strong className="font-semibold text-foreground">CPD — Continuing Professional Development</strong>.
                  </p>
                  <p>
                    Buildings, technology and resources are important, but sustainable improvement comes from investing in teachers and school leaders.
                  </p>
                  <p>
                    Through the Punjab Education Support Project, we are developing opportunities for teachers in Punjab to work alongside experienced UK educators. The aim is not to impose one education system on another, but to create opportunities to exchange ideas, examine good practice and identify approaches that work within the local context.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-secondary/35 p-7 md:p-9">
                <p className="text-sm font-semibold text-foreground">Areas of support include</p>
                <div className="mt-6 space-y-4">
                  {teacherSupport.map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      <p className="text-sm leading-6 text-muted-foreground md:text-base">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-border pt-7 text-sm leading-7 text-muted-foreground md:text-base">
                  <p>
                    We are particularly keen for visiting teachers and school leaders to spend meaningful time in schools rather than simply attending an event. This allows relationships to develop and gives colleagues the opportunity to observe, discuss, plan and work together.
                  </p>
                  <p className="mt-4">
                    Over time, we hope to establish an ongoing programme of both face-to-face and online professional development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f3ed] py-16 text-slate-950 md:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl bg-white p-8 shadow-sm md:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111827] text-white">
                  <Handshake className="h-5 w-5" />
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b00]">
                  Connecting Schools in Punjab and the UK
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Building genuine school relationships</h2>
                <div className="mt-6 space-y-4 text-base leading-7 text-black/65">
                  <p>
                    An important part of the project is creating genuine relationships between schools.
                  </p>
                  <p>
                    Work has begun to develop a school-twinning partnership between <strong className="font-semibold text-black">Maharaja Ranjit Singh Public School in Tarn Taran Sahib</strong> and <strong className="font-semibold text-black">Pioneer Secondary Academy and Khalsa Primary School in the UK</strong>.
                  </p>
                  <p>
                    We want these partnerships to go much further than exchanging letters or photographs. The intention is for pupils and teachers to work together on shared educational activities, competitions and projects, while teachers can exchange resources and professional practice.
                  </p>
                  <p>Our ambition is to develop a model that can eventually be extended to other schools in Punjab.</p>
                </div>
              </article>

              <article className="rounded-3xl bg-[#111827] p-8 text-white shadow-sm md:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                  <Users className="h-5 w-5" />
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Supporting Young People Directly
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Confidence, communication and opportunity</h2>
                <div className="mt-6 space-y-4 text-base leading-7 text-white/70">
                  <p>
                    During summer 2026, we piloted an additional strand of the project: one-to-one online English support for pupils.
                  </p>
                  <p>
                    Interns worked individually with young people in approximately 20-minute online sessions, with an emphasis on spoken English, communication and confidence.
                  </p>
                  <p>
                    The pilot demonstrated how relatively simple technology can connect volunteers and young people across thousands of miles. We are now looking at how this type of support could develop further, alongside other opportunities for pupils.
                  </p>
                  <p>
                    This includes plans for collaborative STEM activities and challenges, giving pupils in Punjab and the UK opportunities to work on common projects, share ideas and learn from one another.
                  </p>
                  <p>
                    The objective is not simply better academic outcomes. We also want young people to develop confidence, curiosity and a greater awareness of the world beyond their own school and community.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 md:p-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                    Punjab Education Support Project Launch
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                    Monday 26 October 2026 · Tarn Taran Sahib
                  </h2>
                  <div className="mt-6 space-y-4 text-base leading-7 text-slate-700 md:text-lg">
                    <p>
                      We plan to hold a special launch and celebration event at Maharaja Ranjit Singh Public School, Tarn Taran Sahib.
                    </p>
                    <p>
                      The event will bring together representatives from participating schools and partner organisations alongside educational representatives, community leaders, invited dignitaries and members of the media.
                    </p>
                    <p>
                      However, the visit is intended to be much more than a ceremonial launch. We are encouraging UK teachers and school leaders attending the event to remain in Punjab for several days where possible, working directly with local teachers and leadership teams.
                    </p>
                    <p>
                      This will provide opportunities for classroom collaboration, CPD, sharing teaching resources and discussing approaches to school improvement and leadership. The event will therefore mark an important moment for the project — celebrating what has begun while setting out our ambitions for the years ahead.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/25 py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What We Want to Build</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                A sustainable education network throughout the year
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                Our long-term vision is to create a sustainable network through which schools in Punjab can benefit from educational collaboration throughout the year.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {vision.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{item.text}</p>
                  </article>
                )
              })}
            </div>

            <p className="mt-8 text-base font-medium leading-7 text-foreground md:text-lg">
              Most importantly, we want the project to become something that schools themselves help to shape.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-[2rem] bg-[#111827] p-8 text-white md:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Help Us Make a Difference</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Support the Punjab Education Support Project</h2>
                <div className="mt-5 space-y-4 text-base leading-7 text-white/70">
                  <p>There is much more that we would like to do.</p>
                  <p>
                    Developing teacher training, educational resources, pupil programmes and international partnerships all requires support.
                  </p>
                  <p>
                    A donation to the Punjab Education Support Project can help us continue this work and extend the opportunities available to more teachers and young people.
                  </p>
                  <p>
                    Whether your contribution is large or small, you will be helping us invest in education in a way that can have an impact far beyond a single lesson or school year.
                  </p>
                </div>
                <Button asChild className="mt-7 rounded-full bg-amber-400 px-7 py-6 text-slate-950 hover:bg-amber-300">
                  <Link href="/donate">
                    Donate to the Punjab Education Support Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </article>

              <article className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-primary">More Than Giving — Get Involved</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Bring your experience to the project</h2>
                <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
                  <p>Financial support is only one way to contribute.</p>
                  <p>
                    We would also like to hear from teachers, school leaders, education professionals, schools and organisations interested in supporting the project.
                  </p>
                  <p>
                    You may be able to contribute your professional expertise, participate in CPD, support a pupil project, establish a school partnership or join one of our future visits to Punjab.
                  </p>
                  <p>By bringing people together around education, we believe we can create something lasting.</p>
                </div>
                <Button asChild variant="outline" className="mt-7 rounded-full px-7 py-6">
                  <Link href="/contact">
                    Get involved <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </article>
            </div>

            <p className="mx-auto mt-14 max-w-4xl text-center text-2xl font-semibold leading-relaxed tracking-tight md:text-3xl">
              Together, we can help create stronger schools, confident teachers and greater opportunities for young people across Punjab.
            </p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

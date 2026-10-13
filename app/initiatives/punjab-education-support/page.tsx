import Link from "next/link"
import type { Metadata } from "next"
import { BookOpen, GraduationCap, Handshake, Lightbulb, School, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { CampLandingHero } from "@/components/camps/camp-landing-hero"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
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

const visionPillars = [
  {
    title: "Teacher Development",
    description:
      "Regular CPD, professional exchange and opportunities for teachers to learn from colleagues in both Punjab and the UK.",
    icon: GraduationCap,
  },
  {
    title: "School Partnerships",
    description:
      "Meaningful twinning relationships connecting pupils, teachers and school leaders.",
    icon: Handshake,
  },
  {
    title: "Pupil Opportunities",
    description:
      "STEM challenges, international projects, English support, mentoring and other activities that broaden pupils' experiences.",
    icon: Lightbulb,
  },
  {
    title: "Leadership Support",
    description:
      "Opportunities for experienced education leaders to work alongside local school leadership teams on school development and improvement.",
    icon: School,
  },
]

const teacherSupport = [
  "Classroom practice and approaches to teaching and learning",
  "Curriculum planning and development",
  "Sharing high-quality teaching resources",
  "Assessment and quality assurance",
  "School improvement",
  "Leadership development",
  "Professional exchange between teachers in the UK and Punjab",
]

export default function PunjabEducationSupportPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <CampLandingHero
          eyebrow="Education · Punjab"
          title="Punjab Education Support Project"
          subtitle="Building stronger schools through partnership, opportunity and shared learning."
          heroImage="/images/punjab-education-support-hero.jpg"
          ctas={[
            {
              label: "Support the project",
              description:
                "Help us invest in teacher development, educational resources, pupil programmes and long-term school partnerships.",
              href: "/donate",
              ctaLabel: "Donate now",
              primary: true,
            },
            {
              label: "More than giving",
              description:
                "Teachers, school leaders, education professionals, schools and organisations can contribute expertise, partnerships and time.",
              href: "/contact",
              ctaLabel: "Get involved",
            },
          ]}
        />

        <section className="container mx-auto max-w-3xl px-6 py-16 md:py-24 lg:px-12">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
            About the project
          </p>
          <h2 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
            Building stronger schools through partnership
          </h2>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              The Punjab Education Support Project is an educational initiative working with schools in Punjab to create sustainable improvements in teaching, learning and opportunities for young people.
            </p>
            <p>Our approach is based on partnership.</p>
            <p>
              Rather than simply providing short-term support, we want to connect schools, teachers and education leaders in Punjab with colleagues and organisations in the UK so that knowledge, experience and resources can be shared over the longer term.
            </p>
            <p>
              At the heart of the project is <strong className="font-semibold text-foreground">Maharaja Ranjit Singh Public School in Tarn Taran Sahib, Punjab</strong>, where we are developing a programme of teacher development, pupil activities, international school partnerships and educational support.
            </p>
            <p>The project is still growing, but important work has already begun.</p>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 py-20 md:py-28">
          <div className="container mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                Investing in Teachers
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Supporting the people who make the biggest difference
              </h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
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

            <div className="rounded-2xl border border-border bg-background p-7 md:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
                <GraduationCap className="h-6 w-6 text-[hsl(43,100%,29%)]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Areas of support include</h3>
              <ul className="mt-5 space-y-3">
                {teacherSupport.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(43,100%,29%)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground md:text-base">
                <p>
                  We are particularly keen for visiting teachers and school leaders to spend meaningful time in schools rather than simply attending an event. This allows relationships to develop and gives colleagues the opportunity to observe, discuss, plan and work together.
                </p>
                <p className="mt-4">
                  Over time, we hope to establish an ongoing programme of both face-to-face and online professional development.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-border bg-background p-7 md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
                  <Handshake className="h-6 w-6 text-[hsl(43,100%,29%)]" />
                </div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                  Connecting Schools in Punjab and the UK
                </p>
                <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                  Creating genuine relationships between schools
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  <p>An important part of the project is creating genuine relationships between schools.</p>
                  <p>
                    Work has begun to develop a school-twinning partnership between Maharaja Ranjit Singh Public School in Tarn Taran Sahib and Pioneer Secondary Academy and Khalsa Primary School in the UK.
                  </p>
                  <p>
                    We want these partnerships to go much further than exchanging letters or photographs. The intention is for pupils and teachers to work together on shared educational activities, competitions and projects, while teachers can exchange resources and professional practice.
                  </p>
                  <p>Our ambition is to develop a model that can eventually be extended to other schools in Punjab.</p>
                </div>
              </article>

              <article className="rounded-2xl border border-border bg-background p-7 md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
                  <Users className="h-6 w-6 text-[hsl(43,100%,29%)]" />
                </div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                  Supporting Young People Directly
                </p>
                <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                  Confidence, communication and wider opportunity
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
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

        <section className="border-t border-border bg-[#1a1f2e] py-20 text-white md:py-28">
          <div className="container mx-auto max-w-5xl px-6 lg:px-12">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              Punjab Education Support Project Launch
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Monday 26 October 2026
            </h2>
            <p className="mt-2 text-base font-medium text-white/70 md:text-lg">
              Maharaja Ranjit Singh Public School · Tarn Taran Sahib
            </p>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-white/70 md:text-lg">
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
        </section>

        <CorePillarsGrid
          pillars={visionPillars}
          heading="What We Want to Build"
          subheading="Our long-term vision is to create a sustainable network through which schools in Punjab can benefit from educational collaboration throughout the year."
        />

        <section className="container mx-auto max-w-3xl px-6 py-16 text-center md:py-20 lg:px-12">
          <p className="text-lg font-semibold leading-relaxed text-foreground md:text-xl">
            Most importantly, we want the project to become something that schools themselves help to shape.
          </p>
        </section>

        <section className="border-t border-border py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-[hsl(43,100%,29%)] bg-[hsl(43,100%,29%)] p-7 text-white shadow-lg md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <BookOpen className="h-6 w-6 text-amber-200" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Help Us Make a Difference
                </p>
                <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                  Support the Punjab Education Support Project
                </h2>
                <div className="mt-5 flex-1 space-y-4 text-sm leading-relaxed text-white/90 md:text-base">
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
                <div className="mt-7">
                  <Button asChild variant="secondary" className="rounded-full px-6">
                    <Link href="/donate">Donate to the project</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-border bg-background p-7 shadow-lg md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
                  <Users className="h-6 w-6 text-[hsl(43,100%,29%)]" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                  More Than Giving — Get Involved
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
                  Bring your experience to the project
                </h2>
                <div className="mt-5 flex-1 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  <p>Financial support is only one way to contribute.</p>
                  <p>
                    We would also like to hear from teachers, school leaders, education professionals, schools and organisations interested in supporting the project.
                  </p>
                  <p>
                    You may be able to contribute your professional expertise, participate in CPD, support a pupil project, establish a school partnership or join one of our future visits to Punjab.
                  </p>
                  <p>By bringing people together around education, we believe we can create something lasting.</p>
                </div>
                <div className="mt-7">
                  <Button asChild className="rounded-full px-6">
                    <Link href="/contact">Get involved</Link>
                  </Button>
                </div>
              </div>
            </div>

            <p className="mx-auto mt-14 max-w-4xl text-center text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
              Together, we can help create stronger schools, confident teachers and greater opportunities for young people across Punjab.
            </p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

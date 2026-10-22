import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  MessageCircle,
  Sparkles,
  UsersRound,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

import type { SfiContent } from "@/lib/cms/sfi-content"

export function SfiPageContent({ content }: { content: SfiContent }) {
  const icons = { HeartHandshake, UsersRound, Leaf, Sparkles }
  const sections: Record<string, React.ReactNode> = {
    events: (<section id="upcoming" className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(43,100%,29%)]">
                  {content.eventsIntro.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                  {content.eventsIntro.title}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {content.eventsIntro.description}
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {content.events.map((event, index) => {
                const Icon = icons[event.icon]
                return (
                  <article
                    key={event.title}
                    className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
                  >
                    <div className="grid lg:grid-cols-[280px_1fr]">
                      <div className="flex flex-col justify-between bg-[#f6f1e7] p-7 md:p-8">
                        <div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[hsl(43,100%,29%)] shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                            {event.eyebrow}
                          </p>
                          <p className="mt-2 text-2xl font-bold leading-tight">{event.title}</p>
                        </div>
                        <div className="mt-8 flex items-start gap-2 text-sm font-semibold text-slate-700">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(43,100%,29%)]" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                      <div className="p-7 md:p-9 lg:p-10">
                        <p className="text-xl font-semibold leading-relaxed text-foreground">{event.intro}</p>
                        <div className="mt-5 space-y-4">
                          {event.body.map((paragraph) => (
                            <p key={paragraph} className="text-sm leading-7 text-muted-foreground md:text-base">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        <Button asChild className="mt-7 rounded-full bg-[hsl(43,100%,29%)] px-6 text-white hover:bg-[hsl(43,100%,25%)]">
                          <Link href={event.href}>{event.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>),
    why: (<section id="why-sfi" className="bg-[#f8f8f5] py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(43,100%,29%)]">
                  03 / Why the Sikh Family Initiative?
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                  Because family connection deserves time.
                </h2>
              </div>
              <div className="space-y-5 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                <p>
                  Family life is busy. Between school and work, it is not always easy to find time to explore Sikhi together or build friendships with other Sikh families. SFI creates space for those connections.
                </p>
                <p>
                  Our events offer a welcoming setting where children can feel part of a wider Sikh community and adults can share the experience alongside them. Grandparents are part of that picture too: this is about the whole family, not just activities for the children.
                </p>
                <p>
                  You do not need to be an expert in Sikhi to belong here. Whether Sikhi is already central to your family life or you are finding ways to bring it closer, you are welcome to take part.
                </p>
              </div>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              <div className="rounded-[2rem] bg-[#101b2d] p-8 text-white md:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Real families. Shared experiences.
                </p>
                <h3 className="mt-3 text-3xl font-bold">Summer 2026</h3>
                <p className="mt-4 leading-7 text-white/75">
                  Our summer 2026 Sikh Family Retreat at Hilston Park was fully booked, with additional families staying nearby so they could take part.
                </p>
              </div>
              <div className="rounded-[2rem] border border-border bg-white p-8 md:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">
                  Family Extravaganza
                </p>
                <h3 className="mt-3 text-3xl font-bold">100+ guests</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Our August Family Extravaganza welcomed more than 100 guests, including families experiencing a Sikh family event for the first time.
                </p>
              </div>
            </div>
            <p className="mt-7 max-w-4xl text-base leading-7 text-muted-foreground md:text-lg">
              These gatherings are about more than the programme. They create opportunities for families to feel comfortable in sangat and form connections that can continue beyond the event.
            </p>
          </div>
        </section>),
    faq: (<section className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(43,100%,29%)]">
                First time at SFI?
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Come as you are. We will help you feel at home.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {content.faqs.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-border p-6 md:p-7">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(43,100%,29%)]" />
                    <div>
                      <h3 className="font-semibold text-foreground">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>),
    community: (<section className="bg-[#101b2d] py-16 text-white md:py-24">
          <div className="container mx-auto max-w-6xl px-6 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-2">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 md:p-10">
                <MessageCircle className="h-7 w-7 text-amber-300" />
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Stay connected
                </p>
                <h2 className="mt-3 text-3xl font-bold">Be part of the SFI community.</h2>
                <p className="mt-4 leading-7 text-white/75">
                  You do not have to wait until the next retreat to stay in touch. Join our WhatsApp community for upcoming event announcements and booking updates. It is a simple way to stay connected with what is happening across SFI.
                </p>
                <Button asChild className="mt-7 rounded-full bg-amber-400 px-6 text-slate-950 hover:bg-amber-300">
                  <Link href="/contact">Join the community <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </article>

              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 md:p-10">
                <HeartHandshake className="h-7 w-7 text-amber-300" />
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Get involved
                </p>
                <h2 className="mt-3 text-3xl font-bold">Share your time through seva.</h2>
                <p className="mt-4 leading-7 text-white/75">
                  Our events are supported by sevadaars who help create a welcoming experience for families. Interested in helping at an event or sharing a useful skill? We would love to hear from you.
                </p>
                <p className="mt-4 leading-7 text-white/75">
                  Organisations and businesses interested in supporting SFI are also welcome to get in touch.
                </p>
                <Button asChild variant="outline" className="mt-7 rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/contact">Offer seva <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </article>
            </div>
          </div>
        </section>),
  }
  return (
    <>
      <Navbar donationHref="https://www.nowdonate.com/checkout/nyb88cq73k85q0l9q3z6" />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-[#101b2d] text-white">
          <img
            src={content.hero.image}
            alt={content.hero.imageAlt}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101b2d] via-[#101b2d]/82 to-[#101b2d]/35" />
          <div className="relative z-10 container mx-auto max-w-6xl px-6 pb-20 pt-36 lg:px-12 lg:pb-28 lg:pt-44">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              {content.hero.eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {content.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-medium leading-relaxed text-white md:text-2xl">
              {content.hero.subtitle}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              {content.hero.paragraphs[0]}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              {content.hero.paragraphs[1]}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-amber-400 px-7 text-slate-950 hover:bg-amber-300">
                <Link href="#upcoming">Explore upcoming events <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white">
                <Link href="#why-sfi">Why SFI?</Link>
              </Button>
            </div>
          </div>
        </section>

        {content.sectionOrder.filter(key => !content.hiddenSections.includes(key)).map(key => <div key={key}>{sections[key]}</div>)}
      </main>
      <FooterSection donationHref="https://www.nowdonate.com/checkout/nyb88cq73k85q0l9q3z6" />
    </>
  )
}

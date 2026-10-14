import Link from 'next/link'
import { ArrowRight, CalendarDays, HeartHandshake, BookOpen, Trees, UsersRound, Mail } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { FooterSection } from '@/components/footer-section'
import { FamilyRetreatFAQ } from '@/components/family-retreat/family-retreat-faq'
import { FamilyRetreatHero } from '@/components/family-retreat/family-retreat-hero'

export const metadata = {
  title: 'Sikh Family Retreat | Sikh Family Initiative | Devanhaar',
  description: 'Explore the New Year Reset, Spring and Summer Sikh Family Retreats and register your family’s interest.',
}

const retreats = [
  { title: 'New Year Reset', date: '31 December 2026 – 3 January 2027', href: '/sfr/register?event=new-year-reset', label: 'Next retreat', description: 'Begin the year with intention in saadh sangat, with time for Gurbani, reflection and practical ways to bring Sikhi into family life.' },
  { title: 'Spring Retreat', date: '1–4 April 2027', href: '/sfr/register?event=spring', label: 'Spring 2027', description: 'Make room for family time, shared learning and outdoor skill building, with a focus on Gurbani relating to nature and wildlife.' },
  { title: 'Summer Retreat', date: '22–25 July 2027', href: '/sfr/register?event=summer', label: 'Summer 2027', description: 'Spend a few days in sangat with shared family experiences, outdoor adventures and camping skills.' },
]
const experiences = [
  { icon: BookOpen, title: 'Explore Sikhi together', text: 'Time with Gurbani, reflective discussions and shared learning that families can bring into everyday life.' },
  { icon: UsersRound, title: 'For the whole family', text: 'Young children, adults and grandparents are all part of the experience. Individual activities may have age or safety requirements.' },
  { icon: Trees, title: 'Shared experiences', text: 'Enjoy activities together and choose a pace that suits your family. You are welcome to take a break when needed.' },
  { icon: HeartHandshake, title: 'Feel part of the sangat', text: 'Come even if you do not know anyone. Meet other Sikh families in a welcoming, non-judgemental environment.' },
]

export default function SikhFamilyRetreatPage() {
  return <>
    <Navbar />
    <main className="min-h-screen">
      <FamilyRetreatHero />
      <nav aria-label="Retreat page sections" className="border-b border-border bg-white">
        <div className="container mx-auto flex max-w-6xl flex-wrap items-center gap-x-7 gap-y-2 px-6 py-5 text-sm font-medium lg:px-12">
          <a href="#about" className="text-muted-foreground hover:text-foreground">About the retreat</a>
          <a href="#retreats" className="text-muted-foreground hover:text-foreground">Upcoming retreats</a>
          <a href="#faqs" className="text-muted-foreground hover:text-foreground">FAQs</a>
          <a href="#retreat-contact" className="text-muted-foreground hover:text-foreground">Contact the team</a>
        </div>
      </nav>
      <section id="about" className="scroll-mt-24 py-14 md:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">A retreat for the whole family</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">A little time away.<br />A closer connection.</h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>The Sikh Family Retreat is an opportunity to step away from everyday routines and spend meaningful time together, with Sikhi at the heart of the experience.</p>
              <p>Through time in sangat and shared activities, families can reconnect with Guru Sahib, explore ways to bring Sikhi into everyday life and form friendships that continue beyond the retreat.</p>
              <p>Families at all stages of their Sikhi journey are welcome. You do not need to know anyone or have attended a retreat before.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {experiences.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-border bg-[#faf8f3] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-[hsl(43,100%,29%)]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>)}
          </div>
        </div>
      </section>
      <section id="interest-form" className="scroll-mt-24 border-t border-border bg-[#f7f5ef] py-14 md:py-20">
        <div id="retreats" className="container mx-auto max-w-6xl scroll-mt-28 px-6 lg:px-12">
          <div className="mb-8 max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Something to look forward to, together</p><h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Choose your next family retreat</h2><p className="mt-4 text-base leading-relaxed text-muted-foreground">Select a retreat to register your family’s interest. We will keep you updated as booking information is released.</p></div>
          <div className="grid gap-5 lg:grid-cols-3">
            {retreats.map((retreat, index) => <article key={retreat.title} className={`flex flex-col rounded-3xl border p-6 md:p-7 ${index === 0 ? 'border-[#101b2d] bg-[#101b2d] text-white shadow-lg' : 'border-border bg-white text-foreground'}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${index === 0 ? 'text-amber-300' : 'text-[hsl(43,100%,29%)]'}`}>{retreat.label}</p>
              <h3 className="mt-4 text-2xl font-bold tracking-tight">{retreat.title}</h3>
              <p className={`mt-4 flex items-start gap-2 text-sm font-semibold leading-relaxed ${index === 0 ? 'text-white/90' : 'text-foreground'}`}><CalendarDays aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${index === 0 ? 'text-amber-300' : 'text-[hsl(43,100%,29%)]'}`} />{retreat.date}</p>
              <p className={`mb-7 mt-4 flex-1 text-sm leading-relaxed ${index === 0 ? 'text-white/75' : 'text-muted-foreground'}`}>{retreat.description}</p>
              <Link href={retreat.href} aria-label={`Register interest for ${retreat.title}`} className={`flex min-h-12 items-center justify-between gap-3 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 ${index === 0 ? 'bg-amber-400 text-[#101b2d] hover:bg-amber-300' : 'bg-[#101b2d] text-white hover:bg-[#253651]'}`}>Register interest<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </article>)}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">Registering interest does not confirm a place or take payment.</p>
        </div>
      </section>
      <FamilyRetreatFAQ />
      <section id="retreat-contact" className="scroll-mt-24 bg-[#101b2d] py-14 text-white md:py-16">
        <div className="container mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:gap-16 lg:px-12">
          <div><Mail aria-hidden="true" className="h-6 w-6 text-amber-300" /><h2 className="mt-4 text-2xl font-bold md:text-3xl">Let’s help you feel at home.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75">Questions about accommodation, accessibility or what your family needs to feel comfortable? Speak to the Sikh Family Initiative team before registering interest.</p><a href="mailto:TheSikhFI@devanhaar.com" className="mt-6 inline-flex min-h-11 items-center gap-2 break-all text-sm font-semibold text-amber-300 underline underline-offset-4 hover:text-amber-200">TheSikhFI@devanhaar.com<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></a></div>
          <div className="border-t border-white/15 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">Part of something bigger</p><h2 className="mt-4 text-2xl font-bold md:text-3xl">Sikh Family Initiative</h2><p className="mt-4 text-sm leading-relaxed text-white/75">Retreats, Sikh Family Extravaganza and Wedding Fair bring families together throughout the year.</p><Link href="/sfi" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">View all family projects<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </main>
    <FooterSection hideContact />
  </>
}

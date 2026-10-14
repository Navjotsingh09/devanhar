import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { FooterSection } from '@/components/footer-section'
import { FamilyRetreatInterestForm } from '@/components/family-retreat/family-retreat-interest-form'

export const metadata = {
  title: 'Register interest | Sikh Family Retreat | Devanhaar',
  description: 'Register your family’s interest in an upcoming Sikh Family Retreat.',
}

const retreats = {
  'new-year-reset': { title: 'New Year Reset', date: '31 December 2026 – 3 January 2027', interestFor: 'SFR – New Year Reset · 31 December 2026 – 3 January 2027' },
  spring: { title: 'Spring Retreat', date: '1–4 April 2027', interestFor: 'SFR – Spring Retreat · 1–4 April 2027' },
  summer: { title: 'Summer Retreat', date: '22–25 July 2027', interestFor: 'SFR – Summer Retreat · 22–25 July 2027' },
  'spring-summer': { title: 'Spring and Summer Retreats', date: 'Spring: 1–4 April · Summer: 22–25 July 2027', interestFor: 'Spring and Summer 2027' },
}

export default async function FamilyRetreatRegisterPage({ searchParams }: { searchParams: Promise<{ event?: string | string[] }> }) {
  const params = await searchParams
  const event = typeof params.event === 'string' && Object.hasOwn(retreats, params.event) ? params.event as keyof typeof retreats : 'spring-summer'
  const retreat = retreats[event]
  return <>
    <Navbar />
    <main className="min-h-screen bg-secondary/20 pb-16 pt-28 md:pb-24 md:pt-32">
      <div className="container mx-auto max-w-3xl px-6 lg:px-12">
        <Link href="/sfi" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Sikh Family Initiative</Link>
        <header className="mb-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Sikh Family Retreat · Register interest</p>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{retreat.title}</h1>
          <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-[hsl(43,100%,29%)]"><CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{retreat.date}</p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">Leave the lead contact details for your family group and we will keep you updated as booking information for this retreat is released.</p>
        </header>
        <FamilyRetreatInterestForm
          key={event}
          interestFor={retreat.interestFor}
          sourcePage={`Sikh Family Retreat · ${retreat.title} · Direct interest form`}
          successMessage={`Thank you. Your interest in ${retreat.title} has been registered. The Sikh Family Initiative team can contact you with the next booking details.`}
        />
        <p className="mt-6 text-center text-sm text-muted-foreground"><Link href="/sfr#faqs" className="font-medium underline underline-offset-4 hover:text-foreground">Read the retreat FAQs</Link></p>
      </div>
    </main>
    <FooterSection hideContact />
  </>
}

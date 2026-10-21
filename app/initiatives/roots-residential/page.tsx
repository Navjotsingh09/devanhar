import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { FooterSection } from '@/components/footer-section'
import { RootsHero } from '@/components/roots/roots-hero'
import { PublicCampForm } from '@/components/roots/public-camp-form'
import { rootsFAQs } from '@/components/roots/roots-shared-data'

export const metadata = {
 title: 'Roots Residential | Devanhaar',
 description: 'Roots Residential camp registration for young Sikhs. Register your child, request transport and share dietary, medical and emergency contact information.',
 alternates: { canonical: 'https://devanhaar.com/rr' },
}
export const dynamic = 'force-dynamic'
export default function RootsResidentialPage() {
 return <><Navbar /><main className="min-h-screen">
  <RootsHero />
  <section id="booking-form" className="scroll-mt-28 border-t border-border bg-secondary/20 py-10 md:py-14">
   <div className="mx-auto max-w-5xl px-5 lg:px-8">
    <div className="mb-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
     <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-[hsl(43,100%,29%)]">Camp registration</p><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Register your child</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">One form per child, completed by a parent or guardian. The Roots team will confirm availability and arrange payment after reviewing your application.</p></div>
     <div className="rounded-xl border border-border bg-background px-5 py-4 text-sm"><p className="font-semibold">Hilston Park, Wales</p><p className="mt-1 text-muted-foreground">£75 per participant · Payment arranged by Roots</p></div>
    </div>
    <div className="rounded-2xl border border-border bg-background p-5 md:p-8"><PublicCampForm /></div>
   </div>
  </section>
  <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
   <details className="group rounded-xl border border-border"><summary className="cursor-pointer px-5 py-4 font-medium">About Roots & frequently asked questions</summary><div className="space-y-6 border-t border-border p-5 text-sm leading-relaxed"><p>Adventure, friendship and Sikh identity for young people aged 13–16. Roots brings together outdoor activities, personal development and Sikh values, with separate residentials for girls and boys.</p><div className="grid gap-6 md:grid-cols-2">{rootsFAQs.map(item=><div key={item.question}><h2 className="font-semibold">{item.question}</h2><p className="mt-2 text-muted-foreground">{item.answer}</p></div>)}</div><p>Submitting a registration does not automatically confirm a place. The Roots team will contact you about availability, camp arrangements and payment.</p><Link href="https://www.instagram.com/rootsprojectuk/" target="_blank" rel="noopener noreferrer" className="inline-block underline underline-offset-4">See Roots on Instagram ↗</Link></div></details>
   <p className="mt-6 text-sm text-muted-foreground">Questions? <a href="mailto:Roots@Devanhaar.com" className="font-medium text-foreground underline underline-offset-4">Roots@Devanhaar.com</a></p>
  </section>
 </main><FooterSection hideContact /></>
}


import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {registerCopyComponent} from '@/lib/cms/copy-node'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, ArrowLeft } from 'lucide-react'

export async function FamilyRetreatHero({ cmsCopy = {} }: {cmsCopy?:PageCopy} = {}) {


  return applyPageCopy((<section className="relative isolate overflow-hidden bg-[#101b2d] text-white">
    <Image src="/initiatives/sikh-family-retreat-top.png" alt="Children enjoying an outdoor activity at a Sikh Family Retreat" fill priority sizes="100vw" className="object-cover object-center" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#101b2d]/95 via-[#101b2d]/65 to-[#101b2d]/35" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#101b2d]/80 via-transparent to-[#101b2d]/30" />
    <div className="relative container mx-auto max-w-6xl px-6 pb-14 pt-32 lg:px-12 lg:pb-20 lg:pt-40">
      <Link href="/sfi" className="mb-9 inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Sikh Family Initiative</Link>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-14">
        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">Time together. Rooted in Sikhi.</p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">Sikh Family<br /><span className="text-amber-300">Retreat</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">Meaningful time with your family. A deeper connection with your sangat.</p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">Step away from everyday routines and explore Sikhi together, from young children to grandparents.</p>
          <div className="mt-8 flex flex-wrap gap-2">{['All generations welcome', 'Sangat & shared learning', 'Time to reconnect'].map(text => <span key={text} className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs text-white/85 backdrop-blur-sm">{text}</span>)}</div>
        </div>
        <div className="rounded-3xl border border-white/20 bg-[#101b2d]/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">Sikh Family Retreat · Register interest</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">New Year Reset</h2>
          <p className="mt-4 flex items-start gap-2 text-sm font-semibold leading-relaxed text-white"><CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />31 December 2026 – 3 January 2027</p>
          <p className="mt-5 text-sm leading-relaxed text-white/75">Begin the year with intention, in saadh sangat. Make space for reflection and reconnect with Guru Sahib as a family.</p>
          <Link href="/sfr/register?event=new-year-reset" className="mt-6 flex min-h-12 items-center justify-between gap-3 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-[#101b2d] transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">Register interest<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          <p className="mt-3 text-xs leading-relaxed text-white/60">Interest only · No payment or confirmed booking</p>
          <a href="#retreats" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-white/80 underline underline-offset-4 hover:text-white">See Spring & Summer retreats<ArrowRight aria-hidden="true" className="h-3 w-3" /></a>
        </div>
      </div>
    </div>
  </section>), cmsCopy)
}

registerCopyComponent(FamilyRetreatHero)

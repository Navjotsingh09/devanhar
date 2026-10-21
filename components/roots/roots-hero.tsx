import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
export function RootsHero() {
 return <section className="relative isolate overflow-hidden bg-[#17202e] text-white">
  <img src="/initiatives/roots-gallery-11.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" style={{objectPosition:'center 35%'}} />
  <div className="absolute inset-0 -z-10 bg-black/65" />
  <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-5 pb-10 pt-28 sm:flex-row sm:items-center sm:justify-between md:pb-12 md:pt-32 lg:px-8">
   <div><img src="/initiatives/roots-logo.jpg" alt="Roots Residential — Adventure, Friendship, Identity" className="h-auto w-52 max-w-full object-contain md:w-64" style={{mixBlendMode:'screen'}} /><p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">Adventure, friendship and Sikh identity for young people aged 13–16.</p></div>
   <Link href="#booking-form" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">Register your child <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
  </div>
 </section>
}

"use client"

import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RootsHero() {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/initiatives/roots-top.jpg"
          alt="Roots Residential"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-6 lg:px-12 pt-28 md:pt-32 pb-14 md:pb-20 min-h-[84vh] flex items-end">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-end w-full">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-200 backdrop-blur-md mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Roots Residential
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] text-balance">
              A five-day residential built for adventure, identity and belonging.
            </h1>

            <p className="mt-6 max-w-2xl text-base md:text-xl text-white/82 leading-relaxed">
              Young Sikhs aged 12–16 will spend five days at Hilston Park learning, exploring and
              growing together through outdoor challenge, team experiences and Sikh values.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/85">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 backdrop-blur-md">
                <MapPin className="h-4 w-4 text-amber-200" />
                Hilston Park
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-amber-200" />
                Ages 12–16
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-200" />
                Bookings now open
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/15 bg-white/12 p-6 md:p-7 text-white shadow-2xl backdrop-blur-md">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-200 mb-3">
                Start here
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold mb-3">Book your camper&apos;s place</h2>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                Places are limited. Complete the form and a sevadaar will follow up to confirm
                availability, discuss cost and explain payment.
              </p>
              <div className="mt-6">
                <Button
                  onClick={scrollToForm}
                  className="rounded-full px-6 bg-amber-400 text-slate-950 hover:bg-amber-300"
                >
                  Complete the booking form
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-950/35 p-6 md:p-7 text-white shadow-xl backdrop-blur-md">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/65 mb-3">
                Need help?
              </p>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Speak to a sevadaar</h3>
              <p className="text-sm md:text-base text-white/75 leading-relaxed">
                If you have questions about the programme, accommodation, or whether Roots is
                right for your camper, get in touch and the team will help.
              </p>
              <div className="mt-6">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold bg-white text-slate-950 hover:bg-white/90 transition-colors"
                >
                  Get in touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

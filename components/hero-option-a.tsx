"use client"

import { ArrowRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSiteImages } from "@/hooks/use-site-images"

const slides = [
  { subtitle: "Empowering Communities" },
  { subtitle: "Building Together" },
  { subtitle: "Creating Change" },
]

export function HeroOptionA() {
  const [cur, setCur] = useState(0)
  const [ready, setReady] = useState(false)
  const { images: hi, loading } = useSiteImages("hero")
  const imgs = [
    hi.find(i => i.category === "slide-1")?.url || "/hero-community.jpg",
    hi.find(i => i.category === "slide-2")?.url || "/community-event.jpg",
    hi.find(i => i.category === "slide-3")?.url || "/foundation.jpg",
  ]

  useEffect(() => {
    setReady(true)
    const t = setInterval(() => setCur(p => (p + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {!loading && imgs.map((src, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[2s]" style={{ opacity: i === cur ? 1 : 0 }}>
          <img src={src} alt={slides[i]?.subtitle} className="w-full h-full object-cover transition-transform duration-[10s]" style={{ transform: i === cur ? "scale(1.05)" : "scale(1)" }} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 z-20 px-8 lg:px-16 pb-16 pt-32">
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.3s" }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] tracking-[0.3em] uppercase text-white/60 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {slides[cur].subtitle}
          </span>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3" style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.8s" }}>
          <Link href="/initiatives/singhs-camp" className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 transition-all hover:bg-white/10 hover:border-amber-400/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
              <CalendarDays className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Singhs Camp UK</p>
              <p className="text-[11px] text-white/50">Applications open Monday 20th April</p>
            </div>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-400" />
          </Link>
        </div>
        <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-white" style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.5s" }}>
          Develop. Elevate.{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Empower.</span>{" "}
          Connect.
        </h2>
        <p className="mt-4 max-w-lg text-white/50 text-sm lg:text-base leading-relaxed" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease 0.7s" }}>
          A UK-based charity empowering generations through Sikh values, knowledge, and spiritual growth.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease 1s" }}>
          <Link href="/about">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-sm font-semibold">
              Learn More <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/#contact">
            <Button variant="ghost" className="rounded-full px-8 py-6 text-sm font-semibold border border-white/15 text-white hover:bg-white/10 hover:text-white">
              Get Involved
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCur(i)} className="relative h-[3px] transition-all duration-500" style={{ width: i === cur ? 48 : 16 }}>
                <div className="absolute inset-0 rounded-full bg-white/20" />
                {i === cur && <div className="absolute inset-0 rounded-full bg-amber-400 origin-left" style={{ animation: "heroProgress 6s linear forwards" }} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSiteImages } from "@/hooks/use-site-images"

const slides = [
  { subtitle: "Empowering Communities" },
  { subtitle: "Building Together" },
  { subtitle: "Creating Change" },
]

export function HeroOptionB() {
  const [cur, setCur] = useState(0)
  const [ready, setReady] = useState(false)
  const { images: hi } = useSiteImages("hero")
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
    <section className="relative w-full h-screen overflow-hidden flex">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
        <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur text-white/70 text-xs tracking-widest uppercase font-semibold">Option B &mdash; Left Sidebar</span>
      </div>
      {/* Right side: full image */}
      <div className="absolute inset-0">
        {imgs.map((src, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-[2s]" style={{ opacity: i === cur ? 1 : 0 }}>
            <img src={src} alt={slides[i]?.subtitle} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {/* Left sidebar panel */}
      <div className="relative z-20 w-full md:w-[45%] h-full flex flex-col justify-center px-8 lg:px-16 bg-gradient-to-r from-black/90 via-black/70 to-transparent">
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateX(0)" : "translateX(-30px)", transition: "all 0.8s ease 0.3s" }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] tracking-[0.3em] uppercase text-white/60 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {slides[cur].subtitle}
          </span>
        </div>
        <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-white" style={{ opacity: ready ? 1 : 0, transform: ready ? "translateX(0)" : "translateX(-30px)", transition: "all 0.8s ease 0.5s" }}>
          Develop. Elevate.
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Empower.</span>{" "}
          Connect.
        </h2>
        <p className="mt-5 max-w-md text-white/50 text-sm lg:text-base leading-relaxed" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease 0.7s" }}>
          A UK-based charity empowering generations through Sikh values, knowledge, and spiritual growth.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease 0.9s" }}>
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
        </div>
        <div className="mt-10 flex items-center gap-3" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease 1.1s" }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCur(i)} className="relative h-[3px] transition-all duration-500" style={{ width: i === cur ? 48 : 16 }}>
              <div className="absolute inset-0 rounded-full bg-white/20" />
              {i === cur && <div className="absolute inset-0 rounded-full bg-amber-400 origin-left" style={{ animation: "heroProgress 6s linear forwards" }} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { OpenRegistrationNotices } from "@/components/open-registration-notices"
import type { OpenOpportunity } from "@/lib/registration-window-status"

const slides = [
  { subtitle: "Empowering Communities" },
  { subtitle: "Building Together" },
  { subtitle: "Creating Change" },
]

const imgs = [
  "/hero-slide-1.jpg",
  "/hero-slide-2.jpg",
  "/hero-slide-3.jpg",
]

// Tiny blurred previews so the hero paints instantly while full images load
const BLUR_PLACEHOLDERS = [
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAZEAEAAgMAAAAAAAAAAAAAAAAAAwQSFEL/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABYRAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEQMRAD8AjFq3txZdAF0rSF//2Q==",
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAZEAACAwEAAAAAAAAAAAAAAAAAAwEEEUH/xAAVAQEBAAAAAAAAAAAAAAAAAAABA//EABcRAQADAAAAAAAAAAAAAAAAAAABETH/2gAMAwEAAhEDEQA/ALVuw9CZQqd4ACVGMf/Z",
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/wAALCAAIAAgBASIA/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EABoQAAICAwAAAAAAAAAAAAAAAAECAwQABiH/2gAIAQEAAD8ANxbi1OgqxcBGf//Z",
]

export function HeroOptionA({ opportunities = [] }: { opportunities?: OpenOpportunity[] }) {
  const [cur, setCur] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    const t = setInterval(() => setCur(p => (p + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden">
      {imgs.map((src, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1500ms]" style={{ opacity: i === cur ? 1 : 0 }}>
          <Image
            src={src}
            alt={slides[i]?.subtitle || ""}
            fill
            sizes="100vw"
            priority
            quality={78}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDERS[i]}
            className="object-cover transition-transform duration-[10s]"
            style={{ transform: i === cur ? "scale(1.05)" : "scale(1)" }}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent z-10" />
      <div className="relative z-20 flex min-h-[100svh] flex-col justify-end px-6 lg:px-16 pb-12 pt-32">
        <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.3s" }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] tracking-[0.3em] uppercase text-white/60 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {slides[cur].subtitle}
          </span>
        </div>
        <OpenRegistrationNotices initialOpportunities={opportunities} />
        <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-white" style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.5s" }}>
          Develop. Elevate.{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Empower.</span>{" "}
          Connect.
        </h2>
        <p className="mt-4 max-w-lg text-white/50 text-sm lg:text-base leading-relaxed">
          A UK-based charity empowering generations through Sikh values, knowledge, and spiritual growth.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease 1s" }}>
          <Link href="/about" aria-label="Learn more about Devanhaar">
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
              <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => setCur(i)} className="relative h-[3px] transition-all duration-500" style={{ width: i === cur ? 48 : 16 }}>
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


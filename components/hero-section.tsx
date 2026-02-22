"use client"

import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

const slides = [
  {
    image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=1920&q=80",
    subtitle: "Empowering Communities",
  },
  {
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80",
    subtitle: "Building Together",
  },
  {
    image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=1920&q=80",
    subtitle: "Creating Change",
  },
]
export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setLoaded(true)
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-black">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1.5s] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.subtitle}
            fill
            className="object-cover scale-105"
            style={{
              transform: i === current ? "scale(1.05)" : "scale(1.12)",
              transition: "transform 8s ease-out",
            }}
            unoptimized
            priority={i === 0}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <div
          className="mb-8 overflow-hidden"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
          }}
        >
          <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-white/70">
            {slides[current].subtitle}
          </span>
        </div>

        <div className="overflow-hidden">
          <h1
            className="text-[clamp(2.5rem,8vw,8rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white max-w-5xl"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(60px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
            }}
          >
            Create. Develop.
            <br />
            <span className="text-primary">Empower.</span>
          </h1>
        </div>

        <p
          className="mt-8 max-w-xl text-base sm:text-lg text-white/60 leading-relaxed font-light"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s",
          }}
        >
          A Birmingham-based charity empowering generations through
          Sikh values, knowledge, and spiritual growth.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s",
          }}
        >
          <Link href="/#contact">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-sm font-semibold shadow-2xl shadow-white/10">
              Get Involved
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" className="rounded-full px-8 py-6 text-sm font-semibold border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
              Learn More
            </Button>
          </Link>
        </div>

        <div
          className="mt-16 flex items-center gap-3"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.8s ease 1.2s",
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group relative h-[3px] transition-all duration-500"
              style={{ width: i === current ? 48 : 16 }}
            >
              <div className="absolute inset-0 rounded-full bg-white/20" />
              {i === current && (
                <div
                  className="absolute inset-0 rounded-full bg-white origin-left"
                  style={{ animation: "heroProgress 6s linear forwards" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 1s ease 1.5s",
        }}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
      </div>
    </section>
  )
}

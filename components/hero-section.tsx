"use client"

import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

const slides = [
  {
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    orbs: [
      { color: "bg-amber-500/20", size: "w-[500px] h-[500px]", pos: "top-[-10%] left-[-5%]", blur: "blur-[120px]" },
      { color: "bg-blue-600/15", size: "w-[600px] h-[600px]", pos: "bottom-[-20%] right-[-10%]", blur: "blur-[150px]" },
      { color: "bg-amber-400/10", size: "w-[300px] h-[300px]", pos: "top-[40%] right-[20%]", blur: "blur-[100px]" },
    ],
    subtitle: "Empowering Communities",
  },
  {
    gradient: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
    orbs: [
      { color: "bg-amber-400/25", size: "w-[550px] h-[550px]", pos: "top-[10%] right-[-5%]", blur: "blur-[130px]" },
      { color: "bg-indigo-500/20", size: "w-[400px] h-[400px]", pos: "bottom-[10%] left-[-5%]", blur: "blur-[120px]" },
      { color: "bg-orange-500/10", size: "w-[350px] h-[350px]", pos: "top-[60%] left-[30%]", blur: "blur-[100px]" },
    ],
    subtitle: "Building Together",
  },
  {
    gradient: "from-[#141e30] via-[#1a1a3e] to-[#243b55]",
    orbs: [
      { color: "bg-yellow-500/20", size: "w-[450px] h-[450px]", pos: "bottom-[-10%] left-[10%]", blur: "blur-[140px]" },
      { color: "bg-blue-500/20", size: "w-[500px] h-[500px]", pos: "top-[-5%] right-[5%]", blur: "blur-[120px]" },
      { color: "bg-amber-300/15", size: "w-[300px] h-[300px]", pos: "top-[30%] left-[-10%]", blur: "blur-[110px]" },
    ],
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
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-[2s] ease-in-out`}
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {slide.orbs.map((orb, j) => (
            <div
              key={j}
              className={`absolute rounded-full ${orb.color} ${orb.size} ${orb.pos} ${orb.blur} transition-transform duration-[8s] ease-in-out`}
              style={{
                transform: i === current ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(15deg)",
                animation: i === current ? `heroFloat${j} ${12 + j * 4}s ease-in-out infinite` : "none",
              }}
            />
          ))}
        </div>
      ))}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[15%] left-[8%] w-64 h-64 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm rotate-12"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 2s ease 0.5s", animation: "heroFloat0 20s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-48 h-48 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm -rotate-6"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 2s ease 1s", animation: "heroFloat1 16s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-[50%] right-[25%] w-32 h-32 rounded-xl border border-amber-400/[0.08] bg-amber-400/[0.02] backdrop-blur-sm rotate-45"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 2s ease 1.5s", animation: "heroFloat2 24s ease-in-out infinite" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <div
          className="mb-8 overflow-hidden"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
          }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] backdrop-blur-md text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {slides[current].subtitle}
          </span>
        </div>

        <div className="overflow-hidden pb-4">
          <h1
            className="text-[clamp(2.5rem,8vw,8rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white max-w-5xl"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(60px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
            }}
          >
            Develop. Empower.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Elevate.</span>{" "}
            Connect.
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
          A UK-based charity empowering generations through
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
          <Link href="/about">
            <Button variant="ghost" className="bg-white text-black hover:bg-white/90 hover:text-black rounded-full px-8 py-6 text-sm font-semibold shadow-2xl shadow-white/10 backdrop-blur-sm">
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/#contact">
            <Button variant="ghost" className="rounded-full px-8 py-6 text-sm font-semibold border border-white/[0.15] text-white hover:bg-white/[0.08] hover:text-white backdrop-blur-md">
              Get Involved
            </Button>
          </Link>
        </div>

        <div
          className="mt-16 flex items-center gap-3"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 1.2s" }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group relative h-[3px] transition-all duration-500"
              style={{ width: i === current ? 48 : 16 }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <div className="absolute inset-0 rounded-full bg-white/20" />
              {i === current && (
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 origin-left"
                  style={{ animation: "heroProgress 6s linear forwards" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s ease 1.5s" }}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
      </div>
    </section>
  )
}

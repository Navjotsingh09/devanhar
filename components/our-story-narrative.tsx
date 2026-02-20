"use client"

import { useRef, useEffect, useState, useCallback } from "react"

const milestones = [
  {
    year: "2018",
    theme: "FOUNDATION",
    headline: "Devanhaar Established",
    description:
      "Projects in planning and development began. Kids Camp launched as the first project — a 5-day full-day programme for Sikh youth to educate, connect, and enjoy.",
    accent: true,
  },
  {
    year: "2019",
    theme: "EDUCATION",
    headline: "Youth Gurmat School",
    description:
      "Educational classes for children aged 6-18, focusing on Punjabi language, Sikh history, and social skills.",
    accent: false,
  },
  {
    year: "2020",
    theme: "COMMUNITY",
    headline: "Singhs Camp UK",
    description:
      "The first Punjabi-Sikh residential creating a non-judgemental space for people of all backgrounds to come together.",
    accent: false,
  },
  {
    year: "2021",
    theme: "EXPANSION",
    headline: "University Projects",
    description:
      "Collaboration with over 20 UK universities and Sikh societies during the first academic year.",
    accent: false,
  },
  {
    year: "2022",
    theme: "INCLUSION",
    headline: "Kaurs Camp UK",
    description:
      "The first residential space creating sisterhood and opportunities for like-minded women. Weekly Punjabi Male Spaces launched across four UK cities.",
    accent: true,
  },
  {
    year: "2023",
    theme: "SUSTAINABILITY",
    headline: "Sikhi Vidyala & Martial Arts",
    description:
      "A six-month full-time programme training Sikh teachers to sustainably pass on knowledge and wisdom. Self-defence, mental strength, and discipline through Muay Thai, Krav Maga, and Brazilian Jiu-Jitsu.",
    accent: false,
  },
  {
    year: "2024",
    theme: "PROFESSIONAL NETWORKS",
    headline: "Sikh Professionals Network",
    description:
      "A platform facilitating meaningful connections among Sikh professionals.",
    accent: false,
  },
  {
    year: "2025",
    theme: "LEADERSHIP",
    headline: "Khalsa Catalyst & Beyond",
    description:
      "A leadership and development platform upskilling the next generation of Sikh visionaries. Singhs Camp extends to Punjab. Kaurs Forum expands to five UK cities.",
    accent: true,
  },
  {
    year: "2026",
    theme: "EUROPE",
    headline: "Singhs Camp Europe",
    description:
      "First Sikh-orientated residential in Holland, connecting Punjabis across Europe.",
    accent: false,
  },
]

export function OurStoryNarrative() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scrollableHeight = containerRef.current.offsetHeight - window.innerHeight
    const scrolled = -rect.top
    const p = Math.max(0, Math.min(1, scrolled / scrollableHeight))
    setProgress(p)
    setActiveIndex(Math.min(milestones.length - 1, Math.floor(p * milestones.length)))
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const totalPanels = milestones.length

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${totalPanels * 60 + 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Top bar: section title + progress */}
        <div className="px-6 lg:px-12 pt-8 pb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
              Our Story
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")} / {String(totalPanels).padStart(2, "0")}
            </span>
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center px-6 lg:px-12">
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${progress * (totalPanels - 1) * (100 / totalPanels)}%)`,
              width: `${totalPanels * 280}%`,
            }}
          >
            {milestones.map((m, i) => {
              const distance = Math.abs(i - activeIndex)
              const isActive = i === activeIndex
              const opacity = isActive ? 1 : distance === 1 ? 0.5 : 0.2
              const scale = isActive ? 1 : 0.95

              return (
                <div
                  key={m.year}
                  className="flex-shrink-0 transition-all duration-500"
                  style={{
                    width: `${100 / totalPanels}%`,
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <div
                    className={`relative rounded-2xl border overflow-hidden h-[60vh] p-8 md:p-10 flex flex-col justify-between ${
                      m.accent
                        ? "bg-[#1a1f2e] border-[#1a1f2e] text-white"
                        : "bg-card border-border/60"
                    }`}
                  >
                    {/* Background year watermark */}
                    <span
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[16rem] font-bold leading-none select-none pointer-events-none ${
                        m.accent ? "text-white/[0.04]" : "text-foreground/[0.03]"
                      }`}
                    >
                      {m.year}
                    </span>

                    {/* Top: theme + year */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[0.65rem] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full ${
                            m.accent
                              ? "bg-white/10 text-white/70"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {m.year}
                        </span>
                        <span
                          className={`text-[0.6rem] tracking-[0.2em] uppercase ${
                            m.accent ? "text-white/40" : "text-muted-foreground/60"
                          }`}
                        >
                          {m.theme}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: headline + description */}
                    <div className="relative z-10">
                      <h3
                        className={`text-2xl md:text-3xl font-bold leading-tight mb-4 ${
                          m.accent ? "text-white" : "text-foreground"
                        }`}
                      >
                        {m.headline}
                      </h3>
                      <p
                        className={`text-sm md:text-base leading-relaxed max-w-md ${
                          m.accent ? "text-white/60" : "text-muted-foreground"
                        }`}
                      >
                        {m.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom: year timeline markers */}
        <div className="px-6 lg:px-12 py-6 flex items-center gap-1">
          {milestones.map((m, i) => (
            <div key={m.year} className="flex items-center gap-1">
              <span
                className={`text-[0.6rem] font-semibold tabular-nums transition-colors duration-300 ${
                  i <= activeIndex ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                {m.year}
              </span>
              {i < milestones.length - 1 && (
                <div className="w-4 md:w-8 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



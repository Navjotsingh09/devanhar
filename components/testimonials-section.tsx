"use client"

import { useState, useRef, useEffect, useCallback } from "react"

const pillars = [
  {
    keyword: "EMPOWER",
    tagline: "Identity, Values & Self-Belief",
    description:
      "We provide confidence to our youth rooted in identity, values, and self-belief. Through immersive camps, workshops, and mentoring programmes, young Sikhs discover who they are, what they stand for, and the strength that comes from walking the path of Sikhi.",
    description2:
      "Empowerment begins with understanding your roots. Our programmes create safe, nurturing environments where participants can ask questions, challenge themselves, and emerge with unshakeable confidence grounded in Gurmat principles.",
  },
  {
    keyword: "BUILD",
    tagline: "Skills, Character & Foundations",
    description:
      "We develop skills, character, and foundations for generational success. From leadership training and public speaking to academic support and professional development, we equip the next generation with practical tools they can carry through every stage of life.",
    description2:
      "Building isn't just about individual growth -- it's about creating the foundations for families and communities to thrive for generations. Our curriculum blends Sikhi values with real-world skills that open doors and create lasting impact.",
  },
  {
    keyword: "ELEVATE",
    tagline: "Ambition, Standards & Impact",
    description:
      "We raise ambition, standards, and impact in every area of life. Whether in education, career, spirituality, or seva, we encourage our community to set higher goals, hold themselves to greater standards, and measure success by the positive change they create.",
    description2:
      "Elevation means refusing to settle. It means looking at where the Panth needs to be and working relentlessly to get there -- raising the bar in how we learn, how we serve, and how we represent Sikhi on the world stage.",
  },
  {
    keyword: "CONNECT",
    tagline: "Community, Mentorship & Growth",
    description:
      "We create lifelong relationships centered in community, mentorship, and shared growth. The bonds formed through our programmes extend far beyond camp week or classroom sessions -- they become the sangat that carries people through life's journey.",
    description2:
      "Connection is the heartbeat of everything we do. From the friendships forged at Singhs Camp and Kaurs Camp to the mentor-mentee relationships built through Khalsa Catalyst, every programme strengthens the web of support that holds our community together.",
  },
]

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const scrollLeft = el.scrollLeft
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 416
    const gap = 32
    const idx = Math.round(scrollLeft / (cardWidth + gap))
    setActiveIndex(Math.min(idx, pillars.length - 1))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollTo = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 416
    const gap = 32
    el.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" })
  }

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#f8f8f8" }}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left column: Quote icon + heading + dots */}
          <div className="lg:col-span-3 flex flex-col justify-between min-h-[24rem]">
            {/* Quote icon */}
            <div>
              <svg
                width="90"
                height="70"
                viewBox="0 0 90 70"
                fill="none"
                className="text-foreground/[0.08] mb-8"
              >
                <path
                  d="M0 42.5C0 22.5 12.5 7.5 37.5 0L40 7.5C25 12.5 18.75 22.5 17.5 32.5H35V70H0V42.5ZM50 42.5C50 22.5 62.5 7.5 87.5 0L90 7.5C75 12.5 68.75 22.5 67.5 32.5H85V70H50V42.5Z"
                  fill="currentColor"
                />
              </svg>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
                Our Mission
              </h2>
              <p className="text-foreground/50 text-base leading-relaxed mt-4 max-w-xs">
                UK-based charity that empowers Sikhs with the knowledge,
                experiences and confidence to grow academically, professionally
                and spiritually.
              </p>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-2 mt-8">
              {pillars.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-2.5 h-2.5 bg-primary"
                      : "w-2 h-2 bg-foreground/20"
                  }`}
                  aria-label={`Go to pillar ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right column: Scrolling cards */}
          <div className="lg:col-span-9 relative">
            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {pillars.map((p, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[26rem] min-h-[28rem] rounded-xl bg-card border border-border/60 px-10 py-10 flex flex-col snap-start group"
                >
                  {/* Quote text */}
                  <div className="flex-1">
                    <p className="text-foreground/80 text-[15px] leading-relaxed">
                      {p.description}
                    </p>
                    <p className="text-foreground/80 text-[15px] leading-relaxed mt-5">
                      {p.description2}
                    </p>
                  </div>

                  {/* Keyword */}
                  <div className="py-6">
                    <span className="text-xl font-semibold tracking-[0.08em] text-foreground/20 uppercase">
                      {p.keyword}
                    </span>
                  </div>

                  {/* Tagline + label */}
                  <div className="border-t border-border/60 pt-5">
                    <p className="text-foreground text-base font-medium">
                      {p.tagline}
                    </p>
                    <p className="text-foreground/40 text-xs tracking-[0.12em] uppercase mt-1.5">
                      DEVANHAAR MISSION
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right fade */}
            <div className="absolute top-0 right-0 bottom-4 w-24 pointer-events-none bg-gradient-to-l from-[#f8f8f8] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

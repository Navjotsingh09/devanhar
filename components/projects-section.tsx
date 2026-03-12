"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, ExternalLink } from "lucide-react"
import NumberFlow from "@number-flow/react"
import Link from "next/link"
import { blogPosts, type Pillar } from "@/lib/blog"

const partners = [
  {
    badge: "Develop",
    name: "Develop",
    location: "UK Wide",
    metricLabel: "Hours of workshops delivered",
    numericValue: 1000,
  },
  {
    badge: "Elevate",
    name: "Elevate",
    location: "UK Wide",
    metricLabel: "Futures Supported",
    numericValue: 20000,
  },
  {
    badge: "Empower",
    name: "Empower",
    location: "UK Wide",
    metricLabel: "Youth Empowered",
    numericValue: 400,
  },
  {
    badge: "Connect",
    name: "Connect",
    location: "UK Wide",
    metricLabel: "Events Annually",
    numericValue: 50,
  },
]

const tabs: ("All Insights" | Pillar)[] = ["All Insights", "Develop", "Elevate", "Empower", "Connect"]

const pillarColors: Record<Pillar, string> = {
  Develop: "bg-blue-50 text-blue-700 border-blue-200",
  Elevate: "bg-purple-50 text-purple-700 border-purple-200",
  Empower: "bg-amber-50 text-amber-700 border-amber-200",
  Connect: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

function RollingNumber({ value, suffix = "+" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      <NumberFlow
        value={visible ? value : 0}
        suffix={suffix}
        transformTiming={{ duration: 1200, easing: "ease-out" }}
        spinTiming={{ duration: 1200, easing: "ease-out" }}
        opacityTiming={{ duration: 350, easing: "ease-out" }}
        trend={1}
        willChange
      />
    </span>
  )
}

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      {/* Key Initiatives */}
      <section id="projects" className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 data-animate className="text-3xl md:text-5xl font-bold text-foreground mb-16">
            Our Key Initiatives
          </h2>

          <div data-animate-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Top pattern area */}
                <div className="relative h-52 bg-muted/30 overflow-hidden border-b border-border">
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fillOpacity='1' fillRule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="absolute top-4 left-5">
                    <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.badge}
                    </span>
                  </div>
                </div>

                {/* Bottom stats */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        {p.metricLabel}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        <RollingNumber value={p.numericValue} />
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {p.location}
                      </p>
                    </div>
                  </div>
                  <div className="pt-5 border-t border-border">
                    <p className="text-3xl md:text-4xl font-bold text-primary">
                      <RollingNumber value={p.numericValue} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights tabbed carousel */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-start justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                Insights
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Charity Number: 1203393</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 mb-10 border-b border-border overflow-x-auto">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  i === activeTab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {i === activeTab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Horizontal scroll cards */}
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div
              className="flex gap-5 overflow-x-auto pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {(activeTab === 0
                ? blogPosts
                : blogPosts.filter((p) => p.pillar === tabs[activeTab])
              ).map((post) => (
                <Link
                  key={post.slug}
                  href={`/insights/${post.slug}`}
                  className="flex-shrink-0 w-64 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-[280px] hover:border-primary/30 transition-colors group"
                >
                  <div>
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold mb-5 uppercase tracking-wider ${pillarColors[post.pillar]}`}>
                      {post.pillar}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t border-border mt-6">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Read article</span>
                    </div>
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {post.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* View all link */}
          <div className="mt-8 text-center">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View all insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

"use client"

import { useState } from "react"
import { ArrowRight, ExternalLink } from "lucide-react"

const partners = [
  {
    badge: "Education Partner",
    name: "Gurmat Academy",
    location: "United Kingdom",
    metric: "500+",
    metricLabel: "Students annually",
    fee: "500+",
  },
  {
    badge: "Community Partner",
    name: "SinghsCamp",
    location: "UK & Europe",
    metric: "1,000+",
    metricLabel: "Annual attendees",
    fee: "1,000+",
  },
]

const tabs = ["All Insights", "Education", "Community", "Leadership"]

const insights = [
  {
    source: "SikhNet",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    logo: "SikhNet",
  },
  {
    source: "Sikh Press",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    logo: "Sikh Press",
  },
  {
    source: "Asian Image",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    logo: "Asian Image",
  },
  {
    source: "Sikh Channel",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    logo: "Sikh Channel",
  },
  {
    source: "Punjab2000",
    description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
    logo: "Punjab2000",
  },
]

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      {/* Launch Partners - mirrors Agridex "Our Launch Partners" */}
      <section id="projects" className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-16">
            Our Key Initiatives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partners.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Top - map/pattern area like Agridex */}
                <div className="relative h-52 bg-muted/30 overflow-hidden border-b border-border">
                  {/* Subtle cross-hatch pattern */}
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
                  <div className="absolute bottom-6 left-6">
                    <span className="text-3xl font-bold italic text-foreground/70 tracking-tight">
                      {p.name}
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
                        {p.metric}
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
                      {p.fee}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights - tabbed carousel mirrors Agridex exactly */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-start justify-between mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Insights
            </h2>
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
              {insights.map((item, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-[280px]"
                >
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[10px] font-bold text-primary mb-5 uppercase tracking-wider">
                      {item.logo}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t border-border mt-6">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Read article</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

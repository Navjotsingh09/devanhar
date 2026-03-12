"use client"

import { ArrowRight } from "lucide-react"
const partners = [
  {
    badge: "Develop",
    name: "Develop",
    location: "UK Wide",
    metric: "1,000+",
    metricLabel: "Hours of workshops delivered",
    fee: "1,000+",
  },
  {
    badge: "Elevate",
    name: "Elevate",
    location: "UK Wide",
    metric: "20,000+",
    metricLabel: "Futures Supported",
    fee: "20,000+",
  },
  {
    badge: "Empower",
    name: "Empower",
    location: "UK Wide",
    metric: "400+",
    metricLabel: "Youth Empowered",
    fee: "400+",
  },
  {
    badge: "Connect",
    name: "Connect",
    location: "UK Wide",
    metric: "50+",
    metricLabel: "Events Annually",
    fee: "50+",
  },
]


export function ProjectsSection() {

  return (
    <>
      {/* Launch Partners - mirrors Agridex "Our Launch Partners" */}
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

    </>
  )
}

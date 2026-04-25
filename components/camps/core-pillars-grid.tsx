import type { CorePillar } from "./camp-shared-data"

interface CorePillarsGridProps {
  pillars: CorePillar[]
  heading?: string
  subheading?: string
}

export function CorePillarsGrid({
  pillars,
  heading = "Our Core Pillars",
  subheading = "Every camp is built on 6 core pillars that are embedded into every part of the experience.",
}: CorePillarsGridProps) {
  return (
    <section className="border-t border-border bg-secondary/30 py-20 md:py-28">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="max-w-3xl mb-12 md:mb-16">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
            What you will experience
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {subheading}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border bg-background p-7 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[hsl(43,100%,29%)]/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[hsl(43,100%,29%)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

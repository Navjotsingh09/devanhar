import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface LandingCta {
  label: string
  description: string
  href?: string
  onClick?: () => void
  ctaLabel: string
  primary?: boolean
}

interface CampLandingHeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  heroImage: string
  ctas: LandingCta[]
}

export function CampLandingHero({
  eyebrow,
  title,
  subtitle,
  heroImage,
  ctas,
}: CampLandingHeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[60vh] min-h-[420px] md:h-[72vh] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <div className="relative z-10 container mx-auto px-6 lg:px-12 h-full flex flex-col justify-end pb-16 md:pb-24 max-w-5xl">
          {eyebrow ? (
            <p className="text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase text-amber-300 mb-4">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-5xl -mt-12 md:-mt-16 relative z-20 pb-16 md:pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          {ctas.map((cta, i) => {
            const button = (
              <Button
                variant={cta.primary ? "secondary" : "default"}
                className="rounded-full px-6"
                onClick={cta.onClick}
              >
                {cta.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
            return (
              <div
                key={cta.href ?? `${cta.label}-${i}`}
                className={`rounded-2xl border p-7 md:p-8 shadow-lg flex flex-col ${
                  cta.primary
                    ? "bg-[hsl(43,100%,29%)] border-[hsl(43,100%,29%)] text-white"
                    : "bg-background border-border text-foreground"
                }`}
              >
                <h3
                  className={`text-xl md:text-2xl font-semibold ${
                    cta.primary ? "text-white" : "text-foreground"
                  }`}
                >
                  {cta.label}
                </h3>
                <p
                  className={`mt-3 text-sm md:text-base leading-relaxed flex-1 ${
                    cta.primary ? "text-white/90" : "text-muted-foreground"
                  }`}
                >
                  {cta.description}
                </p>
                <div className="mt-6">
                  {cta.href ? <Link href={cta.href}>{button}</Link> : button}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

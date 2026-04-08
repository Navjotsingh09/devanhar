import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CTABannerProps {
  heading: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
  variant?: "dark" | "light"
}

export function CTABanner({
  heading,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant = "dark",
}: CTABannerProps) {
  const isDark = variant === "dark"

  return (
    <section
      className={`py-16 md:py-24 ${
        isDark ? "bg-[#1a1f2e] text-white" : "border-t border-border bg-muted/30"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
        <p
          className={`mb-8 text-lg ${
            isDark ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full max-w-sm sm:max-w-none mx-auto">
          <Button
            asChild
            size="lg"
            className={
              isDark
                ? "bg-white text-[#1a1f2e] hover:bg-white/90"
                : undefined
            }
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {secondaryLabel && secondaryHref && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className={
                isDark ? "border-white/20 text-white hover:bg-white/10" : undefined
              }
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

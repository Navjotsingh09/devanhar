"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RootsHero() {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const ctas = [
    {
      label: "Book your place",
      description:
        "Places are limited. We'll be in touch after your form is submitted to discuss availability, costs and payment.",
      onClick: scrollToForm,
      ctaLabel: "Complete the application",
      primary: true,
    },
    {
      label: "Get in touch",
      description:
        "Have a question before booking? Get in touch and the Roots team will be happy to help.",
      href: "/contact",
      ctaLabel: "Get in touch",
      primary: false,
    },
  ]

  return (
    <section className="relative w-full overflow-hidden">
      {/* Main hero image */}
      <div className="relative w-full bg-black">
        <div className="relative h-[58vh] min-h-[420px] w-full overflow-hidden md:h-[64vh] md:min-h-[500px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/initiatives/roots-gallery-11.jpg"
            alt="Roots Residential — Adventure, Friendship, Identity"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-x-0 top-6 z-10 flex justify-center px-6 md:top-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/initiatives/roots-logo.jpg"
              alt="Roots Residential"
              className="w-full max-w-3xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      </div>

      {/* CTA cards */}
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl -mt-10 md:-mt-14 relative z-20 pb-16 md:pb-24">
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

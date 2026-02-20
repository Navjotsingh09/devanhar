import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

interface FAQ {
  question: string
  answer: string
}

interface Testimonial {
  quote: string
  name: string
  role: string
}

interface InitiativePageProps {
  title: string
  tagline: string
  heroImage: string
  description: string[]
  highlights?: string[]
  faqs?: FAQ[]
  testimonials?: Testimonial[]
  ctaText?: string
  ctaHref?: string
  galleryImages?: string[]
  additionalSections?: React.ReactNode
}

export function InitiativePageLayout({
  title,
  tagline,
  heroImage,
  description,
  highlights,
  faqs,
  testimonials,
  ctaText,
  ctaHref,
  galleryImages,
  additionalSections,
}: InitiativePageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                Devanhaar Initiative
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight text-balance mb-6">
                {title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                {tagline}
              </p>
              {ctaText && ctaHref && (
                <div className="mt-8">
                  <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                      {ctaText} <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  </a>
                </div>
              )}
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src={heroImage || "/placeholder.svg"}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            {description.map((paragraph, i) => (
              <p
                key={i}
                className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <section className="py-16 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Highlights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((item, i) => (
                <div
                  key={i}
                  className="bg-background rounded-xl p-6 border border-border/50"
                >
                  <p className="text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryImages && galleryImages.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Gallery
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden"
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${title} gallery ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional Sections (custom per page) */}
      {additionalSections}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <section className="py-16 lg:py-24 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl flex flex-col gap-8">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Testimonials
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-[#f8f8f8] rounded-xl p-8 flex flex-col"
                >
                  <p className="text-foreground leading-relaxed italic mb-6 flex-1">
                    {`"${t.quote}"`}
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mt-1">
                      {t.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 lg:py-24 bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Involved with {title}
          </h2>
          <p className="text-background/70 max-w-xl mx-auto mb-8">
            {tagline}
          </p>
          <Link href="/">
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 text-base border-background/30 text-background hover:bg-background/10 bg-transparent"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

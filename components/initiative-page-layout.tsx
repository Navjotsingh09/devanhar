"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Expand, X, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { CampApplicationForm } from "@/components/camp-application-form"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"

interface FAQ {
  question: string
  answer: string
}

interface Testimonial {
  quote: string
  name: string
  role: string
}


interface VideoTestimonial {
  videoUrl: string
  caption: string
}
interface Highlight {
  title: string
  description: string
}

interface InitiativePageProps {
  title: string
  tagline: string
  heroImage: string
  description: string[]
  highlights?: (Highlight | string)[]
  faqs?: FAQ[]
  testimonials?: Testimonial[]
  videoTestimonials?: VideoTestimonial[]
  ctaText?: string
  onCtaClick?: () => void
  ctaHref?: string
  galleryImages?: string[]
  featuredVideoUrl?: string
  additionalSections?: React.ReactNode
}


function FeaturedVideo({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const separator = url.includes("?") ? "&" : "?"
  const nocookieUrl = url.replace("www.youtube.com", "www.youtube-nocookie.com")
  const videoId = url.split("/embed/")[1]?.split("?")[0] || ""
  const baseParams = `rel=0&modestbranding=1&loop=1&playlist=${videoId}`
  const src = `${nocookieUrl}${separator}autoplay=1&mute=1&${baseParams}`

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div
          ref={ref}
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video"
        >
          {inView ? (
            <iframe
              src={src}
              title="Featured Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function InitiativePageLayout({
  title,
  tagline,
  heroImage,
  description,
  highlights,
  faqs,
  testimonials,
  videoTestimonials,
  ctaText,
  ctaHref,
  onCtaClick,
  galleryImages,
  featuredVideoUrl,
  additionalSections,
}: InitiativePageProps) {
  const [showCampForm, setShowCampForm] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // Keyboard navigation for lightbox
  const handleLightboxKey = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null || !galleryImages) return
    if (e.key === 'Escape') setLightboxIndex(null)
    if (e.key === 'ArrowLeft') setLightboxIndex((prev) => prev !== null && galleryImages ? (prev - 1 + galleryImages.length) % galleryImages.length : null)
    if (e.key === 'ArrowRight') setLightboxIndex((prev) => prev !== null && galleryImages ? (prev + 1) % galleryImages.length : null)
  }, [lightboxIndex, galleryImages])

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.addEventListener('keydown', handleLightboxKey)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleLightboxKey)
        document.body.style.overflow = ''
      }
    }
  }, [lightboxIndex, handleLightboxKey])

  const isSinghsCamp = title.trim().toLowerCase() === "singhs camp"
  const effectiveCtaClick = onCtaClick ?? (isSinghsCamp ? () => setShowCampForm(true) : undefined)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollAnimations />

      {/* Hero Section */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
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
              {ctaText && (effectiveCtaClick || ctaHref) && (
                <div className="mt-8">
                  {effectiveCtaClick ? (
                    <Button onClick={effectiveCtaClick} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                      {ctaText} <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  ) : (
                    <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                        {ctaText} <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </a>
                  )}
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
      <section className="pt-20 pb-8 lg:pt-28 lg:pb-12">
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

      {/* Featured Video */}
      {featuredVideoUrl && (
        <FeaturedVideo url={featuredVideoUrl} />
      )}

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <section className="py-16 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Highlights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((item, i) => {
                const isString = typeof item === "string"
                return (
                  <div
                    key={i}
                    className="bg-background rounded-xl p-6 border border-border/50"
                  >
                    {isString ? (
                      <p className="text-muted-foreground leading-relaxed">{item}</p>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </>
                    )}
                  </div>
                )
              })}
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
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${title} gallery ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && galleryImages && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length)
                }}
                className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((lightboxIndex + 1) % galleryImages.length)
                }}
                className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          <img
            src={galleryImages[lightboxIndex]}
            alt={`${title} gallery ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      {/* Additional Sections (custom per page) */}
      {additionalSections}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <FAQSection items={faqs} />
      )}

      {/* Testimonials */}
      {(videoTestimonials && videoTestimonials.length > 0) || (testimonials && testimonials.length > 0) ? (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Testimonials
            </h2>
            {videoTestimonials && videoTestimonials.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {videoTestimonials.map((video, i) => (
                  <div key={i} className="bg-[#f8f8f8] rounded-xl overflow-hidden border border-border/50">
                    <video controls className="w-full aspect-video bg-black" preload="metadata">
                      <source src={video.videoUrl} type="video/mp4" />
                    </video>
                    <p className="p-4 text-sm text-muted-foreground leading-relaxed">
                      {video.caption}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {testimonials && testimonials.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-[#f8f8f8] rounded-xl p-8 flex flex-col">
                    <p className="text-foreground leading-relaxed italic mb-6 flex-1">
                      {`"${t.quote}"`}
                    </p>
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mt-1">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
      {/* Bottom CTA */}
      <section className="py-16 lg:py-24 bg-foreground text-background">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Involved with {title}
          </h2>
          <p className="text-background/70 max-w-xl mx-auto mb-8">
            {tagline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {ctaText && (effectiveCtaClick || ctaHref) && (
              effectiveCtaClick ? (
                <Button onClick={effectiveCtaClick} className="rounded-full px-8 py-6 text-base bg-background text-foreground hover:bg-background/90">
                  {ctaText}
                </Button>
              ) : (
                <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                  <Button className="rounded-full px-8 py-6 text-base bg-background text-foreground hover:bg-background/90">
                    {ctaText}
                  </Button>
                </a>
              )
            )}
            <Link href="/contact">
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-background/30 text-background hover:bg-background/10 bg-transparent"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {isSinghsCamp && showCampForm && (
        <CampApplicationForm
          initiativeSlug="singhs-camp"
          onClose={() => setShowCampForm(false)}
        />
      )}

      <FooterSection />
    </div>
  )
}

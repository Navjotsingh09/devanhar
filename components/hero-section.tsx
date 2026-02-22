"use client"

import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const images = [
    "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&q=80",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
    "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=800&q=80",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="relative min-h-[90vh] pt-28 pb-12 overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="floating-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div className="space-y-8">
            <div className="hero-animate-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-2 backdrop-blur-sm shadow-lg shadow-primary/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
                Empowering the Next Generation
              </span>
            </div>

            <h1 className="hero-animate-2 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="block mb-2">Empower,</span>
              <span className="block mb-2">Develop &amp;</span>
              <span className="block">
                <span className="bg-gradient-to-r from-primary via-amber-600 to-primary bg-clip-text text-transparent animate-gradient-x">
                  Create Together
                </span>
              </span>
            </h1>

            <p className="hero-animate-3 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              A Birmingham-based charity dedicated to empowering generations through 
              <span className="font-semibold text-foreground"> Sikh values</span>, knowledge, 
              and spiritual growth.
            </p>

            <div className="hero-animate-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/#contact">
                <Button className="group relative bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Involved 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                </Button>
              </Link>
              <Link
                href="/about"
                className="group flex items-center gap-3 text-base text-foreground hover:text-primary transition-all duration-300"
              >
                <span className="relative w-12 h-12 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300 backdrop-blur-sm bg-background/50">
                  <Play className="h-4 w-4 ml-0.5 group-hover:scale-110 transition-transform" />
                </span>
                <span className="font-medium">Learn Our Story</span>
              </Link>
            </div>

            <div className="hero-animate-5 flex items-center gap-8 pt-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                <div className="relative">
                  <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">500+</p>
                  <p className="text-sm text-muted-foreground font-medium">Annual Campers</p>
                </div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                <div className="relative">
                  <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">25+</p>
                  <p className="text-sm text-muted-foreground font-medium">University Talks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hero-animate-6 lg:ml-auto w-full max-w-2xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-30 animate-pulse-slow" />
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 backdrop-blur-[1px] pointer-events-none" />
              <div className="absolute inset-0 z-10 rounded-3xl border border-primary/20 animate-border-glow pointer-events-none" />

              <div className="relative aspect-[4/5] lg:aspect-[3/4]">
                {images.map((src, index) => (
                  <div
                    key={src}
                    className={}
                  >
                    <Image
                      src={src}
                      alt={}
                      fill
                      className="object-cover"
                      unoptimized
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border/50">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={}
                    aria-label={}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-border/50 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Active Community</p>
                  <p className="text-xs text-muted-foreground">Growing every day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
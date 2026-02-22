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
      </div>
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase">Empowering the Next Generation</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span>Empower, Develop & Create Together</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">A Birmingham-based charity dedicated to empowering generations through Sikh values, knowledge, and spiritual growth.</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/#contact">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6">
                  Get Involved <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative aspect-[4/5]">
                {images.map((src, index) => (
                  <div key={src} className={`absolute inset-0 transition-all duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}>
                    <Image src={src} alt="Community" fill className="object-cover" unoptimized priority={index === 0} />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 px-4 py-2 rounded-full">
                {images.map((_, index) => (
                  <button key={index} onClick={() => setCurrentImageIndex(index)} className={`rounded-full ${index === currentImageIndex ? "bg-primary w-8 h-1.5" : "bg-muted w-1.5 h-1.5"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
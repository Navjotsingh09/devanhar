"use client"

import Image from "next/image"
import { ArrowRight, BookOpen, Heart, Globe, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const pillars = [
  { icon: BookOpen, title: "Education", description: "Empowering communities through accessible learning programmes, scholarships, and skill development initiatives." },
  { icon: Users, title: "Community", description: "Building strong, connected communities through cultural events, mentorship, and grassroots organising." },
  { icon: Heart, title: "Wellbeing", description: "Supporting mental, physical, and spiritual wellbeing through holistic programmes and support networks." },
  { icon: Globe, title: "Global Impact", description: "Extending our reach beyond borders to create positive change in underserved communities worldwide." },
]

const timeline = [
  { year: "2017", title: "Foundation Established", description: "Devanhaar was founded with a mission to serve communities through education and Sikh values." },
  { year: "2018", title: "First Education Programme", description: "Launched our inaugural education programme serving 200 young learners." },
  { year: "2019", title: "Community Expansion", description: "Expanded to three cities with new community centres and volunteer networks." },
  { year: "2020", title: "Digital Pivot", description: "Adapted our programmes for online delivery, reaching communities during the pandemic." },
  { year: "2021", title: "Youth Initiative Launch", description: "Introduced dedicated youth mentorship and leadership development programmes." },
  { year: "2022", title: "International Outreach", description: "Extended our mission internationally with projects in South Asia and East Africa." },
  { year: "2023", title: "10,000 Lives Impacted", description: "Reached the milestone of positively impacting over 10,000 lives across all programmes." },
  { year: "2024", title: "AGRI Programme", description: "Launched the AGRI initiative, our most ambitious programme connecting agriculture and community development." },
]

export function FoundationPageContent() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                Who We Are
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                Building a Legacy of Seva & Empowerment
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Rooted in Sikh values of seva, equality, and compassion. Devanhaar
                exists to empower communities through education, service, and
                cultural preservation.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                  <Link href="/donate">Support Our Mission</Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                <div className="absolute inset-0 backdrop-blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-primary/40" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg hidden md:block">
                <p className="text-3xl font-bold">2017</p>
                <p className="text-sm text-primary-foreground/80">Year Founded</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#1a1f2e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "2017", label: "Year Founded" },
              { number: "10K+", label: "Lives Touched" },
              { number: "7", label: "Active Programmes" },
              { number: "50+", label: "Events Annually" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </p>
                <p className="text-sm text-white/60 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Mission */}
      <section className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Our Mission</h2>
            <div className="w-12 h-px bg-amber-400 mb-8" />
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">Devanhaar Foundation is committed to creating lasting positive change through education, community development, and the promotion of Sikh heritage and values.</p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">We believe that every individual deserves access to quality education, a strong community, and the opportunity to reach their full potential.</p>
            <p className="text-lg text-muted-foreground leading-relaxed">Guided by the principles of seva, we work tirelessly to uplift communities both locally and globally.</p>
          </div>
          <div className="relative aspect-[4/5] bg-muted overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80" alt="Community gathering" fill className="object-cover" unoptimized />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Our Pillars</h2>
            <div className="w-12 h-px bg-amber-400 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-6">
                  <pillar.icon className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Our Journey</h2>
          <div className="w-12 h-px bg-amber-400 mb-16" />
          <div className="max-w-3xl">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-8 pb-12 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                  {i < timeline.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                </div>
                <div className="pb-8">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500 mb-2">{item.year}</p>
                  <h3 className="text-xl font-medium text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6 tracking-tight">Support Our Mission</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">Join us in creating lasting change. Every contribution helps us empower more communities.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all underline underline-offset-4 decoration-1">
              Get Involved
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

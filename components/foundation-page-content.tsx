"use client"

import Image from "next/image"
import { ArrowRight, BookOpen, Heart, Globe, Users } from "lucide-react"
import Link from "next/link"

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
      {/* Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Who We Are</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-foreground mb-8 tracking-tight">The Foundation</h1>
            <div className="w-16 h-px bg-amber-400 mb-8" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">Rooted in Sikh values of seva, equality, and compassion. Devanhaar exists to empower communities through education, service, and cultural preservation.</p>
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

"use client"

import Image from "next/image"
import { ArrowRight, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
}

const leadership: TeamMember[] = [
  {
    name: "Harjinder Singh",
    role: "Founder & Chairperson",
    bio: "A visionary leader dedicated to community empowerment through education and service.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=Harjinder",
  },
  {
    name: "Gurpreet Kaur",
    role: "Director of Education",
    bio: "With over a decade in educational programme design, Gurpreet leads our learning initiatives.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=Gurpreet",
  },
  {
    name: "Rajveer Singh",
    role: "Head of Operations",
    bio: "Rajveer ensures every project runs smoothly from conception to delivery.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=Rajveer",
  },
]
const team: TeamMember[] = [
  { name: "Simran Kaur", role: "Community Outreach", bio: "Connecting communities through meaningful engagement.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=Simran" },
  { name: "Amrit Singh", role: "Programme Coordinator", bio: "Designing programmes that create measurable impact.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=Amrit" },
  { name: "Jasleen Kaur", role: "Youth Engagement", bio: "Inspiring the next generation through mentorship.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=Jasleen" },
  { name: "Manpreet Singh", role: "Digital & Media", bio: "Crafting our digital presence and amplifying stories.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=Manpreet" },
  { name: "Harpreet Kaur", role: "Events & Culture", bio: "Bringing communities together through cultural celebrations.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=Harpreet" },
  { name: "Paramjit Singh", role: "Volunteer Coordinator", bio: "Building our network of dedicated volunteers.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=Paramjit" },
]

const values = [
  { title: "Seva", description: "Selfless service lies at the heart of everything we do." },
  { title: "Sangat", description: "Strength through community, unity in purpose." },
  { title: "Sikhi", description: "Guided by Sikh principles of equality, justice, and compassion." },
]

export function TeamPageContent() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                Our People
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                The Sevadaars Behind Devanhaar
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Dedicated individuals united by a shared commitment to service,
                education, and community empowerment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                  <Link href="/contact">Join Our Team</Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5">
                  <Link href="/projects">Our Projects</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                <div className="absolute inset-0 backdrop-blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary/40" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg hidden md:block">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-primary-foreground/80">Active Sevadaars</p>
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
              { number: "50+", label: "Active Sevadaars" },
              { number: "7", label: "Core Projects" },
              { number: "10+", label: "UK Cities" },
              { number: "100%", label: "Volunteer Run" },
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

      {/* Leadership */}
      <section className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
        <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Leadership</h2>
        <div className="w-12 h-px bg-amber-400 mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {leadership.map((m) => (
            <div key={m.name} className="group">
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-muted">
                <Image src={m.image} alt={m.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
              </div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500 mb-2">{m.role}</p>
              <h3 className="text-2xl font-medium text-foreground mb-3">{m.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wider Team */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Our Team</h2>
          <div className="w-12 h-px bg-amber-400 mb-16" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            {team.map((m) => (
              <div key={m.name} className="group">
                <div className="relative aspect-square mb-4 overflow-hidden bg-muted">
                  <Image src={m.image} alt={m.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                </div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500 mb-1">{m.role}</p>
                <h3 className="text-lg font-medium text-foreground mb-2">{m.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Our Values</h2>
            <div className="w-12 h-px bg-amber-400 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="text-2xl font-light text-foreground mb-3 tracking-tight">{v.title}</h3>
                <div className="w-8 h-px bg-amber-400 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6 tracking-tight">Join Our Team</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">We are always looking for passionate individuals. Whether as a volunteer or team member, there is a place for you.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all underline underline-offset-4 decoration-1">
              Get in Touch
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

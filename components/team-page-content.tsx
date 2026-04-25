"use client"

import Image from "next/image"
import { ArrowRight, Users, Linkedin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
  linkedin?: string
}

const leadership: TeamMember[] = [
  {
    name: "Mandeep Narwal",
    role: "Head of Operations",
    bio: "Overseeing day-to-day operations and driving organisational growth across all projects.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=MandeepNarwal",
    linkedin: "https://www.linkedin.com/in/mandeep-singh-narwal/",
  },
  {
    name: "Baldev Singh",
    role: "Head of Communication",
    bio: "Leading communications strategy and external engagement.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=BaldevSingh",
    linkedin: "#",
  },
  {
    name: "Jitarun Singh, ACCA",
    role: "Account Lead",
    bio: "Managing financial operations with professional rigour and transparency.",
    image: "/team/jitarun-singh.jpg",
    linkedin: "https://www.linkedin.com/in/jitarunjandu/",
  },
]
const team: TeamMember[] = [
  { name: "Daljit Kaur", role: "Project Manager", bio: "Coordinating project delivery and ensuring seamless execution.", image: "/team/daljit-kaur.jpg", linkedin: "https://www.linkedin.com/in/daljitkaurstem/" },
  { name: "Mandeep Singh", role: "Joint Head of Finance", bio: "Co-leading financial planning and governance.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=MandeepSingh", linkedin: "#" },
  { name: "Gugandeep Singh", role: "Joint Head of Finance", bio: "Co-leading financial planning and governance.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=GugandeepSingh", linkedin: "#" },
  { name: "Gurvinder Singh", role: "Head of HR & Governance", bio: "Building robust HR frameworks and governance processes.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=GurvinderSingh", linkedin: "https://www.linkedin.com/in/guvinder-singh-b7870762/" },
  { name: "Bapinder Singh", role: "Tech Manager", bio: "Leading technology strategy and digital infrastructure.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=BapinderSingh", linkedin: "#" },
  { name: "Inderjit Singh", role: "Head of Self Defence Academy", bio: "Leading self-defence programmes rooted in discipline and empowerment.", image: "/team/inderjit-singh.jpg", linkedin: "https://www.linkedin.com/in/inderjit-singh-963015273/" },
  { name: "Amrit Singh", role: "Creative Lead", bio: "Shaping visual identity and creative direction.", image: "/team/amrit-singh.jpg", linkedin: "https://www.linkedin.com/in/amritsinghpahal/" },
  { name: "Gursimran Kaur", role: "Head of Kaurs Camp UK", bio: "Leading the Kaurs Camp UK initiative to empower young women.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=GursimranKaur", linkedin: "#" },
  { name: "Benita", role: "Head of Kaurs Spaces", bio: "Creating safe and empowering spaces for Kaurs.", image: "/team/benita.jpg", linkedin: "https://www.linkedin.com/in/benitakaur/" },
  { name: "Gurpreet Rana", role: "Head of Media", bio: "Managing media output and storytelling across platforms.", image: "/team/gurpreet-rana.jpg", linkedin: "https://www.linkedin.com/in/gurpreetkrana/" },
  { name: "Pritam Singh", role: "Head of Singhs Camp UK", bio: "Leading the Singhs Camp UK initiative to develop young men.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=PritamSingh", linkedin: "https://www.linkedin.com/in/pritam-singh-mandair-346220201/" },
  { name: "Dr Taran Singh", role: "Head of Operations", bio: "Supporting operational delivery and strategic planning.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=DrTaranSingh", linkedin: "https://www.linkedin.com/in/taran-dhillon-64a444254/" },
  { name: "Sat Singh", role: "Head of Partnerships", bio: "Building strategic partnerships to expand reach.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=SatSingh", linkedin: "https://www.linkedin.com/in/sat-dhillon/" },
]

const values = [
  { title: "Develop", description: "Building skills, character, and foundations for generational success." },
  { title: "Elevate", description: "Raising ambition, standards, and impact in every area of life." },
  { title: "Empower", description: "Providing confidence rooted in identity, values, and self-belief." },
  { title: "Connect", description: "Creating lifelong relationships centred in community, mentorship, and shared growth." },
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
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/images/sevadaar-summit.mp4" type="video/mp4" />
                </video>
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
              { number: "9", label: "Live Projects" },
              { number: "UK", label: "Based" },
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
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
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
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Devanhaar Values</h2>
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

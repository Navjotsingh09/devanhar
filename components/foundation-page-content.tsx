"use client"


import Image from "next/image"
import { ArrowRight, BookOpen, Heart, Globe, Users, Sparkles, GraduationCap, Landmark, Wifi, Award, Sprout, TrendingUp, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const pillars = [
  { icon: BookOpen, title: "Education", description: "Empowering communities through accessible learning programmes, scholarships, and skill development initiatives." },
  { icon: Users, title: "Community", description: "Building strong, connected communities through cultural events, mentorship, and grassroots organising." },
  { icon: Heart, title: "Wellbeing", description: "Supporting mental, physical, and spiritual wellbeing through holistic programmes and support networks." },
  { icon: Globe, title: "Global Impact", description: "Extending our reach beyond borders to create positive change in underserved communities worldwide." },
]

interface TimelineEvent {
  year: string
  title: string
  description: string
  icon: LucideIcon
  highlight?: string
  image?: string
}

const timeline: TimelineEvent[] = [
  {
    year: "2017",
    title: "Foundation Established",
    description: "Devanhaar was born from a vision to serve communities through education, empowerment, and Sikh values. A small group of passionate individuals came together in Birmingham to plant the seed of lasting change.",
    icon: Sparkles,
    highlight: "Where it all began",
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&q=80",
  },
  {
    year: "2018",
    title: "First Education Programme",
    description: "Launched our inaugural education programme, welcoming 200 young learners into structured Gurmat and academic classes. The response from the community was overwhelming \u2014 confirming the need for our work.",
    icon: GraduationCap,
    highlight: "200 young learners",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
  },
  {
    year: "2019",
    title: "Community Expansion",
    description: "Expanded beyond Birmingham to three cities, establishing new community centres and growing our volunteer network to over 100 dedicated sevadaars. Our camps programme launched to incredible demand.",
    icon: Landmark,
    highlight: "3 cities, 100+ volunteers",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
  {
    year: "2020",
    title: "Digital Pivot",
    description: "When the world paused, we adapted. Rapidly pivoted all programmes online, reaching isolated community members during the pandemic. Launched virtual Kirtan sessions, online classes, and a digital support network.",
    icon: Wifi,
    highlight: "Programmes moved online",
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80",
  },
  {
    year: "2021",
    title: "Youth Initiative Launch",
    description: "Introduced dedicated youth mentorship and leadership development with the Khalsa Catalyst programme. Young Sikhs were empowered to lead conversations, organise events, and drive community change.",
    icon: TrendingUp,
    highlight: "Khalsa Catalyst launched",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80",
  },
  {
    year: "2022",
    title: "International Outreach",
    description: "Extended our mission internationally with educational projects in Punjab and community development initiatives in East Africa. Our vision of global seva became a reality.",
    icon: Globe,
    highlight: "Punjab & East Africa",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
  },
  {
    year: "2023",
    title: "10,000 Lives Impacted",
    description: "A landmark year \u2014 we reached the milestone of positively impacting over 10,000 lives across all programmes. From education to wellbeing, every initiative contributed to this extraordinary figure.",
    icon: Award,
    highlight: "10,000+ lives touched",
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80",
  },
  {
    year: "2024",
    title: "AGRI Programme & Beyond",
    description: "Launched our most ambitious initiative \u2014 the AGRI programme connecting sustainable agriculture with community development. Alongside, we expanded camps, deepened university partnerships, and grew our shop to fund the mission.",
    icon: Sprout,
    highlight: "Most ambitious year yet",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
  },
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

      {/* Our Journey \u2014 Interactive Timeline */}
      <section className="border-t border-border relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32 relative">
          {/* Section Header */}
          <div className="text-center mb-20">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-500 mb-4">Since 2017</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 tracking-tight">Our Journey</h2>
            <div className="w-16 h-px bg-amber-400 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From a small gathering in Birmingham to impacting over 10,000 lives \u2014 every step has been guided by faith, seva, and community.
            </p>
          </div>

          {/* Desktop Timeline \u2014 Alternating Cards */}
          <div className="hidden lg:block relative">
            {/* Central Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent -translate-x-1/2" />

            <div className="space-y-0">
              {timeline.map((item, i) => {
                const isLeft = i % 2 === 0
                return (
                  <div key={item.year} className="relative group">
                    {/* Center Node */}
                    <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                      <div className="w-14 h-14 rounded-full bg-background border-2 border-amber-400/50 group-hover:border-amber-400 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.15)]">
                        <item.icon className="w-6 h-6 text-amber-500 transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    </div>

                    {/* Card */}
                    <div className={`grid grid-cols-2 gap-20 pb-20 ${isLeft ? "" : ""}`}>
                      {/* Left Side */}
                      <div className={isLeft ? "text-right pr-8" : "order-2 pl-8"}>
                        {isLeft ? (
                          <div className="inline-block">
                            <div className="bg-background border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-amber-400/30 transition-all duration-500 group-hover:-translate-y-1 max-w-lg ml-auto text-left">
                              {item.highlight && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold tracking-wider uppercase mb-4">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  {item.highlight}
                                </span>
                              )}
                              <div className="flex items-baseline gap-3 mb-3">
                                <span className="text-3xl font-bold text-amber-500 tabular-nums">{item.year}</span>
                              </div>
                              <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                              {item.image && (
                                <div className="mt-5 relative aspect-[16/9] rounded-xl overflow-hidden bg-muted">
                                  <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-end h-full pt-8">
                            <span className="text-8xl font-extralight text-foreground/[0.04] select-none tabular-nums">{item.year}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Side */}
                      <div className={isLeft ? "order-2 pl-8" : "text-left pr-8"}>
                        {!isLeft ? (
                          <div className="inline-block">
                            <div className="bg-background border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-amber-400/30 transition-all duration-500 group-hover:-translate-y-1 max-w-lg text-left">
                              {item.highlight && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold tracking-wider uppercase mb-4">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  {item.highlight}
                                </span>
                              )}
                              <div className="flex items-baseline gap-3 mb-3">
                                <span className="text-3xl font-bold text-amber-500 tabular-nums">{item.year}</span>
                              </div>
                              <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                              {item.image && (
                                <div className="mt-5 relative aspect-[16/9] rounded-xl overflow-hidden bg-muted">
                                  <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start h-full pt-8">
                            <span className="text-8xl font-extralight text-foreground/[0.04] select-none tabular-nums">{item.year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* End Node */}
            <div className="flex justify-center">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>
          </div>

          {/* Mobile Timeline \u2014 Stacked Cards */}
          <div className="lg:hidden relative">
            {/* Left Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/30 to-transparent" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={item.year} className="relative pl-16 group">
                  {/* Node */}
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-background border-2 border-amber-400/50 flex items-center justify-center z-10">
                    <item.icon className="w-5 h-5 text-amber-500" />
                  </div>

                  {/* Card */}
                  <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-amber-400/30 transition-all duration-300">
                    {item.highlight && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold tracking-wider uppercase mb-3">
                        <span className="w-1 h-1 rounded-full bg-amber-400" />
                        {item.highlight}
                      </span>
                    )}
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-2xl font-bold text-amber-500 tabular-nums">{item.year}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    {item.image && (
                      <div className="mt-4 relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                        <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* End Node */}
            <div className="flex pl-3 pt-6">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>
          </div>

          {/* Journey Summary */}
          <div className="mt-20 pt-16 border-t border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "8", label: "Years of Impact" },
                { value: "10K+", label: "Lives Touched" },
                { value: "3+", label: "Countries Reached" },
                { value: "100+", label: "Dedicated Sevadaars" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
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

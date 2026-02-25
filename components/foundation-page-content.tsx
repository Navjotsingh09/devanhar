"use client"

import { useRef } from "react"
import Image from "next/image"
import { ArrowRight, BookOpen, Heart, Globe, Users, Sparkles, GraduationCap, Landmark, Wifi, Award, Sprout, TrendingUp, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react"
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
  highlight: string
  image: string
}

const timeline: TimelineEvent[] = [
  {
    year: "2017",
    title: "Foundation Established",
    description: "A small group of passionate individuals came together in Birmingham to plant the seed of lasting change through education and Sikh values.",
    icon: Sparkles,
    highlight: "Where it all began",
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&q=80",
  },
  {
    year: "2018",
    title: "First Education Programme",
    description: "Welcomed 200 young learners into structured Gurmat and academic classes. The community response confirmed the need for our work.",
    icon: GraduationCap,
    highlight: "200 young learners",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
  },
  {
    year: "2019",
    title: "Community Expansion",
    description: "Expanded to three cities with new community centres and over 100 dedicated sevadaars. Our camps programme launched to incredible demand.",
    icon: Landmark,
    highlight: "3 cities, 100+ volunteers",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
  {
    year: "2020",
    title: "Digital Pivot",
    description: "Rapidly pivoted all programmes online during the pandemic. Launched virtual Kirtan, online classes, and a digital support network.",
    icon: Wifi,
    highlight: "Programmes moved online",
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80",
  },
  {
    year: "2021",
    title: "Youth Initiative Launch",
    description: "Introduced the Khalsa Catalyst programme. Young Sikhs were empowered to lead conversations, organise events, and drive community change.",
    icon: TrendingUp,
    highlight: "Khalsa Catalyst launched",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80",
  },
  {
    year: "2022",
    title: "International Outreach",
    description: "Extended our mission internationally with projects in Punjab and community development in East Africa. Global seva became reality.",
    icon: Globe,
    highlight: "Punjab & East Africa",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
  },
  {
    year: "2023",
    title: "10,000 Lives Impacted",
    description: "A landmark year. Over 10,000 lives positively impacted across all programmes \u2014 from education to wellbeing.",
    icon: Award,
    highlight: "10,000+ lives touched",
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80",
  },
  {
    year: "2024",
    title: "AGRI Programme & Beyond",
    description: "Launched our most ambitious initiative connecting sustainable agriculture with community development. Expanded camps and university partnerships.",
    icon: Sprout,
    highlight: "Most ambitious year yet",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
  },
]

export function FoundationPageContent() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

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

      {/* Stats */}
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
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</p>
                <p className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-[#c49a6c] uppercase tracking-widest mb-3">Our Purpose</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1f2e] mb-6 leading-tight">
                Rooted in Seva,<br />Growing Through Action
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Devanhaar is a Birmingham-based Sikh charity dedicated to community upliftment through
                education, agriculture, sustainability, and cultural preservation.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Guided by the Sikh principles of Seva (selfless service) and Sarbat da Bhala
                (welfare of all), we work to create lasting, positive change for communities across
                the UK and beyond.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-[#c49a6c]/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 text-8xl font-bold">ੴ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#c49a6c] uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1f2e]">Our Four Pillars</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#c49a6c]/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-[#c49a6c]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1f2e] mb-2">{pillar.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Horizontal Timeline – Ethereal-inspired */}
      <section className="py-24 bg-[#1a1f2e] overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header row with scroll arrows */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold text-[#c49a6c] uppercase tracking-widest mb-3">Since 2017</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Our Journey</h2>
            </div>
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => scroll("left")}
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal track line */}
          <div className="relative">
            <div className="absolute top-[28px] left-0 right-0 h-px bg-white/10 z-0" />

            {/* Scrollable container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {timeline.map((event, i) => {
                const Icon = event.icon;
                return (
                  <div
                    key={event.year}
                    className="snap-start shrink-0 w-[320px] md:w-[380px] group"
                  >
                    {/* Year dot on track */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#c49a6c] ring-4 ring-[#1a1f2e] z-10 shrink-0" />
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                        {event.year}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-[#c49a6c]/40 transition-colors duration-300">
                      {/* Image area */}
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-gradient-to-br from-[#c49a6c]/20 to-transparent">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-10 h-10 text-white/30" />
                        </div>
                        {event.highlight && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#c49a6c] text-white rounded-full">
                            {event.highlight}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#c49a6c] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile hint */}
          <p className="md:hidden text-center text-xs text-white/30 mt-4">Swipe to explore →</p>
        </div>
      </section>

      {/* Scrollbar-hide global style */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Users, Heart, Sparkles, BookOpen, Mic2, GraduationCap, School } from "lucide-react"

interface Project {
  title: string
  description: string
  image: string
  href: string
  tag: string
  icon: React.ElementType
}

const projects: Project[] = [
  {
    title: "Singhs Camp",
    description: "An immersive residential camp bringing together young Sikh men for spiritual growth, physical discipline, and community bonding.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    href: "/initiatives/singhs-camp",
    tag: "Flagship",
    icon: Users,
  },
  {
    title: "Kaurs Camp",
    description: "A dedicated space for young Sikh women to explore their identity, build confidence, and deepen their connection to Sikhi.",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80",
    href: "/initiatives/kaurs-camp",
    tag: "Community",
    icon: Heart,
  },
  {
    title: "Kids Camps",
    description: "Fun, engaging camps for younger Sikhs to learn about heritage through activities, storytelling, and age-appropriate Gurmat sessions.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    href: "/initiatives/kids-camps",
    tag: "Youth",
    icon: Sparkles,
  },
  {
    title: "Sikhi Vidyala",
    description: "A structured educational programme offering weekly classes in Gurbani, Sikh history, Gurmukhi, and Sikh philosophy for all ages.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    href: "/initiatives/sikhi-vidyala",
    tag: "Education",
    icon: BookOpen,
  },
  {
    title: "Khalsa Catalyst",
    description: "A platform for thought-provoking discussions, panels, and presentations exploring contemporary issues facing the Sikh community.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    href: "/initiatives/khalsa-catalyst",
    tag: "Discourse",
    icon: Mic2,
  },
  {
    title: "University Projects",
    description: "Engaging talks and workshops at universities across the UK, introducing Sikhi and creating spaces for interfaith dialogue.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    href: "/initiatives/university-projects",
    tag: "Outreach",
    icon: GraduationCap,
  },
  {
    title: "Gurmat Academy",
    description: "Advanced learning programmes in Sikh theology, Gurbani vichar, and spiritual practice for deeper understanding.",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    href: "/initiatives/gurmat-academy",
    tag: "Advanced",
    icon: School,
  },
]

const stats = [
  { value: "500+", label: "Annual Campers" },
  { value: "25+", label: "University Talks" },
  { value: "7", label: "Core Initiatives" },
  { value: "8+", label: "Years of Seva" },
]

export function ProjectsPageContent() {
  return (
    <div className="pt-24 pb-0">
      {/* Hero Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
              Our Initiatives
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-foreground mb-8 tracking-tight">
              Projects
            </h1>
            <div className="w-16 h-px bg-amber-400 mb-8" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
              From residential camps to university outreach, every initiative is
              rooted in seva, Sikhi, and empowering the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
        <Link href={projects[0].href} className="group block">
          <div className="relative aspect-[21/9] overflow-hidden bg-muted rounded-sm">
            <Image
              src={projects[0].image}
              alt={projects[0].title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-400 mb-3">
                {projects[0].tag}
              </span>
              <h2 className="text-3xl md:text-5xl font-light text-white mb-3 tracking-tight">
                {projects[0].title}
              </h2>
              <p className="text-white/70 max-w-xl text-sm md:text-base leading-relaxed line-clamp-2">
                {projects[0].description}
              </p>
              <span className="inline-flex items-center gap-2 text-white text-sm font-medium mt-4 group-hover:gap-3 transition-all">
                Explore Initiative
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Medium Cards */}
      <section className="container mx-auto px-6 lg:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.slice(1, 3).map((project) => (
            <Link key={project.title} href={project.href} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted rounded-sm">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-400 mb-2">
                    {project.tag}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-light text-white mb-2 tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-2 max-w-md">
                    {project.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Compact Cards */}
      <section className="container mx-auto px-6 lg:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.slice(3).map((project) => {
            const Icon = project.icon
            return (
              <Link key={project.title} href={project.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-400">
                        {project.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1.5">
                      {project.title}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-white/80 text-xs font-medium mt-3 group-hover:gap-2.5 transition-all">
                      Learn More
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-[#1a1f2e]">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-white mb-4 tracking-tight">
              Our Impact
            </h2>
            <div className="w-12 h-px bg-amber-400 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-light text-white mb-2 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-white/50 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

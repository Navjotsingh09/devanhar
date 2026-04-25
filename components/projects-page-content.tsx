"use client"

import { useSiteImages } from "@/hooks/use-site-images"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Users, Heart, Sparkles, BookOpen, Mic2, GraduationCap, School, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    title: "Singhs Camps",
    description: "An immersive residential camp bringing together young Sikh men for spiritual growth, physical discipline, and community bonding.",
    image: "/initiatives/singhs-camp-top.jpg",
    href: "/initiatives/singhs-camp",
    tag: "Flagship",
    icon: Users,
  },
  {
    title: "Kaurs Camps",
    description: "A dedicated space for young Sikh women to explore their identity, build confidence, and deepen their connection to Sikhi.",
    image: "/initiatives/kaurs-camp-top.jpg",
    href: "/initiatives/kaurs-camp",
    tag: "Community",
    icon: Heart,
  },
  {
    title: "Kids Camps",
    description: "Fun, engaging camps for younger Sikhs to learn about heritage through activities, storytelling, and age-appropriate Gurmat sessions.",
    image: "/initiatives/kids-camps-top.jpg",
    href: "/initiatives/kids-camps",
    tag: "Youth",
    icon: Sparkles,
  },
  {
    title: "Sikhi Vidyala",
    description: "A structured educational programme offering weekly classes in Gurbani, Sikh history, Gurmukhi, and Sikh philosophy for all ages.",
    image: "/initiatives/sikhi-vidyala-top.jpg",
    href: "/initiatives/sikhi-vidyala",
    tag: "Education",
    icon: BookOpen,
  },
  {
    title: "Khalsa Catalyst",
    description: "A platform for thought-provoking discussions, panels, and presentations exploring contemporary issues facing the Sikh community.",
    image: "/images/Khalsa Catalyst/khalsa-top.jpg",
    href: "/initiatives/khalsa-catalyst",
    tag: "Discourse",
    icon: Mic2,
  },
  {
    title: "University Projects",
    description: "Engaging talks and workshops at universities across the UK, introducing Sikhi and creating spaces for interfaith dialogue.",
    image: "/initiatives/university-projects-top.jpg",
    href: "/initiatives/university-projects",
    tag: "Outreach",
    icon: GraduationCap,
  },
  {
    title: "Gurmat Academy",
    description: "Advanced learning programmes in Sikh theology, Gurbani vichar, and spiritual practice for deeper understanding.",
    image: "/initiatives/gurmat-academy-top.jpg",
    href: "/initiatives/gurmat-academy",
    tag: "Advanced",
    icon: School,
  },
  {
    title: "Self Defence Academy",
    description: "An academy dedicated to nurturing strength, skill and confidence whilst being rooted in Sikh values of honour, integrity and discipline.",
    image: "/initiatives/self-defence-top.png",
    href: "/initiatives/self-defence-academy",
    tag: "Martial Arts",
    icon: Shield,
  },
  {
    title: "Sikh Professional Network",
    description: "A platform connecting Sikh professionals across industries for mentorship, career development, and collaborative growth.",
    image: "/initiatives/spn-1.png",
    href: "/initiatives/sikh-professional-network",
    tag: "Professional",
    icon: Users,
  },
]

const stats = [
  { value: "2019", label: "Est." },
  { value: "UK", label: "Based, Global Reach" },
  { value: "9", label: "Live Projects" },
  { value: "2,500+", label: "People Impacted Annually" },
]

export function ProjectsPageContent() {
  const { images: projectImages } = useSiteImages("projects")
  const cmsImageMap = Object.fromEntries(projectImages.filter(img => img.category).map(img => [img.category!, img.url]))
  const getProjectImage = (slug: string, fallback: string) => cmsImageMap[slug] || fallback

  return (
    <div className="pt-24 pb-0">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                Our Projects
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                Creating Lasting Impact
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                From residential retreats to academic programmes and mentorship, every project is
                rooted in empowering, elevating and connecting with the Sikh diaspora.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                  <Link href="/donate">Support Our Work</Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5">
                  <Link href="/contact">Get Involved</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                <img src={cmsImageMap["hero"] || "/images/initiatives-hero.jpg"} alt="Our Projects" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg hidden md:block">
                <p className="text-3xl font-bold">9</p>
                <p className="text-sm text-primary-foreground/80">Live Projects</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#1a1f2e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* All Initiatives */}
      <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const Icon = project.icon
            return (
              <Link key={project.title} href={project.href} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-sm">
                  <Image
                    src={getProjectImage(project.href.split("/").pop()!, project.image)}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-400">
                        {project.tag}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-2 tracking-tight">
                      {project.title}
                    </h3>
                    <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-medium mt-3 group-hover:gap-2.5 transition-all">
                        Explore Project
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}

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
    title: "Singhs Camp",
    description: "An immersive residential camp bringing together young Sikh men for spiritual growth, physical discipline, and community bonding.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Singhs+Camp",
    href: "/initiatives/singhs-camp",
    tag: "Flagship",
    icon: Users,
  },
  {
    title: "Kaurs Camp",
    description: "A dedicated space for young Sikh women to explore their identity, build confidence, and deepen their connection to Sikhi.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Kaurs+Camp",
    href: "/initiatives/kaurs-camp",
    tag: "Community",
    icon: Heart,
  },
  {
    title: "Kids Camps",
    description: "Fun, engaging camps for younger Sikhs to learn about heritage through activities, storytelling, and age-appropriate Gurmat sessions.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Kids+Camps",
    href: "/initiatives/kids-camps",
    tag: "Youth",
    icon: Sparkles,
  },
  {
    title: "Sikhi Vidyala",
    description: "A structured educational programme offering weekly classes in Gurbani, Sikh history, Gurmukhi, and Sikh philosophy for all ages.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Sikhi+Vidyala",
    href: "/initiatives/sikhi-vidyala",
    tag: "Education",
    icon: BookOpen,
  },
  {
    title: "Khalsa Catalyst",
    description: "A platform for thought-provoking discussions, panels, and presentations exploring contemporary issues facing the Sikh community.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Khalsa+Catalyst",
    href: "/initiatives/khalsa-catalyst",
    tag: "Discourse",
    icon: Mic2,
  },
  {
    title: "University Projects",
    description: "Engaging talks and workshops at universities across the UK, introducing Sikhi and creating spaces for interfaith dialogue.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=University+Projects",
    href: "/initiatives/university-projects",
    tag: "Outreach",
    icon: GraduationCap,
  },
  {
    title: "Gurmat Academy",
    description: "Advanced learning programmes in Sikh theology, Gurbani vichar, and spiritual practice for deeper understanding.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Gurmat+Academy",
    href: "/initiatives/gurmat-academy",
    tag: "Advanced",
    icon: School,
  },
  {
    title: "Self Defence Academy",
    description: "An academy dedicated to nurturing strength, skill and confidence whilst being rooted in Sikh values of honour, integrity and discipline.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Self+Defence+Academy",
    href: "/initiatives/self-defence-academy",
    tag: "Martial Arts",
    icon: Shield,
  },
  {
    title: "Sikh Professional Network",
    description: "A platform connecting Sikh professionals across industries for mentorship, career development, and collaborative growth.",
    image: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Sikh+Professional+Network",
    href: "/initiatives/sikh-professional-network",
    tag: "Professional",
    icon: Users,
  },
]

const stats = [
  { value: "1,000+", label: "Annual Campers" },
  { value: "25+", label: "Yearly University Talks" },
  { value: "9", label: "Live Initiatives" },
  { value: "2019", label: "Est." },
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
                Our Initiatives
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                Creating Lasting Impact
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                From residential retreats to academic programs and mentorship, every initiative is
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
                {cmsImageMap["hero"] ? (
                  <img src={cmsImageMap["hero"]} alt="Our Initiatives" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 backdrop-blur-3xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-primary/40" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg hidden md:block">
                <p className="text-3xl font-bold">9</p>
                <p className="text-sm text-primary-foreground/80">Live Initiatives</p>
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

      {/* Featured Project */}
      <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
        <Link href={projects[0].href} className="group block">
          <div className="relative aspect-[21/9] overflow-hidden bg-muted rounded-sm">
            <Image
              src={getProjectImage(projects[0].href.split("/").pop()!, projects[0].image)}
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
                  src={getProjectImage(project.href.split("/").pop()!, project.image)}
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
                    src={getProjectImage(project.href.split("/").pop()!, project.image)}
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

    </div>
  )
}

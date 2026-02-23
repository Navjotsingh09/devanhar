"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface Project {
  title: string
  description: string
  image: string
  category: string
  slug: string
}

const projects: Project[] = [
  {
    title: "Sikh Heritage Academy",
    description: "Educational programs preserving Sikh history and culture for young learners across the UK.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    category: "Education",
    slug: "sikh-heritage-academy",
  },
  {
    title: "Langar on Wheels",
    description: "Mobile community kitchen serving free meals to underserved neighbourhoods in Birmingham.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    category: "Community",
    slug: "langar-on-wheels",
  },
  {
    title: "Youth Leadership Camp",
    description: "Annual summer programme developing leadership skills rooted in Sikh values for teens.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    category: "Youth",
    slug: "youth-leadership-camp",
  },
  {
    title: "Digital Literacy Hub",
    description: "Technology training centres bridging the digital divide in underserved communities.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    category: "Technology",
    slug: "digital-literacy-hub",
  },
  {
    title: "Panjabi Arts Festival",
    description: "Annual celebration of Panjabi arts, music, and literature connecting communities.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    category: "Culture",
    slug: "panjabi-arts-festival",
  },
  {
    title: "Community Outreach Network",
    description: "Volunteer-driven support network providing resources to families in need across the Midlands.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
    category: "Outreach",
    slug: "community-outreach-network",
  },
]

const stats = [
  { value: "50+", label: "Projects" },
  { value: "10K+", label: "Lives Touched" },
  { value: "15", label: "Cities" },
  { value: "8", label: "Years" },
]

export function ProjectsPageContent() {
  return (
    <div className="pt-24 pb-20">
      {/* Page Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
              What We Do
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-foreground mb-8 tracking-tight">
              Our Projects
            </h1>
            <div className="w-16 h-px bg-amber-400 mb-8" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
              Initiatives rooted in service, education, and community empowerment \u2014 creating lasting impact across the UK and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={"\/projects\/" + project.slug}
              className="group"
            >
              <div className="relative aspect-[4/3] mb-5 overflow-hidden bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500">
                  {project.category}
                </span>
                <h3 className="text-xl font-medium text-foreground group-hover:underline underline-offset-4 decoration-1">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {project.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm text-foreground font-medium pt-1 group-hover:gap-3 transition-all">
                  View Project
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">
              Our Impact
            </h2>
            <div className="w-12 h-px bg-amber-400 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-light text-foreground mb-2 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
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

"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface Article {
  title: string
  source: string
  date: string
  excerpt: string
  image: string
  href: string
}

const featured: Article = {
  title: "Devanhaar Foundation Launches AGRI Programme to Empower Rural Communities",
  source: "SikhNet",
  date: "March 2024",
  excerpt: "The Devanhaar Foundation has announced its most ambitious initiative yet — the AGRI programme, designed to connect sustainable agriculture with community development across rural regions.",
  image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
  href: "#",
}

const articles: Article[] = [
  {
    title: "Youth Leadership Summit Brings Together 500 Young Sikhs",
    source: "The Sikh Messenger",
    date: "January 2024",
    excerpt: "Devanhaar hosted its largest youth leadership summit, bringing together young Sikhs from across the UK.",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    href: "#",
  },
  {
    title: "Education Programme Reaches 10,000 Learners Milestone",
    source: "Sikh Press Association",
    date: "November 2023",
    excerpt: "A milestone achievement as our education initiatives collectively reach over 10,000 learners.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    href: "#",
  },
  {
    title: "Community Kitchen Initiative Serves 50,000 Meals",
    source: "Community Weekly",
    date: "September 2023",
    excerpt: "Our langar-inspired community kitchen programme has now served over 50,000 meals to those in need.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    href: "#",
  },
  {
    title: "Partnership with Local Schools Expands Heritage Programme",
    source: "SikhNet",
    date: "July 2023",
    excerpt: "New partnerships with schools in Birmingham and London will bring Sikh heritage education to thousands.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80",
    href: "#",
  },
]

const gallery = [
  { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80", alt: "Community event" },
  { src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80", alt: "Education programme" },
  { src: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80", alt: "Volunteer gathering" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80", alt: "Youth workshop" },
  { src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80", alt: "Cultural celebration" },
  { src: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&q=80", alt: "Team building" },
]

export function MediaPageContent() {
  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Press & Stories</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-foreground mb-8 tracking-tight">Media</h1>
            <div className="w-16 h-px bg-amber-400 mb-8" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">Stories of impact, coverage of our work, and moments captured across our journey.</p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
        <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Featured</h2>
        <div className="w-12 h-px bg-amber-400 mb-16" />
        <Link href={featured.href} className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <Image src={featured.image} alt={featured.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500 mb-2">{featured.source} — {featured.date}</p>
            <h3 className="text-2xl md:text-3xl font-light text-foreground mb-4 tracking-tight group-hover:text-amber-500 transition-colors">{featured.title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all underline underline-offset-4 decoration-1">
              Read More
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </section>

      {/* Articles */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Latest Coverage</h2>
          <div className="w-12 h-px bg-amber-400 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {articles.map((a) => (
              <Link key={a.title} href={a.href} className="group">
                <div className="relative aspect-[16/10] mb-6 overflow-hidden bg-muted">
                  <Image src={a.image} alt={a.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                </div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500 mb-2">{a.source} — {a.date}</p>
                <h3 className="text-xl font-medium text-foreground mb-3 group-hover:text-amber-500 transition-colors">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-4 tracking-tight">Gallery</h2>
            <div className="w-12 h-px bg-amber-400 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((img) => (
              <div key={img.alt} className="relative aspect-square overflow-hidden bg-muted group">
                <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6 tracking-tight">Press Enquiries</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">For media enquiries, interview requests, or press materials, please reach out to our communications team.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all underline underline-offset-4 decoration-1">
              Contact Us
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

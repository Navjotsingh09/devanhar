import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-6 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          {/* Left column */}
          <div className="pb-8 lg:pb-16">
            {/* Announcement strip */}
            <div className="hero-animate-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-[hsl(43,100%,29%)] tracking-wide uppercase">
                Empowering the next generation of Gursikhs
              </span>
            </div>

            <h1 className="hero-animate-2 text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.08] tracking-tight mb-6">
              Empower, Develop &amp;{" "}
              <br className="hidden md:block" />
              Create Through{" "}
              <br className="hidden md:block" />
              <span className="text-primary">Sikh Values</span>
            </h1>

            <p className="hero-animate-3 text-base text-muted-foreground leading-relaxed max-w-md mb-8">
              We are a charity based in Birmingham (UK) that aims to empower
              this and future generations with the knowledge, experience and
              confidence to grow spiritually and make positive change.
            </p>

            <div className="hero-animate-4 flex items-center gap-5">
              <Link href="/#contact">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 py-5 text-sm font-medium">
                  Get Involved <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary transition-colors">
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                </span>
                Learn about Devanhaar
              </Link>
            </div>

          </div>

          {/* Right column */}
          <div className="relative hero-animate-5">
            <div className="relative rounded-3xl overflow-hidden hover-zoom aspect-[4/5] lg:aspect-[3/4]">
              <Image
                src="https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&q=80"
                alt="Devanhaar community event"
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div data-animate className="flex items-center gap-8 mt-10 pt-8 border-t border-border">
          <div>
            <p className="text-2xl font-bold text-foreground">500+</p>
            <p className="text-xs text-muted-foreground">Annual Campers</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-2xl font-bold text-foreground">25+</p>
            <p className="text-xs text-muted-foreground">University Talks</p>
          </div>
        </div>
      </div>
    </section>
  )
}

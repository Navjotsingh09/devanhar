import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-6 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          {/* Left column */}
          <div className="pb-8 lg:pb-16">
            {/* Announcement strip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-primary tracking-wide uppercase">
                Building Communities Through Sikh Values
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.08] tracking-tight mb-6">
              Creating, Developing &amp;{" "}
              <br className="hidden md:block" />
              Empowering Through{" "}
              <br className="hidden md:block" />
              <span className="text-primary">Sikh Values</span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-md mb-8">
              Devanhaar is a Sikh-led organisation providing inclusive spaces
              for learning, growth, and service. Building stronger communities
              across the UK, Europe, and beyond.
            </p>

            <div className="flex items-center gap-5">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 py-5 text-sm font-medium">
                Get Involved <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button
                type="button"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary transition-colors">
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                </span>
                Learn about Devanhaar
              </button>
            </div>

            {/* Metrics row - matches Agridex "Tonnes of grain / ~160,514" */}
            <div className="flex items-baseline gap-12 mt-14 pt-8 border-t border-border">
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-primary mb-1">
                  {">"} Community Members
                </p>
                <p className="text-3xl font-bold text-foreground tabular-nums">~5,000+</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-primary mb-1">
                  {">"} Programs Running
                </p>
                <p className="text-3xl font-bold text-foreground tabular-nums">10+</p>
              </div>
            </div>
          </div>

          {/* Right column - hero image like Agridex wheat */}
          <div className="relative hidden lg:flex justify-end">
            <div className="relative w-full max-w-lg aspect-[3/4]">
              <img
                src="https://api.dicebear.com/9.x/shapes/svg?seed=devanhaar-hero-image&backgroundColor=1a1f36"
                alt="Golden Temple Amritsar - Sikh heritage and community"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Fade at bottom like Agridex */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

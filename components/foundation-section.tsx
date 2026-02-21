import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FoundationSection() {
  return (
    <section id="foundation" className="py-24 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
              Devanhaar Foundation
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Devanhaar believes that education is key to empowering communities
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">
              We are committed to creating lasting change through education and
              sustainable community initiatives. Devanhaar understands that
              impact and service are essential pillars of our mission.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              By integrating Sikh values into our programmes and partnerships,
              Devanhaar strives to create a positive and lasting difference in
              communities and the individuals it serves.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base">
                Support Our Mission <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a
                href="mailto:info@devanhaar.com"
                className="text-sm text-primary hover:text-primary/80 transition-colors py-3"
              >
                info@devanhaar.com
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <img
              src="https://api.dicebear.com/9.x/shapes/svg?seed=devanhaar-foundation&backgroundColor=b6e3f4,c0aede,d1d4f9"
              alt="Sikh youth learning and participating in educational programs"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

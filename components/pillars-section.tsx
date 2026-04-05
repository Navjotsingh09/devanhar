import { Lightbulb, Flame, TrendingUp, Handshake } from "lucide-react"
import Image from "next/image"

const pillars = [
  {
    title: "Develop",
    description:
      "Develop skills, character, and foundations for generational success.",
    icon: <Lightbulb className="w-6 h-6" />,
    image: "/images/pillars/develop.jpg",
  },
  {
    title: "Elevate",
    description:
      "Raise ambition, standards, and impact in every area of life.",
    icon: <TrendingUp className="w-6 h-6" />,
    image: "/images/pillars/elevate.png",
  },
  {
    title: "Empower",
    description:
      "Provide confidence rooted in identity, values, and self-belief.",
    icon: <Flame className="w-6 h-6" />,
    image: "/images/pillars/empower.jpg",
  },
  {
    title: "Connect",
    description:
      "Create lifelong relationships centered in community, mentorship, and shared growth.",
    icon: <Handshake className="w-6 h-6" />,
    image: "/images/pillars/connect.jpg",
  },
]

export function PillarsSection() {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div data-animate className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.15em] text-primary/80 uppercase mb-4 border border-primary/30 rounded-full px-3 py-1">
            Our Pillars
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Develop. Elevate. Empower. Connect.
          </h2>
        </div>

        <div data-animate-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-2xl overflow-hidden min-h-[320px] flex flex-col justify-end"
            >
              <Image
                src={pillar.image}
                alt={pillar.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-8">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-5">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

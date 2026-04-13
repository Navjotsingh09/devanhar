import Image from "next/image"

const pillars = [
  {
    title: "Develop",
    description:
      "Develop skills, character, and foundations for generational success.",
    image: "/images/pillars/develop.jpg",
  },
  {
    title: "Elevate",
    description:
      "Raise ambition, standards, and impact in every area of life.",
    image: "/images/pillars/elevate.png",
  },
  {
    title: "Empower",
    description:
      "Provide confidence rooted in identity, values, and self-belief.",
    image: "/images/pillars/empower.jpg",
  },
  {
    title: "Connect",
    description:
      "Create lifelong relationships centered in community, mentorship, and shared growth.",
    image: "/images/pillars/connect.jpg",
  },
]

export function PillarsSection() {
  return (
    <section className="pt-16 pb-8 md:pt-32 md:pb-16 bg-background border-t border-border/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div data-animate className="text-center mb-10 md:mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.15em] text-primary/80 uppercase mb-4 border border-primary/30 rounded-full px-3 py-1">
            Our Pillars
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Develop. Elevate. Empower. Connect.
          </h2>
        </div>

        <div data-animate-stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-2xl border border-border bg-card p-5 md:p-8 hover:border-primary/30 transition-all duration-300"
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-primary/10 mb-3 md:mb-5 ring-1 ring-primary/10 group-hover:ring-primary/20 transition-colors">
                <Image
                  src={pillar.image}
                  alt={`${pillar.title} pillar`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base md:text-xl font-bold text-foreground mb-2 md:mb-3">
                {pillar.title}
              </h3>
              <p className="text-foreground/55 text-[13px] md:text-[15px] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

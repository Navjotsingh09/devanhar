import { ArrowRight } from "lucide-react"

const articles = [
  {
    source: "SikhNet",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    source: "The Sikh Messenger",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    source: "Sikh Press Association",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    source: "Basics of Sikhi",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    source: "Sikh2Inspire",
    description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
  },
  {
    source: "Asian Image",
    description:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
  },
]

const mediaBrands = [
  "SikhNet",
  "Sikh Press Association",
  "Basics of Sikhi",
  "Sikh2Inspire",
  "Asian Image",
  "The Sikh Messenger",
  "Sikh Channel",
  "Punjab2000",
]

export function MediaSection() {
  return (
    <section id="media" className="py-24 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            News
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Featured in Media
          </h2>
        </div>

        {/* Horizontal scroll row like Agridex */}
        <div className="relative mb-16">
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-5 overflow-x-auto pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {articles.map((article, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-72 group rounded-2xl border border-border bg-card p-7 hover:border-primary/30 transition-all flex flex-col justify-between min-h-[240px]"
              >
                <div>
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-primary mb-4">
                    featured on {article.source}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {article.description}
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors mt-5 pt-4 border-t border-border"
                >
                  Read article{" "}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Media logos bar - Agridex bottom strip */}
        <div className="border-t border-border pt-10">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {mediaBrands.map((brand, i) => (
              <span
                key={i}
                className="text-sm md:text-base font-semibold text-muted-foreground/30"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

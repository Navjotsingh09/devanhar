import { Instagram } from "lucide-react"
import {
  type KaursForum,
  kaursForums,
  kaursForumsDescription,
} from "@/components/camps/camp-shared-data"

export function KaursForumsSection() {
  const instagramForums = kaursForums.filter(
    (forum): forum is KaursForum & { instagramUrl: string } =>
      Boolean(forum.instagramUrl),
  )

  return (
    <section className="border-y border-border bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-6 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
            About the Kaurs Forums movement
          </h2>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {kaursForumsDescription.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 md:mt-16 md:pt-10">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Follow us on Instagram
              </p>
              <h3 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
                Kaurs Forum moments
              </h3>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Four local forum accounts
            </p>
          </div>

          <div
            className="overflow-hidden"
            role="region"
            aria-label="Kaurs Forum Instagram gallery"
          >
            <div className="flex w-max gap-4 motion-reduce:animate-none animate-[kaurs-forums-scroll_34s_linear_infinite]">
              {[false, true].map((duplicate) => (
                <div
                  key={duplicate ? "duplicate" : "primary"}
                  className="flex gap-4"
                  aria-hidden={duplicate || undefined}
                >
                  {instagramForums.map((forum) => (
                    <a
                      key={`${forum.location}-${duplicate ? "copy" : "main"}`}
                      href={forum.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Kaurs Forum ${forum.location} on Instagram`}
                      tabIndex={duplicate ? -1 : undefined}
                      className="group aspect-square w-56 flex-none overflow-hidden rounded-lg bg-muted shadow-sm outline-offset-4 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:w-64 md:w-[340px]"
                    >
                      <img
                        src={forum.image}
                        alt={`Kaurs Forum ${forum.location}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kaurs-forums-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.5rem)); }
        }
      `}</style>
    </section>
  )
}

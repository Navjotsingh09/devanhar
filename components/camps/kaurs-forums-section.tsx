import { Instagram } from "lucide-react"
import {
  type KaursForum,
  kaursForums,
  kaursForumsDescription,
} from "@/components/camps/camp-shared-data"

type InstagramForum = KaursForum & { instagramUrl: string }

const instagramForums = kaursForums.filter(
  (forum): forum is InstagramForum => Boolean(forum.instagramUrl),
)

function InstagramForumStrip({ forum }: { forum: InstagramForum }) {
  const handle = forum.instagramUrl.replace(/^https:\/\/www\.instagram\.com\//, "").replace(/\/$/, "")
  const tiles = Array.from({ length: 4 }, (_, index) => index)

  return (
    <section className="overflow-hidden border-t border-border py-10 first:border-t-0 md:py-14">
      <div className="container mx-auto mb-6 flex max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <div className="flex items-center gap-3">
          <Instagram className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-xl font-bold text-foreground md:text-2xl">
            Kaurs Forum {forum.location}
          </h3>
        </div>
        <a
          href={forum.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label={`Visit @${handle} on Instagram`}
        >
          @{handle}
        </a>
      </div>

      <div role="region" aria-label={`Kaurs Forum ${forum.location} Instagram gallery`}>
        <div className="flex w-max gap-4 motion-reduce:animate-none animate-[kaurs-forum-scroll_34s_linear_infinite]">
          {[false, true].map((duplicate) => (
            <div
              key={duplicate ? "duplicate" : "primary"}
              className="flex gap-4"
              aria-hidden={duplicate || undefined}
            >
              {tiles.map((index) => (
                <a
                  key={`${forum.location}-${duplicate ? "copy" : "main"}-${index}`}
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
    </section>
  )
}

export function KaursForumsSection() {
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
      </div>
    </section>
  )
}

export function KaursForumInstagramStrips() {
  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto mb-8 max-w-6xl px-6 lg:mb-10 lg:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Follow us on Instagram
        </p>
        <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
          Kaurs Forum moments
        </h2>
      </div>

      {instagramForums.map((forum) => (
        <InstagramForumStrip key={forum.location} forum={forum} />
      ))}

      <style>{`
        @keyframes kaurs-forum-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.5rem)); }
        }
      `}</style>
    </section>
  )
}

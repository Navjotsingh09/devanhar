import {
  kaursForums,
  kaursForumsDescription,
} from "@/components/camps/camp-shared-data"

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

        <div className="mt-12 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kaursForums.map((forum) => {
            const tile = (
              <img
                src={forum.image}
                alt={`Kaurs Forum ${forum.location}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )

            return forum.instagramUrl ? (
              <a
                key={forum.location}
                href={forum.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Kaurs Forum ${forum.location} on Instagram`}
                className="group aspect-square w-full max-w-[340px] overflow-hidden rounded-lg bg-muted shadow-sm outline-offset-4 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {tile}
              </a>
            ) : (
              <div
                key={forum.location}
                className="aspect-square w-full max-w-[340px] overflow-hidden rounded-lg bg-muted shadow-sm"
              >
                {tile}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

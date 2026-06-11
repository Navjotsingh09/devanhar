const VIDEOS = [
  {
    src: "/initiatives/padel-videos/padel-intro.mov",
    label: "Association introduction",
    featured: true,
  },
  {
    src: "/initiatives/padel-videos/padel-video-1.mov",
    label: "Match highlights",
    featured: false,
  },
  {
    src: "/initiatives/padel-videos/padel-video-2.mov",
    label: "Match highlights",
    featured: false,
  },
  {
    src: "/initiatives/padel-videos/padel-video-3.mov",
    label: "Match highlights",
    featured: false,
  },
]

export function PadelVideoGallery() {
  const featured = VIDEOS.filter((v) => v.featured)
  const clips = VIDEOS.filter((v) => !v.featured)

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
          On the court
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 md:mb-14">
          See us in action
        </h2>

        {/* Featured intro video */}
        {featured.map(({ src, label }) => (
          <div
            key={src}
            className="rounded-2xl overflow-hidden bg-muted mb-5 shadow-sm"
          >
            <video
              src={src}
              controls
              playsInline
              className="w-full aspect-video"
              aria-label={label}
            />
          </div>
        ))}

        {/* Match clip grid */}
        <div className="grid gap-5 sm:grid-cols-3">
          {clips.map(({ src, label }) => (
            <div
              key={src}
              className="rounded-2xl overflow-hidden bg-muted shadow-sm"
            >
              <video
                src={src}
                controls
                playsInline
                className="w-full aspect-video"
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

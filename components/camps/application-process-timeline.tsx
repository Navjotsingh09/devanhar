import type { ApplicationStep } from "./camp-shared-data"

interface ApplicationProcessTimelineProps {
  steps: ApplicationStep[]
  heading?: string
  subheading?: string
}

export function ApplicationProcessTimeline({
  steps,
  heading = "How the application process works",
  subheading = "From submitting your details to arriving at camp — here is exactly what to expect.",
}: ApplicationProcessTimelineProps) {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="max-w-3xl mb-12 md:mb-16">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
            Application process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {subheading}
          </p>
        </div>
        <ol className="relative border-l-2 border-border pl-8 md:pl-10 space-y-10">
          {steps.map((s) => (
            <li key={s.step} className="relative">
              <span className="absolute -left-[2.6rem] md:-left-[3.1rem] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(43,100%,29%)] text-white font-semibold text-sm">
                {s.step}
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {s.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

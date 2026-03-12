import { Instagram } from "lucide-react"

export function MediaSection() {
  return (
    <section id="media" className="py-24 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div data-animate className="mb-12">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
            Follow Us
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Latest from Instagram
          </h2>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Stay up to date with our latest events, camps, and community moments.
          </p>
        </div>

        <div data-animate className="rounded-2xl border border-border bg-card p-8 md:p-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">@devanhaar</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Follow us on Instagram for the latest updates, event highlights, and behind-the-scenes content.
          </p>
          <a
            href="https://www.instagram.com/devanhaar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Instagram className="h-4 w-4" />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}

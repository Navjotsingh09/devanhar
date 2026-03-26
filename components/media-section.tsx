"use client"

import { Instagram } from "lucide-react"
import Script from "next/script"

export function MediaSection() {
  return (
    <section id="media" className="py-24 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div data-animate className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
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
          <a
            href="https://www.instagram.com/devanhaar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-colors mt-6 md:mt-0 w-fit"
          >
            <Instagram className="h-4 w-4" />
            Follow @devanhaar
          </a>
          </div>

          {/* Live Instagram Feed Embed */}
          <div data-animate className="rounded-2xl border border-border bg-card overflow-hidden">
            <iframe
              src="https://www.instagram.com/devanhaar/embed"
              className="w-full border-0"
              height="800"
              scrolling="no"
              allowtransparency
              title="Devanhaar Instagram Feed"
            />
          </div>
          <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />

      </div>
    </section>
  )
}

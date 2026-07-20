"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { blogPosts, type Pillar } from "@/lib/blog"

const pillars: ("All" | Pillar)[] = ["All", "Develop", "Elevate", "Empower", "Connect"]

const pillarColors: Record<Pillar, string> = {
  Develop: "bg-blue-50 text-blue-700 border-blue-200",
  Elevate: "bg-purple-50 text-purple-700 border-purple-200",
  Empower: "bg-amber-50 text-amber-700 border-amber-200",
  Connect: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

export function InsightsListing() {
  const [active, setActive] = useState<"All" | Pillar>("All")

  const filtered =
    active === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.pillar === active)

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Tabs */}
        <div className="flex items-center gap-0 mb-12 border-b border-border overflow-x-auto">
          {pillars.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                tab === active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "All" ? "All Insights" : tab}
              {tab === active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/insights/${post.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-[280px] hover:border-primary/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${pillarColors[post.pillar]}`}
                  >
                    {post.pillar}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-5 border-t border-border mt-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">
            No insights in this category yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  )
}

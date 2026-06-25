import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { InsightsListing } from "@/components/insights-listing"

export const metadata: Metadata = {
  title: "Insights - Devanhaar",
  description:
    "Read the latest from Devanhaar \u2014 articles on education, empowerment, community, and Sikh youth development across the UK.",
}

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollAnimations />
      <Navbar />

      <section className="pt-32 pb-16 border-b border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Articles, updates, and stories from across our four pillars \u2014 Develop, Elevate, Empower, and Connect.
          </p>
        </div>
      </section>

      <InsightsListing />

      <FooterSection />
    </main>
  )
}

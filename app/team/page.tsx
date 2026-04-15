import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { Users, Bell, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Team Coming Soon | Devanhaar",
  description:
    "The Devanhaar team page is coming soon. Stay tuned to learn more about the sevadaars serving camps, education, and community initiatives across the UK.",
  openGraph: {
    title: "Team Coming Soon | Devanhaar",
    description:
      "The Devanhaar team page is coming soon. Stay tuned for more about the sevadaars behind our work.",
    url: "https://devanhaar.vercel.app/team",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/team" },
}

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main>
        <section className="min-h-[80vh] flex items-center justify-center bg-background">
          <div className="max-w-3xl mx-auto px-6 py-32 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-8">
              <Users className="w-3.5 h-3.5" />
              Sevadaars
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Team <span className="text-primary">Coming Soon</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We&apos;re preparing a dedicated page to introduce the sevadaars behind Devanhaar.
              It will be live soon with more about the people serving our camps, education, and
              community projects.
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Bell className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Full team profiles will be added soon</span>
            </div>

            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <Button asChild>
                <Link href="/contact">
                  Get Involved <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">Explore Our Projects</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

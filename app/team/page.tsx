import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { Users, Bell, ArrowRight, ShieldCheck } from "lucide-react"
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

        <section id="trustees" className="py-20 md:py-28 bg-muted/30 border-t border-border/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6">
                <ShieldCheck className="w-3.5 h-3.5" />
                Governance
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Our <span className="text-primary">Trustees</span>
              </h2>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Devanhaar is governed by a board of trustees who provide oversight,
                strategic direction, and ensure we deliver on our charitable purpose.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Mandeep Singh Narwal", role: "Chair of Trustees" },
                { name: "Baldev Singh", role: "Trustee" },
                { name: "Jitarun Singh Jandu", role: "Trustee" },
              ].map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-border/60 bg-background p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
                  <p className="mt-1 text-sm text-primary font-medium">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

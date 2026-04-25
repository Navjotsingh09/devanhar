import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { ShieldCheck, ArrowRight, Users, UserCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Safeguarding | Devanhaar",
  description:
    "Devanhaar's safeguarding policies for children, young people, and adults at risk. Approved by the Board of Trustees.",
  alternates: { canonical: "https://devanhaar.vercel.app/safeguarding" },
}

export default function SafeguardingPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Governance
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Safeguarding at Devanhaar
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Safeguarding is everyone&apos;s responsibility. Devanhaar is committed to protecting
              the welfare, rights, dignity, and safety of every child, young person, and adult at
              risk who engages with our programmes, camps, and projects.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/safeguarding/children"
                className="group rounded-2xl border border-border/60 bg-background p-8 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Safeguarding Children &amp; Young People</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  How Devanhaar protects children and young people who engage with our camps,
                  educational programmes, and community activities.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Read the policy <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link
                href="/safeguarding/adults"
                className="group rounded-2xl border border-border/60 bg-background p-8 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Safeguarding Adults at Risk</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  How Devanhaar protects adults at risk from abuse, neglect, and exploitation,
                  following the Making Safeguarding Personal approach.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Read the policy <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>

            <div className="mt-12 rounded-2xl border border-border/60 bg-muted/40 p-6 md:p-8">
              <h3 className="text-lg font-semibold mb-2">Report a Safeguarding Concern</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have a safeguarding concern relating to a child, young person, or adult at
                risk, please contact a Designated Safeguarding Lead without delay via{" "}
                <a href="mailto:safeguarding@devanhaar.com" className="text-primary font-medium hover:underline">
                  safeguarding@devanhaar.com
                </a>
                . In an emergency, where there is immediate risk of serious harm, call 999.
              </p>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

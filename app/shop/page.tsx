import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { ShoppingBag, Bell, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Shop Coming Soon | Devanhaar",
  description:
    "The Devanhaar shop is coming soon. Official Sikh merchandise to support education, camps, and community programmes across the UK.",
  openGraph: {
    title: "Shop Coming Soon | Devanhaar",
    description:
      "The Devanhaar shop is coming soon. Stay tuned for official merchandise that directly funds Sikh education and community programmes.",
    url: "https://devanhaar.vercel.app/shop",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/shop" },
}

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main>
        <section className="min-h-[80vh] flex items-center justify-center bg-background">
          <div className="max-w-3xl mx-auto px-6 py-32 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-8">
              <ShoppingBag className="w-3.5 h-3.5" />
              Official Merchandise
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Shop <span className="text-primary">Coming Soon</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We&apos;re working on something special. The Devanhaar shop will feature exclusive
              merchandise &mdash; with 100% of profits funding Sikh education, camps, and community
              programmes across the UK.
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Bell className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Stay tuned for the launch</span>
            </div>

            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <Button asChild>
                <Link href="/donate">
                  Donate Directly <ArrowRight className="w-4 h-4 ml-2" />
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

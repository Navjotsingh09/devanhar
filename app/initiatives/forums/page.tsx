import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Community Forums | Devanhaar",
  description: "Join local Sikh community forums across the UK.",
}

export default function ForumsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Community Forums</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Derby, London, and Birmingham community groups with regular meetups.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

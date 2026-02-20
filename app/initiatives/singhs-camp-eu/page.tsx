import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Singhs Camp EU | Devanhaar",
  description: "A European gathering celebrating Sikh brotherhood, spirituality, and community values.",
}

export default function SinghsCampEUPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Singhs Camp EU</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">A European gathering celebrating Sikh brotherhood, spirituality, and community values.</p>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">What to expect</h2>
            <p className="text-muted-foreground">Spiritual reflection, outdoor activities, and strong bonds across Europe.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

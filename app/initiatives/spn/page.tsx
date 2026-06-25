import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Sikh Professional Network | Devanhaar",
  description: "Connecting Sikh professionals across industries. Mentorship, networking, and career development.",
}

export default function SPNPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Sikh Professional Network</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Mentorship, networking, and career development for Sikh professionals.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

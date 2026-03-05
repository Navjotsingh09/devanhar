import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Sikh Web3 Initiative | Devanhaar",
  description: "Empowering Sikh communities through blockchain technology and Web3 innovation.",
}

export default function SWeb3Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Sikh Web3 Initiative</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Education, participation, and innovation in blockchain and Web3.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

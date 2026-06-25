import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FundraisersDirectoryContent } from "@/components/wolfrun/fundraisers-directory-content"

export const metadata: Metadata = {
  title: "Fundraisers — Wolf Run for Devanhaar",
  description:
    "Browse and support our fundraisers taking on the Wolf Run to raise money for Devanhaar. Every donation helps fund Sikh education, camps, and community programmes.",
  openGraph: {
    title: "Fundraisers — Wolf Run for Devanhaar",
    description: "Browse and support our Wolf Run fundraisers.",
  },
}

export default function FundraisersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollAnimations />
      <div className="pt-24">
        <FundraisersDirectoryContent />
      </div>
      <FooterSection />
    </main>
  )
}

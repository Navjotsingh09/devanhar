import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { WolfRunContent } from "@/components/wolfrun/wolfrun-content"

export const metadata: Metadata = {
  title: "Wolf Run for Devanhaar | Run Wild. Raise Funds.",
  description:
    "Join the Devanhaar pack for the Wolf Run — the UK's wildest obstacle run. Become a fundraiser, share your link, and collect sponsorships to support Sikh education, camps, and community programmes.",
  keywords: [
    "Wolf Run",
    "Devanhaar",
    "charity run",
    "fundraising",
    "Sikh charity",
    "obstacle run",
    "Singhs Camp UK",
    "Kaurs Camp UK",
    "sponsorship",
  ],
  openGraph: {
    title: "Wolf Run for Devanhaar | Run Wild. Raise Funds.",
    description:
      "Join the Devanhaar pack for the Wolf Run. Become a fundraiser and collect sponsorships to support Sikh education and community programmes.",
  },
}

export default function WolfRunPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollAnimations />
      <WolfRunContent />
      <FooterSection />
    </main>
  )
}

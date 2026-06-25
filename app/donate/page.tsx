import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { DonateContent } from "@/components/donate-content"
import { ScrollAnimations } from "@/components/scroll-animations"
export const metadata: Metadata = {
  title: "Donate | Support Devanhaar Sikh Charity",
  description:
    "Support the future of Sikh education, camps, and community programmes. Make a secure donation to Devanhaar and help empower Sikh youth across the UK.",
  keywords: [
    "donate Sikh charity",
    "donate Devanhaar",
    "support Sikh education",
    "Sikh camp donations",
    "charity donation UK",
    "Sikh youth funding",
    "Singhs Camp UK donation",
    "Sikhi Vidyala support",
  ],
  openGraph: {
    title: "Donate | Support Devanhaar",
    description:
      "Make a secure donation to support Sikh education, camps, and community programmes across the UK.",
    url: "https://devanhaar.vercel.app/donate",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/donate" },
}

export default function DonatePage() {
  return (
    <>
      <ScrollAnimations />
      <Navbar />
      <DonateContent />
      <FooterSection />
    </>
  )
}

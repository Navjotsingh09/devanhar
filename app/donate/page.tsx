import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { DonateContent } from "@/components/donate-content"

export const metadata: Metadata = {
  title: "Donate - Devanhaar",
  description:
    "Support the future of Sikh education, camps, and community programmes. Make a secure donation to Devanhaar.",
}

export default function DonatePage() {
  return (
    <>
      <Navbar />
      <DonateContent />
      <FooterSection />
    </>
  )
}

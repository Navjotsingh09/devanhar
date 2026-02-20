import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ContactContent } from "@/components/contact-content"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Contact Us | Devanhaar",
  description: "Get in touch with Devanhaar. We are here to help and support Sikh initiatives.",
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <ContactContent />
      <FooterSection />
    </>
  )
}

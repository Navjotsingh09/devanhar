import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Privacy Policy - Devanhaar",
  description: "Privacy Policy for Devanhaar.",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 13, 2025</p>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            <p>This Privacy Policy describes how Devanhaar collects, uses, and discloses your personal information when you visit or use our services from www.devanhaar.com. Please read this Privacy Policy carefully.</p>
            <h2>How We Collect and Use Your Personal Information</h2>
            <p>We collect personal information about you from a variety of sources including contact details, order information, account information, and customer support information.</p>
            <h3>Information We Collect about Your Usage</h3>
            <p>We may automatically collect certain information about your interaction with the Services including device information, browser information, and your IP address.</p>
            <h2>Cookies</h2>
            <p>Like many websites, we use Cookies on our Site to power and improve our Site and Services. Most browsers automatically accept Cookies by default, but you can set your browser to remove or reject Cookies.</p>
            <h2>How We Disclose Personal Information</h2>
            <p>In certain circumstances, we may disclose your personal information to third parties for contract fulfillment and other legitimate purposes subject to this Privacy Policy.</p>
            <h2>Security and Retention</h2>
            <p>No security measures are perfect or impenetrable. How long we retain your personal information depends on whether we need it to maintain your account, provide the Services, or comply with legal obligations.</p>
            <h2>Your Rights</h2>
            <p>You have the right to access, delete, correct, and port your personal information. Where we rely on consent, you may withdraw this consent.</p>
            <h2>Contact</h2>
            <p>Questions about this Privacy Policy can be sent to <a href="mailto:devanhaar-website@outlook.com">devanhaar-website@outlook.com</a> or 301 Hagley Road, ENG, DY9 0RJ, GB.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

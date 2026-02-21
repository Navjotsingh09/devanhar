import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Terms of Service - Devanhaar",
  description: "Terms of Service for Devanhaar.",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 13, 2025</p>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            <h2>Overview</h2>
            <p>This website is operated by Devanhaar. Devanhaar offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
            <h2>General Conditions</h2>
            <p>We reserve the right to refuse Service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.</p>
            <h2>Accuracy of Information</h2>
            <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only.</p>
            <h2>Modifications to the Service and Prices</h2>
            <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time.</p>
            <h2>Products or Services</h2>
            <p>Certain products or Services may be available exclusively online through the website. These products or Services may have limited quantities and are subject to return or exchange only according to our Refund Policy.</p>
            <h2>Third-Party Links</h2>
            <p>Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy of third-party materials or websites.</p>
            <h2>Personal Information</h2>
            <p>Your submission of personal information through the store is governed by our Privacy Policy. Please view our <a href="/privacy">Privacy Policy</a>.</p>
            <h2>Disclaimer of Warranties</h2>
            <p>We do not guarantee, represent or warrant that your use of our Service will be uninterrupted, timely, secure or error-free.</p>
            <h2>Governing Law</h2>
            <p>These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of the United Kingdom.</p>
            <h2>Changes to Terms of Service</h2>
            <p>You can review the most current version of the Terms of Service at any time at this page. We reserve the right to update, change or replace any part of these Terms of Service.</p>
            <h2>Contact Information</h2>
            <p>Questions about the Terms of Service should be sent to us at <a href="mailto:devanhaar-website@outlook.com">devanhaar-website@outlook.com</a>.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

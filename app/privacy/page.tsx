import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Privacy Policy - Devanhaar",
  description: "Devanhaar Privacy Policy (UK GDPR compliant).",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">UK GDPR Compliant · Version 1.0 · Approved 26 March 2026 · Reviewed Annually</p>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            <div className="not-prose mb-10 rounded-xl border border-border/60 bg-muted/40 p-5 text-sm">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div><dt className="font-semibold inline">Document Owner: </dt><dd className="inline text-muted-foreground">Governance Lead</dd></div>
                <div><dt className="font-semibold inline">Approved By: </dt><dd className="inline text-muted-foreground">Board of Trustees</dd></div>
                <div><dt className="font-semibold inline">Version: </dt><dd className="inline text-muted-foreground">1.0</dd></div>
                <div><dt className="font-semibold inline">Approval Date: </dt><dd className="inline text-muted-foreground">26.03.2026</dd></div>
                <div><dt className="font-semibold inline">Review Frequency: </dt><dd className="inline text-muted-foreground">Annual</dd></div>
              </dl>
            </div>

            <h2>1. Who We Are</h2>
            <p>Devanhaar is a registered charity in England and Wales and acts as the data controller responsible for your personal data under UK GDPR.</p>
            <ul>
              <li><strong>Registered Charity Number:</strong> 1203393</li>
              <li><strong>Registered address:</strong> 3 Waterside Drive, Langley, United Kingdom</li>
              <li><strong>Website:</strong> <a href="https://www.devanhaar.com">www.devanhaar.com</a></li>
            </ul>

            <h2>2. What Information We Collect</h2>
            <p>We collect personal data including contact details, safeguarding information, volunteer and DBS data, donation records, complaints data, photographs (with consent), and website usage data.</p>

            <h2>3. How We Use Your Information</h2>
            <p>We use data to deliver programmes, manage volunteers, process donations, safeguard participants, and meet legal obligations.</p>

            <h2>4. Lawful Basis for Processing</h2>
            <p>We rely on consent, contract, legal obligation, legitimate interests, and vital interests. Legitimate interests are balanced against individual rights.</p>

            <h2>5. Safeguarding and Special Category Data</h2>
            <p>We process special category data where necessary to safeguard individuals, handled securely and shared only when required.</p>

            <h2>6. Sharing Your Data</h2>
            <p>We do not sell data. Data may be shared with service providers, regulators, safeguarding authorities, and law enforcement where required.</p>

            <h2>7. International Data Transfers</h2>
            <p>Where data is processed outside the UK, appropriate safeguards such as adequacy decisions or standard contractual clauses are applied.</p>

            <h2>8. Data Storage and Security</h2>
            <p>We implement role-based access, multi-factor authentication, secure systems, restricted access, regular reviews, and breach procedures aligned to the 72-hour rule.</p>

            <h2>9. Data Retention</h2>
            <p>Data is retained only as long as necessary, including 6 years for financial records, 7 years for incidents, and safeguarding records per statutory guidance.</p>

            <h2>10. Your Rights</h2>
            <p>You have rights to access, correct, delete, restrict, and object to processing, and to withdraw consent.</p>

            <h2>11. Contact Us</h2>
            <p>
              <a href="mailto:Guvinder.sohal@devanhaar.com">Guvinder.sohal@devanhaar.com</a><br />
              Data Protection Lead, Devanhaar
            </p>

            <h2>12. Cookies</h2>
            <p>We use cookies to ensure functionality and improve user experience. Preferences can be managed via the cookie banner.</p>

            <h2>13. Automated Decision-Making</h2>
            <p>We do not carry out automated decision-making or profiling.</p>

            <h2>14. Complaints</h2>
            <p>You can complain to the ICO: <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a> | 0303 123 1113</p>

            <h2>15. Changes to This Policy</h2>
            <p>We may update this policy periodically.</p>

            <hr />
            <p className="text-sm text-muted-foreground">Policy Owner: Governance Lead · Review Frequency: Annual</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

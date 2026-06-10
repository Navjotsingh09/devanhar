import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Privacy Policy - Devanhaar",
  description: "Devanhaar Privacy Policy (UK GDPR compliant).",
}

type Block =
  | { t: "p"; c: string }
  | { t: "h3"; c: string }
  | { t: "ul"; c: string[] }
  | { t: "a"; label: string; href: string }

const sections: { h: string; blocks: Block[] }[] = [
  {
    h: "1. Introduction",
    blocks: [
      { t: "p", c: "Devanhaar (\"we\", \"our\", \"us\") is committed to protecting and respecting your privacy." },
      { t: "p", c: "Devanhaar is a registered charity in England and Wales under Charity Commission registration number 1203393. Our registered office address is Business Ledger, 3 Waterside Drive, Langley, Berkshire, SL3 6EZ." },
      { t: "p", c: "This Privacy Policy explains how we collect, use, store, process and protect personal information when you:" },
      { t: "ul", c: ["Visit our website", "Submit enquiries", "Register for events, camps, workshops or programmes", "Volunteer with us", "Make donations", "Subscribe to updates", "Participate in our activities", "Otherwise engage with our organisation"] },
      { t: "p", c: "We process personal data in accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, the Privacy and Electronic Communications Regulations (PECR), and other applicable laws." },
    ],
  },
  {
    h: "2. Information We Collect",
    blocks: [
      { t: "h3", c: "Personal Information" },
      { t: "p", c: "We may collect:" },
      { t: "ul", c: ["Full name", "Email address", "Telephone number", "Postal address", "Organisation, school, gurdwara or community affiliation", "Emergency contact information", "Parent or guardian information where required"] },
      { t: "h3", c: "Event and Programme Information" },
      { t: "p", c: "Where you register for a camp, event, workshop, programme or volunteer opportunity, we may collect:" },
      { t: "ul", c: ["Attendance records", "Dietary requirements", "Accessibility requirements", "Medical information relevant to participation", "Emergency contact information", "Consent forms", "Volunteer application information"] },
      { t: "h3", c: "Children's Data" },
      { t: "p", c: "As a youth-focused organisation, we collect and process personal information relating to children and young people participating in our camps, educational programmes, workshops and activities." },
      { t: "p", c: "We only collect and process children's personal information where:" },
      { t: "ul", c: ["Explicit consent has been provided by a parent or legal guardian where required;", "Processing is necessary for participation in an activity or programme;", "Processing is required to fulfil our safeguarding obligations; or", "Another lawful basis exists under UK GDPR."] },
      { t: "p", c: "Where consent is required, we take reasonable steps to verify that consent has been provided by a parent or legal guardian." },
      { t: "p", c: "If we become aware that personal information has been collected from a child without appropriate parental consent where such consent is required, we will take steps to delete the information as soon as reasonably practicable." },
      { t: "h3", c: "Safeguarding Information" },
      { t: "p", c: "To fulfil our safeguarding responsibilities, we may collect and process information relating to:" },
      { t: "ul", c: ["Welfare concerns", "Incident reports", "Risk assessments", "Emergency contacts", "Medical or accessibility requirements relevant to participation"] },
      { t: "p", c: "Such information is processed with enhanced confidentiality and access controls." },
      { t: "h3", c: "Donation Information" },
      { t: "p", c: "If you make a donation, we may collect:" },
      { t: "ul", c: ["Donor name", "Contact information", "Donation amount", "Gift Aid declarations (where applicable)", "Payment confirmation information"] },
      { t: "p", c: "We do not store full payment card details." },
      { t: "h3", c: "Technical Information" },
      { t: "p", c: "When you visit our website, we may automatically collect:" },
      { t: "ul", c: ["IP address", "Browser type and version", "Device information", "Operating system", "Website usage data", "Referring websites", "Session information", "Cookie identifiers"] },
    ],
  },
  {
    h: "3. How We Use Your Information",
    blocks: [
      { t: "p", c: "We use personal information to:" },
      { t: "ul", c: ["Respond to enquiries", "Process registrations", "Deliver camps, programmes and events", "Manage volunteers", "Administer donations and Gift Aid claims", "Communicate organisational updates", "Provide support and safeguarding services", "Improve website functionality and user experience", "Monitor participation and engagement", "Meet legal and regulatory obligations", "Protect participants, volunteers and staff", "Prevent fraud and misuse"] },
      { t: "p", c: "We will only process personal information where a lawful basis exists." },
    ],
  },
  {
    h: "4. Data Handling Policy",
    blocks: [
      { t: "h3", c: "Lawful Basis for Processing" },
      { t: "p", c: "We process personal information under one or more of the following lawful bases:" },
      { t: "ul", c: ["Consent — Where you have given us permission to process your information.", "Contract — Where processing is necessary to provide services, programmes or activities requested by you.", "Legitimate Interests — Where processing is necessary for the effective operation of Devanhaar and does not override your rights and freedoms.", "Legal Obligation — Where we are required to process information to comply with legal, regulatory or safeguarding obligations.", "Vital Interests — Where processing is necessary to protect the life, health or wellbeing of an individual."] },
      { t: "h3", c: "Data Storage and Security" },
      { t: "p", c: "We implement appropriate technical and organisational measures to protect personal information, including:" },
      { t: "ul", c: ["Secure systems and hosting", "Access controls", "Password protection", "Encryption where appropriate", "Staff and volunteer confidentiality obligations", "Regular security reviews"] },
      { t: "h3", c: "Data Sharing" },
      { t: "p", c: "We do not sell, rent or trade personal information." },
      { t: "p", c: "We may share information with:" },
      { t: "ul", c: ["Event and programme delivery partners", "Volunteer coordinators", "Professional advisers", "Payment processors", "Technology and website service providers", "Safeguarding authorities where legally required", "Regulatory bodies and law enforcement agencies where required by law"] },
      { t: "p", c: "All third parties are required to protect personal information appropriately." },
      { t: "h3", c: "International Transfers" },
      { t: "p", c: "Where personal information is transferred outside the United Kingdom, we will ensure appropriate safeguards are in place in accordance with UK GDPR requirements." },
      { t: "h3", c: "Data Retention" },
      { t: "p", c: "We retain personal information only for as long as necessary to:" },
      { t: "ul", c: ["Deliver our services and programmes", "Fulfil safeguarding obligations", "Meet legal and regulatory requirements", "Resolve disputes", "Maintain organisational records"] },
      { t: "p", c: "Retention periods may vary depending on the nature of the information." },
    ],
  },
  {
    h: "5. Analytics and Website Tracking",
    blocks: [
      { t: "p", c: "We use analytics and tracking technologies to understand how visitors use our website and to improve website performance, content and user experience." },
      { t: "h3", c: "Analytics Information Collected" },
      { t: "p", c: "Analytics information may include:" },
      { t: "ul", c: ["Website visits", "Pages viewed", "Session duration", "Navigation paths", "Traffic sources", "Device type", "Browser information", "Approximate geographic location", "User interactions"] },
      { t: "h3", c: "Analytics Providers" },
      { t: "p", c: "We may use services including:" },
      { t: "ul", c: ["Google Analytics", "Google Tag Manager", "Microsoft Clarity", "Other privacy-compliant analytics tools"] },
      { t: "h3", c: "Cookie-Based Tracking" },
      { t: "p", c: "Analytics tools may use cookies, pixels and similar technologies to collect information about website usage." },
      { t: "p", c: "Non-essential analytics cookies are only activated after consent has been provided through our cookie consent banner." },
      { t: "h3", c: "Legal Basis" },
      { t: "p", c: "Analytics and marketing cookies are processed on the basis of user consent." },
      { t: "p", c: "Website security and essential functionality monitoring may be processed under our legitimate interests." },
    ],
  },
  {
    h: "6. Marketing Communications",
    blocks: [
      { t: "p", c: "Where consent has been provided, we may send:" },
      { t: "ul", c: ["Event announcements", "Camp information", "Community updates", "Volunteer opportunities", "Newsletters", "Fundraising updates"] },
      { t: "p", c: "You may unsubscribe or withdraw consent at any time by following the instructions in our communications or contacting us directly." },
    ],
  },
  {
    h: "7. Your Rights",
    blocks: [
      { t: "p", c: "Under UK GDPR, you have the right to:" },
      { t: "ul", c: ["Request access to your personal information", "Request correction of inaccurate information", "Request deletion of your information", "Restrict processing", "Object to processing", "Request data portability", "Withdraw consent at any time", "Lodge a complaint with the Information Commissioner's Office (ICO)"] },
      { t: "p", c: "For more information about your rights, visit the ICO website." },
    ],
  },
  {
    h: "8. Contact Us",
    blocks: [
      { t: "p", c: "If you have any questions regarding this Privacy Policy or the way we process personal information, please contact:" },
      { t: "a", label: "contact@devanhaar.com", href: "mailto:contact@devanhaar.com" },
      { t: "p", c: "Registered Address: Business Ledger, 3 Waterside Drive, Langley, Berkshire, SL3 6EZ" },
      { t: "p", c: "Charity Number: 1203393" },
    ],
  },
  {
    h: "9. Complaints",
    blocks: [
      { t: "p", c: "If you are unhappy with how we process your personal information, please contact us first so we can attempt to resolve your concerns." },
      { t: "p", c: "You also have the right to lodge a complaint with the Information Commissioner's Office (ICO):" },
      { t: "a", label: "https://www.ico.org.uk", href: "https://www.ico.org.uk" },
    ],
  },
  {
    h: "10. Changes to This Policy",
    blocks: [
      { t: "p", c: "We may update this Privacy Policy from time to time to reflect changes in legal requirements, organisational practices or website functionality." },
      { t: "p", c: "Any updates will be published on this page together with the revised effective date." },
    ],
  },
]

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
            <p className="text-sm text-muted-foreground">UK GDPR Compliant · Last updated 10 June 2026</p>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            {sections.map((s, i) => (
              <div key={i}>
                <h2>{s.h}</h2>
                {s.blocks.map((b, j) => {
                  if (b.t === "p") return <p key={j}>{b.c}</p>
                  if (b.t === "h3") return <h3 key={j}>{b.c}</h3>
                  if (b.t === "a")
                    return (
                      <p key={j}>
                        <a href={b.href}>{b.label}</a>
                      </p>
                    )
                  return (
                    <ul key={j}>
                      {b.c.map((it, k) => (
                        <li key={k}>{it}</li>
                      ))}
                    </ul>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}

import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { FoundationPageContent } from "@/components/foundation-page-content"
import { FAQSection } from "@/components/faq-section"
import { CTABanner } from "@/components/cta-banner"

export const metadata: Metadata = {
  title: "The Foundation | Devanhaar Sikh Charity UK",
  description:
    "Learn about the Devanhaar Foundation — a UK Sikh charity rooted in seva, equality, and compassion. Empowering communities through education, Gurmat, and cultural preservation since 2017.",
  keywords: [
    "Devanhaar Foundation",
    "Sikh charity UK",
    "Sikh foundation",
    "seva charity",
    "Sikh education charity",
    "Sikh community organisation",
    "Gurmat charity UK",
    "Sikh heritage preservation",
  ],
  openGraph: {
    title: "The Foundation | Devanhaar",
    description:
      "Rooted in Sikh values of seva, equality, and compassion. Empowering communities through education and service since 2017.",
    url: "https://devanhaar.vercel.app/foundation",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/foundation" },
}

const foundationFAQs = [
  {
    question: "What is the Devanhaar Foundation?",
    answer:
      "The Devanhaar Foundation is a UK-registered Sikh charity dedicated to empowering communities through education, seva (selfless service), and the promotion of Sikh heritage and values. We run camps, academies, university talks, and community programmes.",
  },
  {
    question: "When was Devanhaar founded?",
    answer:
      "Devanhaar was established in 2017 with a mission to serve the Sikh community through education and Gurmat values. Since then, we have grown to impact over 10,000 lives across the UK and Europe.",
  },
  {
    question: "What are Devanhaar’s core pillars?",
    answer:
      "Our foundation is built on four pillars: Education (accessible learning programmes and skill development), Community (cultural events and mentorship), Wellbeing (mental, physical, and spiritual support), and Global Impact (extending our reach to underserved communities worldwide).",
  },
  {
    question: "Is Devanhaar a registered charity?",
    answer:
      "Yes. Devanhaar is a UK-registered charitable organisation. All donations go directly towards our initiatives including Singhs Camp, Sikhi Vidyala, university talks, and community programmes.",
  },
  {
    question: "How is Devanhaar funded?",
    answer:
      "Devanhaar is funded through voluntary donations from the Sangat and supporters. We are transparent about fund allocation and every contribution goes directly towards empowering Sikh youth and communities across the UK.",
  },
  {
    question: "What is the AGRI programme?",
    answer:
      "AGRI is Devanhaar’s most ambitious initiative, connecting sustainable agriculture with community development. It represents our commitment to innovative approaches that create lasting positive change in underserved regions.",
  },
]

export default function FoundationPage() {
  return (
    <div>
      <Navbar />
      <main>
        <FoundationPageContent />
        <FAQSection
          heading="Foundation FAQ"
          subheading="Common questions about the Devanhaar Foundation and our charitable mission."
          items={foundationFAQs}
        />
        <CTABanner
          heading="Support Our Mission"
          description="Every donation helps us empower more Sikh youth, run more camps, and expand our educational programmes across the UK and beyond."
          primaryLabel="Donate Now"
          primaryHref="/donate"
          secondaryLabel="Learn More"
          secondaryHref="/about"
          variant="dark"
        />
      </main>
      <FooterSection />
    </div>
  )
}

import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { TeamPageContent } from "@/components/team-page-content"
import { FAQSection } from "@/components/faq-section"
import { CTABanner } from "@/components/cta-banner"

export const metadata: Metadata = {
  title: "Our Team & Sevadaars | Devanhaar Sikh Charity",
  description:
    "Meet the dedicated sevadaars behind Devanhaar. Our team of passionate Sikh volunteers lead camps, university talks, Sikhi Vidyala, and community programmes across the UK.",
  keywords: [
    "Devanhaar team",
    "Sikh volunteers UK",
    "Sikh sevadaars",
    "Devanhaar leadership",
    "Sikh charity volunteers",
    "seva UK",
  ],
  openGraph: {
    title: "Our Team & Sevadaars | Devanhaar",
    description:
      "Meet the sevadaars powering Devanhaar Sikh education, camps, and community initiatives across the UK.",
    url: "https://devanhaar.vercel.app/team",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/team" },
}

const teamFAQs = [
  {
    question: "Who runs Devanhaar?",
    answer:
      "Devanhaar is run by a dedicated team of Sikh sevadaars from across the UK, with a strong presence in Birmingham. Our team includes professionals from diverse backgrounds who volunteer their time, skills, and energy to serve the Panth.",
  },
  {
    question: "How can I join the Devanhaar team?",
    answer:
      "We are always looking for passionate individuals. Whether you can help with camp logistics, content creation, education delivery, or admin — reach out through our contact page to express your interest in becoming a sevadaar.",
  },
  {
    question: "Are Devanhaar sevadaars paid?",
    answer:
      "No. All our team members are volunteers who give their time selflessly as seva. This is a core principle of how Devanhaar operates — everything is done with the spirit of serving the Sangat and the Guru.",
  },
  {
    question: "What skills do I need to volunteer?",
    answer:
      "We welcome people with all kinds of skills — from event management and teaching to graphic design, social media, cooking, and logistics. The most important quality is a genuine desire to serve the Sikh community.",
  },
  {
    question: "What makes the Devanhaar team unique?",
    answer:
      "Many of our sevadaars originally came from non-Amritdhari backgrounds, giving us a deep understanding of the challenges faced by the wider Sangat. This relatability helps us create meaningful spaces where everyone feels supported on their Sikhi journey.",
  },
]

export default function TeamPage() {
  return (
    <div>
      <Navbar />
      <main>
        <TeamPageContent />
        <FAQSection
          heading="Team & Volunteering FAQ"
          subheading="Learn about our sevadaars and how you can serve the community."
          items={teamFAQs}
        />
        <CTABanner
          heading="Join Our Sevadaar Family"
          description="We are always looking for passionate Sikhs who want to serve their community. Volunteer your skills and make a real difference with Devanhaar."
          primaryLabel="Get Involved"
          primaryHref="/contact"
          secondaryLabel="Our Projects"
          secondaryHref="/projects"
          variant="dark"
        />
      </main>
      <FooterSection />
    </div>
  )
}

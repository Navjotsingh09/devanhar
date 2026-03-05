import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ProjectsPageContent } from "@/components/projects-page-content"
import { FAQSection } from "@/components/faq-section"
import { CTABanner } from "@/components/cta-banner"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Our Projects & Initiatives | Devanhaar Sikh Charity",
  description:
    "Explore Devanhaar's eight live initiatives from Singhs Camp and Kaurs Camp to Sikhi Vidyala, Khalsa Catalyst, and university outreach across the UK.",
  keywords: [
    "Devanhaar projects",
    "Sikh camps UK",
    "Singhs Camp",
    "Kaurs Camp",
    "Sikhi Vidyala",
    "Khalsa Catalyst",
    "Sikh university outreach",
  ],
  openGraph: {
    title: "Our Projects & Initiatives | Devanhaar",
    description:
      "Eight community-led Sikh initiatives creating lasting impact across the UK and beyond.",
    url: "https://devanhaar.vercel.app/projects",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/projects" },
}

const projectsFAQs = [
  {
    question: "How many initiatives does Devanhaar run?",
    answer:
      "Devanhaar currently runs eight live initiatives: Singhs Camp, Kaurs Camp, Kids Camps, Sikhi Vidyala, Khalsa Catalyst, University Projects, Gurmat Academy, and Self Defence Academy. Each serves a unique purpose within our mission to develop, empower, elevate, and connect.",
  },
  {
    question: "Who can attend Devanhaar camps?",
    answer:
      "Our camps are open to young Sikhs from across the UK and Europe. Singhs Camp is for young men, Kaurs Camp is for young women, and Kids Camps caters to younger children. All are welcome regardless of their current level of Sikhi practice.",
  },
  {
    question: "What is Sikhi Vidyala?",
    answer:
      "Sikhi Vidyala is a structured weekly educational programme offering classes in Gurbani, Sikh history, Gurmukhi, and Sikh philosophy. It is designed for all ages and levels from beginners to those looking to deepen their understanding.",
  },
  {
    question: "How can I get involved with a project?",
    answer:
      "You can volunteer as a sevadaar, attend an event, or support us financially. Visit our contact page to express your interest, and our team will match you with the initiative that best suits your skills and availability.",
  },
  {
    question: "Are Devanhaar projects free to attend?",
    answer:
      "We strive to keep all our initiatives as accessible as possible. Camps have a small fee to cover logistics, food, and accommodation, but financial support is available so that no one is turned away due to cost.",
  },
]

export default function ProjectsPage() {
  return (
    <div>
      <Navbar />
      <ScrollAnimations />
      <main>
        <ProjectsPageContent />
        <FAQSection
          heading="Projects & Initiatives FAQ"
          subheading="Common questions about our camps, programmes, and how to get involved."
          items={projectsFAQs}
        />
        <CTABanner
          heading="Support Our Initiatives"
          description="Every donation helps us run camps, deliver educational programmes, and empower the next generation of Sikhs across the UK and beyond."
          primaryLabel="Donate Now"
          primaryHref="/donate"
          secondaryLabel="Get Involved"
          secondaryHref="/contact"
          variant="dark"
        />
      </main>
      <FooterSection />
    </div>
  )
}

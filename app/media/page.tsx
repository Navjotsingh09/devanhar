import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { MediaPageContent } from "@/components/media-page-content"
import { FAQSection } from "@/components/faq-section"
import { CTABanner } from "@/components/cta-banner"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Media & Press | Devanhaar Sikh Charity",
  description:
    "News, press coverage, and stories from Devanhaar. Read about our Sikh camps, university talks, community events, and the impact of our charitable work across the UK.",
  keywords: [
    "Devanhaar news",
    "Sikh charity news UK",
    "Devanhaar media",
    "Sikh community stories",
    "Singhs Camps news",
    "Sikh press coverage",
    "Devanhaar gallery",
    "Sikh events UK",
  ],
  openGraph: {
    title: "Media & Press | Devanhaar",
    description:
      "Stories of impact, press coverage, and moments captured across Devanhaar’s journey empowering Sikh communities.",
    url: "https://devanhaar.vercel.app/media",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/media" },
}

const mediaFAQs = [
  {
    question: "Can I use Devanhaar’s images or content?",
    answer:
      "Please contact our communications team before using any of our media assets. We are happy to provide high-resolution images and press materials for legitimate media coverage of our work.",
  },
  {
    question: "How can I submit a press enquiry?",
    answer:
      "For media enquiries, interview requests, or press materials, please use our contact form or email us directly. Our communications team typically responds within 48 hours.",
  },
  {
    question: "Does Devanhaar have a media kit?",
    answer:
      "Yes. We can provide logos, brand guidelines, high-resolution images, and background information about our charity and initiatives. Contact our team to request access.",
  },
  {
    question: "Can I cover a Devanhaar event?",
    answer:
      "We welcome media coverage of our events. Please reach out in advance so we can arrange access, provide context, and ensure the privacy and consent of attendees is respected.",
  },
  {
    question: "How can I share my Devanhaar story?",
    answer:
      "If you have been positively impacted by Devanhaar’s initiatives and would like to share your story, we would love to hear from you. Get in touch through our contact page.",
  },
]

export default function MediaPage() {
  return (
    <div>
      <Navbar />
      <ScrollAnimations />
      <main>
        <MediaPageContent />
        <FAQSection
          heading="Media & Press FAQ"
          subheading="Information for journalists, content creators, and media partners."
          items={mediaFAQs}
        />
        <CTABanner
          heading="Share Our Story"
          description="Help us amplify the voices and stories of the Sikh community. Follow us on social media or get in touch to collaborate."
          primaryLabel="Contact Us"
          primaryHref="/contact"
          secondaryLabel="View Projects"
          secondaryHref="/projects"
          variant="light"
        />
      </main>
      <FooterSection />
    </div>
  )
}

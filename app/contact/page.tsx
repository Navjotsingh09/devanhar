import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ContactContent } from "@/components/contact-content"
import { FooterSection } from "@/components/footer-section"
import { FAQSection } from "@/components/faq-section"

export const metadata: Metadata = {
  title: "Contact Us | Devanhaar Sikh Charity",
  description:
    "Get in touch with Devanhaar. Reach out about volunteering, partnerships, donations, camp registration, or general enquiries. We are here to help.",
  keywords: [
    "contact Devanhaar",
    "Sikh charity contact",
    "volunteer Sikh charity",
    "Devanhaar enquiries",
    "Sikh organisation contact UK",
  ],
  openGraph: {
    title: "Contact Us | Devanhaar",
    description:
      "Get in touch with the Devanhaar team. Enquiries about volunteering, camps, donations, and partnerships welcome.",
    url: "https://devanhaar.vercel.app/contact",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/contact" },
}

const contactFAQs = [
  {
    question: "How quickly will Devanhaar respond to my enquiry?",
    answer:
      "We aim to respond to all enquiries within 48 hours. For urgent matters, please indicate this in your message and we will prioritise your request.",
  },
  {
    question: "Can I visit Devanhaar in person?",
    answer:
      "While we do not have a public office for drop-ins, we hold regular events and programmes across the UK. Follow us on social media for upcoming events near you.",
  },
  {
    question: "How do I sign up for a camp or programme?",
    answer:
      "Camp and programme registration opens seasonally. Follow us on Instagram @devanhaar or check our initiatives pages for registration links and announcements.",
  },
  {
    question: "I want to partner with Devanhaar. How do I start?",
    answer:
      "We welcome partnerships with organisations, universities, and businesses that share our values. Use the contact form to outline your proposal and our partnerships team will be in touch.",
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <ContactContent />
      <FAQSection
        heading="Contact FAQ"
        subheading="Common questions about reaching out to Devanhaar."
        items={contactFAQs}
      />
      <FooterSection hideContact />
    </>
  )
}

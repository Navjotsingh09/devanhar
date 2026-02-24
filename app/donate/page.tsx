import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { DonateContent } from "@/components/donate-content"
import { FAQSection } from "@/components/faq-section"

export const metadata: Metadata = {
  title: "Donate | Support Devanhaar Sikh Charity",
  description:
    "Support the future of Sikh education, camps, and community programmes. Make a secure donation to Devanhaar and help empower Sikh youth across the UK.",
  keywords: [
    "donate Sikh charity",
    "donate Devanhaar",
    "support Sikh education",
    "Sikh camp donations",
    "charity donation UK",
    "Sikh youth funding",
    "Singhs Camp donation",
    "Sikhi Vidyala support",
  ],
  openGraph: {
    title: "Donate | Support Devanhaar",
    description:
      "Make a secure donation to support Sikh education, camps, and community programmes across the UK.",
    url: "https://devanhaar.vercel.app/donate",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/donate" },
}

const donateFAQs = [
  {
    question: "How are my donations used?",
    answer:
      "Every donation goes directly towards funding our initiatives — Singhs Camp, Kaurs Camp, Kids Camps, Sikhi Vidyala, university talks, Gurmat academy, and community outreach. We are fully transparent about how funds are allocated.",
  },
  {
    question: "Is my donation tax-deductible?",
    answer:
      "As a registered UK charity, donations to Devanhaar may qualify for Gift Aid, which allows us to claim an extra 25p for every £1 you donate at no extra cost to you. Ensure you tick the Gift Aid box when donating.",
  },
  {
    question: "Can I set up a recurring donation?",
    answer:
      "Yes. Regular monthly donations help us plan ahead and sustain our programmes long-term. You can set up a recurring donation through our secure payment platform.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Absolutely. All payments are processed through our secure payment partner with industry-standard encryption. Your financial details are never stored on our servers.",
  },
  {
    question: "Can I donate in memory of someone?",
    answer:
      "Yes. We welcome donations made in tribute or memory of loved ones. Please include a note with your donation and we will ensure it is acknowledged appropriately.",
  },
]

export default function DonatePage() {
  return (
    <>
      <Navbar />
      <DonateContent />
      <FAQSection
        heading="Donation FAQ"
        subheading="Everything you need to know about supporting Devanhaar."
        items={donateFAQs}
      />
      <FooterSection />
    </>
  )
}

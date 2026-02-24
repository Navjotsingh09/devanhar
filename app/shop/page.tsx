import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ShopContent } from "@/components/shop-content"
import { FAQSection } from "@/components/faq-section"
import { CTABanner } from "@/components/cta-banner"

export const metadata: Metadata = {
  title: "Shop | Devanhaar Sikh Merchandise & Apparel",
  description:
    "Shop official Devanhaar merchandise. Every purchase supports Sikh education, camps, and community programmes across the UK. T-shirts, hoodies, books, pins and more.",
  keywords: [
    "Devanhaar shop",
    "Sikh merchandise UK",
    "Sikh clothing",
    "Sikh t-shirts",
    "Devanhaar merch",
    "support Sikh charity",
    "Sikh gifts",
    "Khalsa apparel",
  ],
  openGraph: {
    title: "Shop | Devanhaar Merchandise",
    description:
      "Official Devanhaar merchandise. Every purchase directly funds Sikh education, camps, and community programmes across the UK.",
    url: "https://devanhaar.vercel.app/shop",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/shop" },
}

const shopFAQs = [
  {
    question: "Where do profits from the shop go?",
    answer:
      "100% of profits from our merchandise go directly towards funding Devanhaar's charitable initiatives — including Singhs Camp, Sikhi Vidyala, university talks, and community outreach programmes across the UK.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently we ship across the UK. International shipping may be available for select items. Please contact us for enquiries about delivery outside the UK.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "We accept returns within 14 days of delivery for unworn, unwashed items in their original packaging. Please contact our team to arrange a return or exchange.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "UK orders are typically delivered within 3–5 working days. You will receive a confirmation email with tracking details once your order has been dispatched.",
  },
  {
    question: "Can I suggest new merchandise designs?",
    answer:
      "We love hearing from the Sangat! If you have ideas for new designs or products, reach out through our contact page or social media channels.",
  },
]

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main>
        <ShopContent />
        <FAQSection
          heading="Shop FAQ"
          subheading="Everything you need to know about ordering Devanhaar merchandise."
          items={shopFAQs}
        />
        <CTABanner
          heading="Prefer to Donate Directly?"
          description="If you'd rather make a direct contribution, every donation helps fund our Sikh education camps, Sikhi Vidyala, and community programmes."
          primaryLabel="Donate Now"
          primaryHref="/donate"
          secondaryLabel="Our Projects"
          secondaryHref="/projects"
          variant="dark"
        />
      </main>
      <FooterSection />
    </>
  )
}

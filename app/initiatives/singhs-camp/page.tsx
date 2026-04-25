import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { SinghsCampHeroWithApply } from "@/components/camps/singhs-camp-hero-with-apply"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { ScrollingGallery } from "@/components/camps/scrolling-gallery"
import { ApplicationProcessTimeline } from "@/components/camps/application-process-timeline"
import {
  singhsCorePillars,
  applicationSteps,
  singhsCampDescription,
  singhsGalleryImages,
} from "@/components/camps/camp-shared-data"

export const metadata = {
  title: "Singhs Camps | Devanhaar",
  description:
    "Singhs Camps — UK and Europe residential retreats for Adult Sikh men. Apply for the UK camp or register your interest for Europe 2027.",
}

const faqs = [
  {
    question: "Who can apply for camp?",
    answer:
      "Camp is open to all males aged 16 and above. It is irrelevant what your background is or where you are in your journey, as the sole aim of the camp is for us in a non-judgmental fashion to come together as brothers and move forward together as one.",
  },
  {
    question: "When do camp applications come out?",
    answer:
      "Camp details are usually released at the beginning of the calendar year. Keep an eye on our social media channels (@singhscampuk, @singhscampeurope) and website for updates.",
  },
  {
    question: "What can I expect at camp?",
    answer:
      "For one lots of fun and banter. A typical day at camp starts with Amrit Vela (early morning prayer in congregation) and is filled with a variety of activities, talks, and experiences. The camp is centred around building brotherhood, providing moments for self-reflection, and most importantly helping build a deeper connection with Maharaaj.",
  },
  {
    question: "I don’t know about Sikhi, is camp right for me?",
    answer:
      "Definitely! Camp is tailored towards individuals who may not have a lot of knowledge of Sikhi and just want to learn more. We do our best to guide you through the basics, but really it is an experience, a word you might see us using a lot. It is a personal journey and we do our best to support that.",
  },
  {
    question: "What are the facilities like at Singhs Camp?",
    answer:
      "Singhs Camp is held in the beautiful Welsh countryside, with access to both indoor and outdoor spaces suitable for all activities.",
  },
  {
    question: "What is the accommodation like?",
    answer:
      "Accommodation is typically shared, mostly in rooms or, if opted for in the application form, in yurts. Note: this location is a hot spot in the summer for group outings and Air BnB bookings.",
  },
  {
    question: "What’s the food like at camp?",
    answer:
      "A dedicated langar team prepares fresh meals throughout the day. Food is made on-site and caters for all dietary requirements. If you have any allergies or dietary needs, these should be clearly stated in your application.",
  },
  {
    question: "Can I come for one day?",
    answer:
      "Unfortunately you cannot attend as a day camper. Safety is a top priority for us and it is important that we manage numbers and keep track of all those on site.",
  },
]

export default function SinghsCampLandingPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <SinghsCampHeroWithApply />

        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            History
          </h2>
          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            {singhsCampDescription.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <CorePillarsGrid pillars={singhsCorePillars} />

        <ScrollingGallery images={singhsGalleryImages} heading="Moments from past camps" />

        <ApplicationProcessTimeline steps={applicationSteps} />

        <FAQSection items={faqs} />
      </main>
      <FooterSection />
    </>
  )
}

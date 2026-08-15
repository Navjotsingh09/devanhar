import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { CampLandingHero } from "@/components/camps/camp-landing-hero"
import { CorePillarsGrid } from "@/components/camps/core-pillars-grid"
import { ScrollingGallery } from "@/components/camps/scrolling-gallery"
import { ApplicationProcessTimeline } from "@/components/camps/application-process-timeline"
import {
  KaursForumInstagramStrips,
  KaursForumsSection,
} from "@/components/camps/kaurs-forums-section"
import {
  kaursCorePillars,
  applicationSteps,
  kaursCampDescription,
  kaursGalleryImages,
} from "@/components/camps/camp-shared-data"

export const metadata = {
  title: "Kaurs Camps | Devanhaar",
  description:
    "Kaurs Camps — UK and Europe residential retreats for Adult Sikh women. Apply for the UK camp or register your interest for Europe 2027.",
}

const faqs = [
  {
    question: "Who can attend Kaurs Camps?",
    answer:
      "Kaurs Camps are open to Adult Sikh women at any stage of their spiritual journey — whether firmly grounded in Sikhi, returning to it, or beginning to explore it for the first time.",
  },
  {
    question: "What is the difference between the UK and EU camps?",
    answer:
      "The UK camp runs annually and applications open each year. The EU camp is launching in 2027; you can register your interest to be the first to hear when applications open.",
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Each day begins early with Amrit Vela and is filled with kirtan, simran, talks, workshops, langar and quiet time for reflection.",
  },
]

export default function KaursCampLandingPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <CampLandingHero
          eyebrow="Sisterhood Retreat"
          title="Kaurs Space"
          subtitle="A space for Adult Sikh women to reconnect with Sikhi, build lifelong sisterhood and step away from the noise of everyday life."
          heroImage="/initiatives/kaurs-camp-top.jpg"
          ctas={[
            {
              label: "Kaurs Camp UK",
              description:
                "Our flagship UK residential. Get in touch to be the first to hear when applications open.",
              href: "/initiatives/kaurs-camp/uk",
              ctaLabel: "Apply now",
              primary: true,
            },
            {
              label: "Kaurs Camp EU 2027",
              description:
                "Our first European retreat is launching in 2027. Be the first to hear when applications open.",
              href: "/initiatives/kaurs-camp/eu",
              ctaLabel: "Register interest",
            },
          ]}
        />

        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            About The Kaur's Space
          </h2>
          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            {kaursCampDescription.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <KaursForumsSection />

        <CorePillarsGrid pillars={kaursCorePillars} />

        <ScrollingGallery images={kaursGalleryImages} heading="Moments from past camps" />

        <KaursForumInstagramStrips />

        <ApplicationProcessTimeline steps={applicationSteps} />

        <FAQSection items={faqs} />
      </main>
      <FooterSection />
    </>
  )
}

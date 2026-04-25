import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FAQSection } from "@/components/faq-section"
import { CampLandingHero } from "@/components/camps/camp-landing-hero"
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
    question: "Who can attend Singhs Camps?",
    answer:
      "Singhs Camps are open to Adult Sikh men at any stage of their spiritual journey — whether firmly grounded in Sikhi, returning to it, or beginning to explore it for the first time.",
  },
  {
    question: "What is the difference between the UK and EU camps?",
    answer:
      "The UK camp has been running since 2019 and applications are open now. The EU camp is launching in 2027; you can register your interest to be the first to hear when applications open.",
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Each day begins early with Amrit Vela and is filled with kirtan, simran, talks, workshops, sport, langar and quiet time for reflection.",
  },
]

export default function SinghsCampLandingPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen">
        <CampLandingHero
          eyebrow="Brotherhood Retreat"
          title="Singhs Camps"
          subtitle="A space for Adult Sikh men to reconnect with Sikhi, build lifelong brotherhood and step away from the noise of everyday life."
          heroImage="/initiatives/singhs-camp-top.jpg"
          ctas={[
            {
              label: "Singhs Camp UK",
              description:
                "Our flagship UK residential. Applications are open — secure your place now.",
              href: "/initiatives/singhs-camp/uk",
              ctaLabel: "Apply now",
              primary: true,
            },
            {
              label: "Singhs Camp EU 2027",
              description:
                "Our first European retreat is launching in 2027. Be the first to hear when applications open.",
              href: "/initiatives/singhs-camp/eu",
              ctaLabel: "Register interest",
            },
          ]}
        />

        <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            About the Singhs Camps movement
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

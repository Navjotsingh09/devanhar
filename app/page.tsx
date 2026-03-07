import { ScrollAnimations } from "@/components/scroll-animations"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { MetricsTicker } from "@/components/metrics-ticker"
import { PillarsSection } from "@/components/pillars-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PlatformSection } from "@/components/platform-section"
// PartnershipBanner removed per content update
import { ProjectsSection } from "@/components/projects-section"
import { TeamSection } from "@/components/team-section"
import { FoundationSection } from "@/components/foundation-section"
import { MediaSection } from "@/components/media-section"
import { FooterSection } from "@/components/footer-section"
import { FAQSection } from "@/components/faq-section"

const homeFAQs = [
  {
    question: "What is Devanhaar?",
    answer: "Devanhaar is a UK-based Sikh charity that empowers young Sikhs through educational camps, university talks, Gurmat academies, and community-building initiatives. Our mission is to develop, empower, elevate and connect."
  },
  {
    question: "How can I get involved with Devanhaar?",
    answer: "There are many ways to contribute \u2014 you can volunteer as a sevadaar at our camps, attend our university talks, enrol in Sikhi Vidyala, donate to support our projects, or simply spread the word to your Sangat."
  },
  {
    question: "Are Devanhaar events open to everyone?",
    answer: "Yes, our events and initiatives are open to all Sikhs regardless of background, experience, or level of practice. We create inclusive, welcoming spaces for everyone on their journey."
  },
  {
    question: "How are donations used?",
    answer: "Every donation directly supports our initiatives \u2014 from Singhs Camp and university programmes to Sikhi Vidyala and community outreach. We are transparent about how funds are allocated across our projects."
  },
  {
    question: "Where is Devanhaar based?",
    answer: "Devanhaar is a registered UK-based charity. We run initiatives across the UK, with camps, talks and programmes held at various locations nationwide."
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollAnimations />
      <Navbar />
      <HeroSection />
      <MetricsTicker />
      <PillarsSection />
      <TestimonialsSection />
      <PlatformSection />
      {/* Partnership banner removed per content update */}
      <ProjectsSection />
      <TeamSection />
      <FoundationSection />
      <MediaSection />
      <FAQSection items={homeFAQs} />
      <FooterSection />
    </main>
  )
}

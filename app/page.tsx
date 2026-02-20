import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { MetricsTicker } from "@/components/metrics-ticker"
import { LogoTicker } from "@/components/logo-ticker"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PlatformSection } from "@/components/platform-section"
import { PartnershipBanner } from "@/components/partnership-banner"
import { ProjectsSection } from "@/components/projects-section"
import { TeamSection } from "@/components/team-section"
import { FoundationSection } from "@/components/foundation-section"
import { MediaSection } from "@/components/media-section"
import { FooterSection } from "@/components/footer-section"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <MetricsTicker />
      <LogoTicker />
      <TestimonialsSection />
      <PlatformSection />
      <PartnershipBanner />
      <ProjectsSection />
      <TeamSection />
      <FoundationSection />
      <MediaSection />
      <FooterSection />
    </main>
  )
}

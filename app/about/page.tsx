import type { Metadata } from "next"
import Link from "next/link"
import { Heart, Users, Sparkles, ArrowRight, Lightbulb, Flame, TrendingUp, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { DonateButton } from "@/components/donate-button"
import { OurStorySection } from "@/components/our-story-section"
import { getSiteImage } from "@/lib/site-images-server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About Us - Devanhaar",
  description:
    "With Guru Sahib's Kirpa, since its inception, Devanhaar has grown to develop multiple projects UK wide.",
}

const stats = [
  { number: "Est. 2019", label: "UK Based with Global Reach." },
  { number: "9", label: "Live Projects" },
  { number: "800+", label: "Adult Campers Annually" },
  { number: "3000+", label: "People Impacted Annually" },
]

const values = [
  {
    icon: Lightbulb,
    title: "Develop",
    description:
      "Develop skills, character, and foundations for generational success. We invest in structured programmes that nurture growth at every stage of life.",
  },
  {
    icon: TrendingUp,
    title: "Elevate",
    description:
      "Raise ambition, standards, and impact in every area of life. We challenge our community to aim higher and achieve more through Sikhi-centred guidance.",
  },
  {
    icon: Flame,
    title: "Empower",
    description:
      "Provide confidence rooted in identity, values, and self-belief. Our projects equip individuals with the tools to lead with conviction and purpose.",
  },
  {
    icon: Handshake,
    title: "Connect",
    description:
      "Create lifelong relationships centred in community, mentorship, and shared growth. We build bonds that transcend any single event or programme.",
  },
]

export default async function AboutPage() {
  const heroImg = await getSiteImage("hero", "about", "/images/about-hero.webp")

  return (
    <>
      <Navbar />
      <main className="pt-28">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                  About Devanhaar
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
                  Empowering Sikhs to Grow, Lead & Connect
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  A UK-based charity that empowers Sikhs with the knowledge,
                  experiences and confidence to grow academically, professionally
                  and spiritually.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <DonateButton
                    source="about-hero"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base w-full sm:w-auto"
                  />
                  <Button
                    asChild
                    variant="outline"
                    className="bg-transparent rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5 w-full sm:w-auto"
                  >
                    <Link href="/#about">Our Projects</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                  {heroImg ? (
                    <img src={heroImg} alt="About Devanhaar" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                  <div className="absolute inset-0 backdrop-blur-3xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-10 h-10 text-primary/40" />
                    </div>
                  </div>
                    </>
                  )}
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg hidden md:block">
                  <p className="text-3xl font-bold">2019</p>
                  <p className="text-sm text-primary-foreground/80">
                    Year Founded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-[#1a1f2e]">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </p>
                  <p className="text-sm text-white/60 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story - Scroll-Driven Horizontal Narrative */}
        <OurStorySection />

        {/* Purpose Section - Image Left, Text Right */}
        <section className="py-20 md:py-28 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-muted via-primary/5 to-primary/15">
                <img src="/images/about-purpose.jpg" alt="Creating Meaningful Spaces" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                  Our Purpose
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance mb-6">
                  Creating Meaningful Spaces for Growth in Sikhi
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  At Devanhaar, our mission is to create meaningful spaces for
                  Sangat to grow in Sikhi, connect with one another, and develop
                  into strong, confident individuals. We continue to run Sikhi
                  camps for children, alongside our Singhs and Kaurs
                  camps, which provide a unique space for Sikhs to strengthen
                  their identity and build lifelong bonds.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our university talks serve as a platform for students to
                  engage with Gurmat and navigate challenges through a Sikhi
                  lens. With the Sikhi Vidyala, we are committed to training and
                  nurturing the next generation of Parchaariks.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We also run a Gurmat school for the youth, recognising that
                  investing in them means investing in the future of the Panth.
                  Through all these projects, we strive to create a thriving
                  community where Sikhs remain grounded in Sikhi and connected
                  to Guru Sahib.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our People Section - Text Left, Image Right */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                  Our People
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance mb-6">
                  Powered by Sevadaars Across the UK
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We are powered by a diverse team of sevadaars from across the
                  UK, with a strong presence in Birmingham. Devanhaar is
                  family-orientated -- this close bond allows us to support each
                  other and take on a wide range of projects with dedication and
                  passion.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  What makes us unique is that many of our sevadaars originally
                  came from a non-Amritdhari background, giving us a deep
                  understanding of the challenges faced by the wider Sangat.
                  This relatability helps us create meaningful spaces where
                  everyone feels supported on their Sikhi journey.
                </p>
              </div>
              <div className="relative aspect-[9/16] md:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-primary/5">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/images/sevadaar-summit.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                What Guides Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Our Values
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-card rounded-xl border border-border/60 p-8 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 md:py-28 bg-[#1a1f2e]">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Be Part of the Journey
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Whether you want to attend a camp, volunteer as a sevadaar, or
              support our work through donations, there are many ways to get
              involved with Devanhaar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-sm sm:max-w-none mx-auto">
              <DonateButton
                source="about-cta-banner"
                className="bg-white text-[#1a1f2e] hover:bg-white/90 rounded-full px-8 py-6 text-base w-full sm:w-auto"
              />
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base w-full sm:w-auto"
              >
                <Link href="/#contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <FooterSection />
      <ScrollAnimations />
      </main>
    </>
  )
}

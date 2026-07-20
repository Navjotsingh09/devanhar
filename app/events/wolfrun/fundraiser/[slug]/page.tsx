import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { FundraiserPageContent } from "@/components/wolfrun/fundraiser-page-content"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Sponsor a Fundraiser — Wolf Run for Devanhaar`,
    description: `Sponsor this fundraiser taking on the Wolf Run to raise money for Devanhaar. Every donation supports Sikh education, camps, and community programmes.`,
    openGraph: {
      title: `Sponsor a Fundraiser — Wolf Run for Devanhaar`,
      description: `Sponsor this fundraiser taking on the Wolf Run for Devanhaar.`,
    },
  }
}

export default async function FundraiserPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollAnimations />
      <div className="pt-24">
        <FundraiserPageContent slug={slug} />
      </div>
      <FooterSection />
    </main>
  )
}

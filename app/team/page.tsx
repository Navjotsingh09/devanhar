import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { TeamPageContent } from "@/components/team-page-content"

export default function TeamPage() {
  return (
    <div>
      <Navbar />
      <main>
        <TeamPageContent />
      </main>
      <FooterSection />
    </div>
  )
}

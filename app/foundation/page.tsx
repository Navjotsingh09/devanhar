import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { FoundationPageContent } from "@/components/foundation-page-content"

export default function FoundationPage() {
  return (
    <div>
      <Navbar />
      <main>
        <FoundationPageContent />
      </main>
      <FooterSection />
    </div>
  )
}

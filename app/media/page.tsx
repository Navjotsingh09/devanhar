import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { MediaPageContent } from "@/components/media-page-content"

export default function MediaPage() {
  return (
    <div>
      <Navbar />
      <main>
        <MediaPageContent />
      </main>
      <FooterSection />
    </div>
  )
}

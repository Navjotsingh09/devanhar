import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ProjectsPageContent } from "@/components/projects-page-content"

export default function ProjectsPage() {
  return (
    <div>
      <Navbar />
      <main>
        <ProjectsPageContent />
      </main>
      <FooterSection />
    </div>
  )
}

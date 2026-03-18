import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Sikh Professional Network | Devanhaar",
  description:
    "Connecting Sikh professionals across industries through mentorship, networking, and career development.",
}

export default function SikhProfessionalNetworkPage() {
  return (
    <InitiativePageLayout
      title="Sikh Professional Network"
      tagline="Connecting Sikh professionals through mentorship, opportunity, and shared growth."
      heroImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80"
      ctaText="Connect With Us"
      ctaHref="/contact"
      slug="sikh-professional-network"
      description={[
        "Sikh Professional Network creates spaces where professionals can connect across industries, exchange experience, and support each other's growth.",
        "The network is designed to help individuals navigate careers with confidence, build meaningful relationships, and access mentorship rooted in shared values and lived experience.",
        "Whether someone is just starting out or already established in their field, the initiative exists to strengthen professional development while keeping community, service, and purpose at the centre.",
      ]}
      highlights={[
        { title: "Mentorship", description: "Connect early-career professionals with experienced mentors across a range of industries." },
        { title: "Networking", description: "Create meaningful connections that lead to collaboration, guidance, and opportunity." },
        { title: "Career Development", description: "Support growth through conversations on leadership, progression, and professional confidence." },
        { title: "Community", description: "Build a professional network that remains grounded in shared Sikh values and collective uplift." },
      ]}
      faqs={[
        {
          question: "Who is Sikh Professional Network for?",
          answer:
            "It is for students, graduates, and working professionals who want to connect, learn, and grow alongside others in the Sikh community.",
        },
        {
          question: "What kind of support does it offer?",
          answer:
            "The initiative focuses on mentorship, relationship building, professional development, and creating access to people and opportunities.",
        },
        {
          question: "Do I need to be established in my career to join?",
          answer:
            "No. The network is valuable at every stage, from those exploring options to experienced professionals looking to give back.",
        },
      ]}
      galleryImages={[
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
      ]}
    />
  )
}

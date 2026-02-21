import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Khalsa Catalyst | Devanhaar",
  description:
    "Developing, empowering and preparing the next generation of Sikh Visionaries through Speech, Synergy and Strategy.",
}

export default function KhalsaCatalystPage() {
  return (
    <InitiativePageLayout
      title="Khalsa Catalyst"
      tagline="Developing, empowering and preparing the next generation of Sikh Visionaries."
      heroImage="https://api.dicebear.com/9.x/shapes/svg?seed=khalsa-catalyst&backgroundColor=d1d4f9,ffdfbf"
      ctaText="Visit Khalsa Catalyst"
      ctaHref="https://www.khalsacatalyst.com/"
      description={[
        "Khalsa Catalyst aims to strengthen the global presence of Sikhs through Speech, Synergy and Strategy. Through structured courses, students develop critical leadership skills rooted in Sikh values and future vision.",
        "The programme focuses on four key skill areas: debating and stage presence, advanced academic writing, global awareness, and professional management. Students sharpen critical thinking, learn to express complex ideas with clarity, broaden their horizons through guest lectures, and develop the mindset of independent leaders.",
        "Through startup pitches, team projects, and management-focused sessions, students learn to manage resources, make strategic decisions, and build ventures from the ground up with confidence and purpose.",
      ]}
      highlights={[
        "Debating and Stage Presence: structured debate training, body language and voice modulation masterclasses",
        "Advanced Academic Writing: focused writing workshops, research techniques and evidence-based reasoning",
        "Global Awareness: guest lectures on finance, global politics, AI and emerging industries",
        "Professional Management: startup pitches, team projects and strategic leadership sessions",
        "Leadership, Online and Residential course options available",
        "Guest speakers including MPs and university leaders",
      ]}
      testimonials={[
        {
          quote: "Being Sikh is not a limitation or a ceiling on what we can do. The panth needs politicians and that's something I'd like to do when I'm older. This course has opened my eyes to the fact that I can connect my goals to something that can promote the panth in the future.",
          name: "Yuvraj Singh",
          role: "Summer 2025 Leadership Course Attendee",
        },
        {
          quote: "I've been incredibly impressed with just how good the children are and how much they've developed in such a short period of time. Students learnt how to put together a cogent argument when there are vastly different opinions in the room.",
          name: "Jas Gill",
          role: "Parent, Summer 2025 Leadership Course",
        },
        {
          quote: "I am blown away to see so many amazing young people here learning so much about leadership skills, debating skills, listening skills. We need more of these programmes.",
          name: "Preet Kaur Gill",
          role: "Labour & Co-op MP for Birmingham Edgbaston",
        },
        {
          quote: "The debate was absolutely fantastic to see, especially the way the kids articulated themselves on a very difficult subject matter.",
          name: "Ranjeet Singh",
          role: "Parent, Summer 2025 Leadership Course",
        },
        {
          quote: "I hope that we can revive the intelligentsia of the Sikh Nation and get Sikhs into top institutions.",
          name: "Narankar Singh",
          role: "Oxford University Student, Chief of Staff OxBridge AI Challenge",
        },
      ]}
      galleryImages={[
        "https://api.dicebear.com/9.x/shapes/svg?seed=catalyst-gallery-1&backgroundColor=d1d4f9",
        "https://api.dicebear.com/9.x/shapes/svg?seed=catalyst-gallery-2&backgroundColor=ffdfbf",
        "https://api.dicebear.com/9.x/shapes/svg?seed=catalyst-gallery-3&backgroundColor=b6e3f4",
      ]}
    />
  )
}

import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Kids Camps | Devanhaar",
  description:
    "Inspiring the next generation to embrace Sikhi through interactive learning, practical workshops, and fun activities.",
}

export default function KidsCampsPage() {
  return (
    <InitiativePageLayout
      title="Kids Camps"
      tagline="Inspiring the next generation to embrace Sikhi through interactive learning, practical workshops, and fun activities."
      heroImage="https://api.dicebear.com/9.x/shapes/svg?seed=kids-camps&backgroundColor=ffdfbf,ffd5dc"
      ctaText="Learn More"
      ctaHref="https://www.devanhaar.com/pages/kids-camps"
      description={[
        "Our kids camps are designed to instil Sikhi values into the next generation through interactive sessions, arts and crafts, and sports activities. We empower youth with the tools and confidence to explore Sikhi as they grow, emphasising the beauty of community Sangat along the way.",
        "Throughout the week, they engage in practical workshops covering Panj Kakaar and the importance of Nitnem, delve into Kirtan classes, explore Sikh history, and discuss the application of Sikhi in the real world. Plus, there are self-defense and empowerment sessions, hands-on roti making, Q&A's, and plenty of fun and games including dodgeball, football, archery, and an inflatable assault course.",
        "The future of Sikhi lies in the hands of our youth. By nurturing and guiding them from a young age, we ensure that they grow into confident individuals who are deeply connected to Guru Sahib. Investing in the next generation means creating spaces where they feel empowered to embrace their Sikhi, ask questions, and develop a strong sense of identity.",
      ]}
      highlights={[
        "Local and residential kids camps across the UK",
        "Interactive workshops on Panj Kakaar, Nitnem and Kirtan",
        "Activities include archery, dodgeball, football, self-defense and roti making",
        "Sikh history exploration and real-world Sikhi application",
        "Axe throwing, air rifle shooting, Jang and campfire sessions",
        "Singhs and Kaurs specific workshops with talks on the Chaar Sahibzade",
      ]}
      galleryImages={[
        "https://api.dicebear.com/9.x/shapes/svg?seed=kids-gallery-1&backgroundColor=ffdfbf",
        "https://api.dicebear.com/9.x/shapes/svg?seed=kids-gallery-2&backgroundColor=ffd5dc",
        "https://api.dicebear.com/9.x/shapes/svg?seed=kids-gallery-3&backgroundColor=b6e3f4",
      ]}
    />
  )
}

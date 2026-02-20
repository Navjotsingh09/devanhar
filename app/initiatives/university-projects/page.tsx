import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "University Projects | Devanhaar",
  description:
    "Delivering talks to universities across the country, hosting weekly Amrit Vela programs and more.",
}

export default function UniversityProjectsPage() {
  return (
    <InitiativePageLayout
      title="University Projects"
      tagline="Delivering talks to universities across the country, hosting weekly Amrit Vela programs and more."
      heroImage="https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80"
      ctaText="Learn More"
      ctaHref="https://www.devanhaar.com/pages/university-projects"
      description={[
        "With Maharaj's Kirpa our university talk series is back. We're thrilled to hit the road again, crisscrossing the UK, and delving into 'The Essence of Sikhi'. Our mission remains the same: to make these talks relatable and to share our personal journeys into Sikhi with you.",
        "Whether you're curious to learn more about the basics or are simply looking for some Sangat, this talk might be just for you. We're humbled by the opportunity to connect with so many of you.",
        "University is a defining time in a person's life -- a period of self-discovery, new experiences, and exposure to different environments. For many Sikh students, this can come with challenges, from navigating social pressures to encountering targeted conversion efforts. Without the right support, it's easy to feel disconnected from Sikhi.",
        "That's why we feel university talks are so important. We aim to create spaces where students can engage in open discussions about Sikhi, ask difficult questions, and find guidance in Guru Sahib's teachings. These sessions attempt to provide clarity and strength, helping students stay grounded in their Sikhi while facing the realities of university life.",
      ]}
      testimonials={[
        {
          quote: "Thank you so much for coming, the talk was inspirational and everyone enjoyed it!",
          name: "DMU Sikh Soc",
          role: "De Montfort University",
        },
        {
          quote: "The talk was very perceptive. Addressing the topics of Seva, Sangat and Ardaas was informative and expressed that each of these can be found anywhere with the right mindset. Overall, the talk provided us with many concepts to reflect on.",
          name: "Leeds Sikh Soc",
          role: "University of Leeds",
        },
        {
          quote: "We would like to thank Devanhaar for the insightful talk on the essence of Sikhi and how it applies to the modern world. There's so much we can learn from each other about Sikhi and deepen our understanding.",
          name: "Lancaster Sikh Soc",
          role: "Lancaster University",
        },
        {
          quote: "Thank you for attending our 'Essence of Sikhi' talk. We have all learned the valuable lesson of how important our Sangat is to our development which will help better all of our lives for the future.",
          name: "Bath Sikh Soc",
          role: "University of Bath",
        },
        {
          quote: "Thank you Devanhaar for coming today and giving an inspiring talk!",
          name: "UOB Sikh Soc",
          role: "University of Birmingham",
        },
        {
          quote: "A great talk this evening based on the essence of Sikhi -- delivered by Devanhaar.",
          name: "NTU Sikh Soc",
          role: "Nottingham Trent University",
        },
      ]}
      galleryImages={[
        "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
      ]}
    />
  )
}

import { FamilyProjectPage } from "@/components/family-initiative/family-project-page"

export const metadata = {
  title: "Wedding Fair | Sikh Family Initiative | Devanhaar",
  description: "A Sikh-focused wedding fair connecting families with suppliers, inspiration and practical guidance.",
}

export default function WeddingFairPage() {
  return (
    <FamilyProjectPage
      showNavbar={false}
      eyebrow="Sikh Family Initiative"
      title="Wedding Fair"
      subtitle="A Sikh-focused wedding fair bringing families, couples and trusted suppliers together in one welcoming space."
      date="13 February 2027"
      body={[
        "A welcoming event for couples and their families to explore ideas for a Sikh wedding and connect with relevant Sikh wedding businesses. Discover inspiration for your celebrations and speak directly with suppliers about creating a day that reflects your values and personal style.",
        "Whatever your stage of planning, there will be space to ask questions and consider the options together as a family.",
        "At the heart of the event is an opportunity to explore the deeper meaning of Anand Karaj. More than a wedding ceremony, it marks the beginning of a shared spiritual journey, with Guru Sahib’s guidance at the centre of married life.",
        "Explore how that commitment can be nurtured through mutual respect and how couples can support one another’s connection with Sikhi while navigating everyday responsibilities. For families, it is also a chance to reflect on how to support the couple and keep the meaning of Anand Karaj at the heart of the preparations.",
        "More information about exhibitors, timings and registration will be published as the event programme is confirmed.",
      ]}
      ctaHref="/sfi"
      ctaLabel="See all family projects"
    />
  )
}

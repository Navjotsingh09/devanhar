import { FamilyProjectPage } from "@/components/family-initiative/family-project-page"

export const metadata = {
  title: "Wedding Fair | Sikh Family Initiative | Devanhaar",
  description: "A Sikh-focused wedding fair connecting families with suppliers, inspiration and practical guidance.",
}

export default function WeddingFairPage() {
  return (
    <FamilyProjectPage
      eyebrow="Sikh Family Initiative"
      title="Wedding Fair"
      subtitle="A Sikh-focused wedding fair bringing families, couples and trusted suppliers together in one welcoming space."
      date="13 February 2027"
      body={[
        "The Wedding Fair will create a practical and welcoming environment for couples and families planning a Sikh wedding.",
        "Visitors will be able to discover suppliers, ideas and useful guidance while meeting people face to face rather than navigating the process alone.",
        "More information about exhibitors, timings and registration will be published as the event programme is confirmed.",
      ]}
      ctaHref="/initiatives/sikh-family-initiative"
      ctaLabel="See all family projects"
    />
  )
}

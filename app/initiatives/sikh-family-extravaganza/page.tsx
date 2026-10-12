import { FamilyProjectPage } from "@/components/family-initiative/family-project-page"

export const metadata = {
  title: "Sikh Family Extravaganza | Sikh Family Initiative | Devanhaar",
  description: "A large Sikh family celebration bringing generations together through activities, connection and community.",
}

export default function SikhFamilyExtravaganzaPage() {
  return (
    <FamilyProjectPage
      eyebrow="Sikh Family Initiative"
      title="Sikh Family Extravaganza"
      subtitle="A vibrant family experience designed to bring generations together through community, activities and shared memories."
      date="Provisional · December 2027 – January 2028"
      body={[
        "The Sikh Family Extravaganza is designed as a large, welcoming family event where parents, children and extended families can spend meaningful time together in a Sikh-led community environment.",
        "The programme will combine family activities, entertainment, opportunities to connect and a strong sense of sangat. Full programme details will be announced as the event is confirmed.",
        "The current event window is provisional. We will publish the confirmed date and registration details here as soon as they are finalised.",
      ]}
      ctaHref="/initiatives/sikh-family-initiative"
      ctaLabel="See all upcoming dates"
    />
  )
}

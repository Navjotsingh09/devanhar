import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Self Defence Academy | Devanhaar",
  description:
    "An academy dedicated to nurturing strength, skill and confidence whilst being rooted in Sikh values of honour, integrity and discipline.",
}

export default function SelfDefenceAcademyPage() {
  return (
    <InitiativePageLayout
      title="Self Defence Academy"
      tagline="Strength, discipline, and confidence rooted in Sikh values."
      heroImage="https://placehold.co/1200x800/1a1a2e/e0e0e0.png?text=Self+Defence+Hero"
      ctaText="Get Involved"
      ctaHref="/contact"
      slug="self-defence-academy"
      description={[
        "Self Defence Academy is built to help young Sikhs develop confidence, discipline, and resilience through structured physical training and mindset development.",
        "The academy combines practical self-defence with a deeper focus on character, awareness, and responsibility. The aim is not just physical skill, but a grounded confidence that carries into daily life.",
        "Rooted in Sikh values of honour, integrity, and discipline, the programme creates a space where participants can strengthen both body and mind while building strong bonds with the wider sangat.",
      ]}
      highlights={[
        { title: "Practical Training", description: "Learn self-defence techniques, movement, and situational awareness in a structured environment." },
        { title: "Discipline", description: "Build routine, focus, and mental resilience through consistent training." },
        { title: "Confidence", description: "Develop calm, capability, and self-belief that extends beyond the training space." },
        { title: "Sikh Values", description: "Ground physical development in honour, seva, integrity, and responsibility." },
      ]}
      faqs={[
        {
          question: "Who is Self Defence Academy for?",
          answer:
            "It is for individuals looking to grow in confidence, physical capability, and discipline within a values-led environment.",
        },
        {
          question: "Is it only about combat training?",
          answer:
            "No. The academy also focuses on awareness, mindset, routine, and character development alongside the physical side.",
        },
        {
          question: "Do I need prior experience?",
          answer:
            "No prior experience is required. The aim is to create an accessible space for growth at different levels.",
        },
      ]}
      galleryImages={[
        "https://placehold.co/900x600/1a1a2e/e0e0e0.png?text=Self+Defence+1",
        "https://placehold.co/900x600/1a1a2e/e0e0e0.png?text=Self+Defence+2",
        "https://placehold.co/900x600/1a1a2e/e0e0e0.png?text=Self+Defence+3",
      ]}
    />
  )
}

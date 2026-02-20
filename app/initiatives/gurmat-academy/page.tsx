import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Devanhaar Gurmat Academy | Devanhaar",
  description:
    "A space for young students to develop their Sikhi through Gurbani Santhiya, Ithihaas, philosophy, and Seva.",
}

export default function GurmatAcademyPage() {
  return (
    <InitiativePageLayout
      title="Gurmat Academy"
      tagline="A space for young students to develop their Sikhi."
      heroImage="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80"
      ctaText="Contact DGA"
      ctaHref="mailto:dga@singhsabhagurdwara.co.uk"
      description={[
        "The Devanhaar Gurmat Academy (DGA), located at Singh Sabha Gurdwara on Somerset Road, provides a space for students to develop their Sikhi by focusing on Gurbani Santhiya, Ithihaas (History), Gurbani understanding, Sikhi Philosophy, and Seva.",
        "There are currently three classes with a total of around 50 students that run on a weekly basis. As part of the academy, students have the chance to get involved in trips, fun activities, Gurmat camps, Seva opportunities, and much more.",
        "With Guru Sahib Ji's kirpa, we have seen many students develop, having completed their Nitnem Santhiya and beyond over the past few years. Many students have even gone on to become key Sevadaars within the academy.",
        "The Gurmat Academy is more than just a place of learning -- it is a hub for Sangat, personal growth, and friendships. Our academy fosters an environment where students not only develop their Sikhi knowledge but also grow in confidence and character. Through classes, interactive workshops, and mentorship from dedicated Sevadaars, students gain practical life skills, a strong sense of identity, and the support of a like-minded community.",
        "Parents have shared how their children have grown more engaged with Sikhi at home, feeling inspired to do Nitnem, ask deeper questions, and take an active role in Seva. With each student's progress, we see the future of Sikhi strengthen, ensuring that the next generation carries forward Guru Sahib's teachings with love and conviction.",
      ]}
      highlights={[
        "Gurbani Santhiya and Nitnem completion",
        "Sikh history (Ithihaas) and philosophy classes",
        "Weekly classes with around 50 students across three groups",
        "Trips, Gurmat camps and Seva opportunities",
        "Shastar Workshops led by Shaheedi Bunga UK",
        "Interactive activities including self-defence, quizzes and cooking",
      ]}
      galleryImages={[
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
      ]}
    />
  )
}

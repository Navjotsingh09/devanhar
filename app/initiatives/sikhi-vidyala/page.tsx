import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Sikhi Vidyala | Devanhaar",
  description:
    "An educational institution providing knowledge on Sikh history, philosophy, and teachings to equip participants with parchaar skills.",
}

export default function SikhiVidyalaPage() {
  return (
    <InitiativePageLayout
      title="Sikhi Vidyala"
      tagline="Develop your Sikhi and learn how to do parchaar."
      heroImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
      ctaText="View Handbook"
      ctaHref="https://www.devanhaar.com/pages/sikhi-vidyala"
      description={[
        "The Vidyala is an educational institution where knowledge is provided on Sikh history, philosophy, and teachings. Our aim is to equip participants with the skills necessary to spread the message of Sikhi and inspire others.",
        "The course includes understanding Gurbani, learning Sikh history, Santhiya, Q&A sessions, katha, community skills and more. The Vidyala was started in 2015 by Bhai Jagraj Singh of Basics of Sikhi. We continue this vital Seva, hosting weekly global guest speakers.",
        "This course is open to anyone desiring to get involved in Seva or parchaar, whether for local Sikhi camps or becoming a full-time parchaarik. Global applicants must be aged 18+ and live in the UK for six months. It is based at a Gurdwara in Birmingham, UK, with strong local sangat and support.",
        "Recognising the need for increased Parchaar, many like-minded organisations came together to help inspire and provide the skills necessary for the next generation to spread the message of Sikhi. Teachers come from organisations such as Basics of Sikhi, Journey of Compassion and Shaheedi Bunga UK.",
      ]}
      highlights={[
        "Regular commitment: Mon-Fri, 9am - 5pm, September to February",
        "Courses in Gurbani, Santhiya, Sikh history, katha and community skills",
        "Started in 2015 by Bhai Jagraj Singh of Basics of Sikhi",
        "Weekly global guest speakers",
        "Teachers from Basics of Sikhi, Journey of Compassion, Shaheedi Bunga UK",
        "All accommodations and staff vetted with around-the-clock support",
      ]}
      testimonials={[
        {
          quote: "The opportunities have been the best part of the Sikhi Vidyala for me.",
          name: "Hukam Singh",
          role: "Previous Student",
        },
        {
          quote: "The highlight for me has been the Sangat of Gurmukhs.",
          name: "Gurveen Kaur",
          role: "Previous Student",
        },
        {
          quote: "Learning about the Rehatname and the puratan Singhs has been my highlight.",
          name: "Luvpreet Singh",
          role: "Previous Student",
        },
      ]}
      additionalSections={
        <section className="py-16 lg:py-24 bg-[#f8f8f8]">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Meet the Teachers
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Bhai Maan Singh", desc: "Experienced speaker in the UK on Sikh history & politics. Founder of Sikh History Series podcast." },
                { name: "Bhai Mandeep Singh", desc: "Former student of the Basics of Sikhi Vidyala. Qualified teacher with private and grammar school experience." },
                { name: "Bhai Sukhwinder Singh", desc: "World renowned speaker on Sikhi. 20+ years teaching Gurbani Santhiya, Kirtan, Sikh History, philosophy & Gurbani arth." },
                { name: "Giani Baljinder Singh", desc: "Founder of Shaheedi Bunga. Currently teaches Gurbani Santhiya, Kirtan, Sikh History & Katha Granths." },
                { name: "Bhai Amandeep Singh", desc: "Founder of Friday Night Sikhi. Experienced in Sikh philosophy, Gurbani Santhiya, and history." },
              ].map((teacher, i) => (
                <div key={i} className="bg-background rounded-xl p-6 border border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{teacher.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{teacher.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    />
  )
}

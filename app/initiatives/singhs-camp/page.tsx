import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Singhs Camp | Devanhaar",
  description:
    "Be part of an everlasting brotherhood, with the aim of connecting to Sikhi and the Guru's Sangat.",
}

export default function SinghsCampPage() {
  return (
    <InitiativePageLayout
      title="Singhs Camp"
      tagline="Be part of an everlasting brotherhood, with the aim of connecting to Sikhi and the Guru's Sangat."
      heroImage="https://api.dicebear.com/9.x/shapes/svg?seed=singhs-camp&backgroundColor=b6e3f4,d1d4f9"
      ctaText="Apply Now"
      ctaHref="https://www.devanhaar.com/pages/singhs-camp"
      description={[
        "Singhs Camp is uniquely designed for every Sikh at any stage of their spiritual journey. Whether you're aiming to deepen your understanding of Sikhi, reignite a fading passion, or are curious to learn more, Singhs Camp offers the perfect environment for growth and brotherhood.",
        "It's more than just a camp; it's a place where you'll discover a sense of brotherhood, engage in fun and laughter, and form life-long relationships with like-minded Sikhs in a welcoming, non-judgmental atmosphere.",
        "A typical day at camp starts with Amrit Vela (early morning prayer in congregation) and is filled with a variety of activities, talks, and experiences. The camp is centered around building a brotherhood, providing moments for self-reflection, and most importantly helping build a deeper connection with Maharaaj.",
      ]}
      highlights={[
        "Open to all males aged 16 and above, regardless of background or stage in their Sikhi journey",
        "Held in the Welsh countryside with outdoor and indoor spaces, shared rooms and yurts",
        "Fresh langar provided around the clock, catering for all dietary requirements",
        "Camp generally takes place in early August each year",
        "Weekly connect spaces open across the country for ongoing sangat",
        "Life-long relationships with like-minded Sikhs",
      ]}
      faqs={[
        {
          question: "Who can apply for camp?",
          answer:
            "Camp is open to all males aged 16 and above. It is irrelevant what your background is or where you are in your journey, as the sole aim of the camp is for us in a non-judgmental fashion to come together as brothers and move forward together as one.",
        },
        {
          question: "When do camp applications come out?",
          answer:
            "Usually, camp details will be released around the end of the calendar year. The application process then starts around spring time with the camp generally taking place in early August. Keep an eye on our social media pages and this site for the latest camp updates.",
        },
        {
          question: "What can I expect at camp?",
          answer:
            "For one lots of fun and banter. A typical day at camp starts with Amrit Vela (early morning prayer in congregation) and is filled with a variety of activities, talks, and experiences. The camp is centered around building a brotherhood, providing moments for self-reflection, and most importantly helping build a deeper connection with Maharaaj.",
        },
        {
          question: "I don't know about Sikhi, is camp right for me?",
          answer:
            "Definitely! Camp is tailored towards individuals who may not have a lot of knowledge of Sikhi and just want to learn more. We do our best to guide you through the basics, but really it's an experience. It's a personal journey and we do our best to aid that.",
        },
        {
          question: "What are the facilities like?",
          answer:
            "Singhs Camp is held in the middle of the Welsh countryside and has everything you'll need from suitable outdoor and indoor spaces. You'll be sharing a room or a yurt with your group that you'll be with throughout camp, with the aim to connect to sangat and make lifelong brothers.",
        },
        {
          question: "What's the food like at camp?",
          answer:
            "Our strong langar team work around the clock to provide langar for all campers throughout the day. All of our food is made fresh and we cater for all dietary requirements.",
        },
      ]}
      testimonials={[
        {
          quote:
            "A spontaneous decision turned into the highlight of my year!",
          name: "Ajay Singh",
          role: "Glasgow",
        },
        {
          quote:
            "My journey at Singhs Camp is a testament to transformation.",
          name: "Onkar Singh",
          role: "Camper",
        },
        {
          quote:
            "A vibrant and unforgettable journey that changed everything.",
          name: "Dhiren Singh",
          role: "Camper",
        },
      ]}
      galleryImages={[
        "https://api.dicebear.com/9.x/shapes/svg?seed=singhs-gallery-1&backgroundColor=b6e3f4",
        "https://api.dicebear.com/9.x/shapes/svg?seed=singhs-gallery-2&backgroundColor=d1d4f9",
        "https://api.dicebear.com/9.x/shapes/svg?seed=singhs-gallery-3&backgroundColor=c0aede",
      ]}
    />
  )
}

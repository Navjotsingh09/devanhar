import { InitiativePageLayout } from "@/components/initiative-page-layout"

export const metadata = {
  title: "Kaurs Camp | Devanhaar",
  description:
    "Be part of an everlasting sisterhood, with the aim of connecting to Sikhi and the Guru's Sangat.",
}

export default function KaursCampPage() {
  return (
    <InitiativePageLayout
      title="Kaurs Camp"
      tagline="Be part of an everlasting sisterhood, with the aim of connecting to Sikhi and the Guru's Sangat."
      heroImage="/initiatives/kaurs-camp-top.jpg"
      description={[
        "If you're seeking spiritual growth, meaningful conversations and an escape from your 9-5 or whatever it is that's occupying your time -- take that leap of faith and apply for Kaurs Camp.",
        "Camp is open to all females aged 16 and above. It doesn't matter where you are on your Sikhi journey, it's open to everyone from any walk of life. We've even had campers travel from around the world.",
        "A typical day starts with Amrit Vela (early hours of the morning) and is filled with a variety of activities, talks and experiences. Every day is different and an opportunity for self-reflection and to connect with Waheguru.",
      ]}
      highlights={[
        "Open to all females aged 16 and above from any walk of life",
        "Campers have travelled from around the world to attend",
        "Daily Amrit Vela followed by activities, talks and experiences",
        "Sisterhood, self-reflection and deeper connection with Waheguru",
        "Kaurs Forum: monthly sessions in Derby, London and Birmingham",
        "Discussions on Sikh history, identity, and spiritual growth",
      ]}
      videoTestimonials={[
        {
          videoUrl: "https://www.devanhaar.com/cdn/shop/videos/c/vp/4c3d3d8a4cc8476d862c724d9ab409de/4c3d3d8a4cc8476d862c724d9ab409de.HD-1080p-2.5Mbps-36118000.mp4?v=0",
          caption: "Collective Mindfulness Session"
        },
        {
          videoUrl: "https://www.devanhaar.com/cdn/shop/videos/c/vp/7d7ebc5362bf4a92828175d205b7bbfa/7d7ebc5362bf4a92828175d205b7bbfa.HD-1080p-2.5Mbps-36118001.mp4?v=0",
          caption: "A Day in the Life at Kaurs Camp"
        },
        {
          videoUrl: "https://www.devanhaar.com/cdn/shop/videos/c/vp/5e164916db744a76b4667809c26bcb68/5e164916db744a76b4667809c26bcb68.HD-1080p-2.5Mbps-36117962.mp4?v=0",
          caption: "Testimonial from Camp"
        }
      ]}
      faqs={[
        {
          question: "Who can apply for camp?",
          answer:
            "Camp is open to all females aged 16 and above. It is irrelevant what your background is or where you are in your journey, as the sole aim of the camp is for us in a non-judgmental fashion to come together as sisters and grow together as one.",
        },
        {
          question: "When do camp applications come out?",
          answer:
            "Usually, camp details will be released around the end of the calendar year. The application process then starts around spring time with the camp generally taking place in early August.",
        },
        {
          question: "What can I expect at camp?",
          answer:
            "For one lots of fun and laughter. A typical day at camp starts with Amrit Vela and is filled with a variety of activities, talks, and experiences. The camp is centered around building a sisterhood, providing moments for self-reflection, and most importantly helping build a deeper connection with Maharaaj.",
        },
        {
          question: "I don't know about Sikhi, is camp right for me?",
          answer:
            "Definitely! Camp is tailored towards individuals who may not have a lot of knowledge of Sikhi and just want to learn more. It's a personal journey and we do our best to aid that.",
        },
        {
          question: "What are the facilities like?",
          answer:
            "Kaurs Camp is being held in the middle of the Welsh countryside with everything you'll need. You'll be sharing a room or a yurt with your group, with the aim to connect to sangat and make lifelong sisters.",
        },
      ]}
      galleryImages={[
        "/initiatives/kaurs-camp-1.jpg",
        "/initiatives/kaurs-camp-2.jpg",
        "/initiatives/kaurs-camp-3.jpg",
      ]}
    />
  )
}

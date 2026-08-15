import type { LucideIcon } from "lucide-react"
import {
  Sparkles,
  Users,
  HeartHandshake,
  BookOpen,
  Mountain,
  Sun,
} from "lucide-react"

export interface CorePillar {
  title: string
  description: string
  icon: LucideIcon
}

export interface ApplicationStep {
  step: string
  title: string
  description: string
}

export interface KaursForum {
  location: string
  image: string
  instagramUrl?: string
}

export const singhsCorePillars: CorePillar[] = [
  {
    title: "Brotherhood",
    description:
      "Built on trust, realness and shared experience, all without judgement.",
    icon: Users,
  },
  {
    title: "Faith",
    description:
      "Strengthening spiritual connection no matter the stage of one’s journey.",
    icon: Sparkles,
  },
  {
    title: "Discipline",
    description:
      "Building control, consistency and strength in both thoughts & action.",
    icon: Mountain,
  },
  {
    title: "Identity",
    description:
      "Living as a Sikh man in today’s world with clarity and confidence.",
    icon: Sun,
  },
  {
    title: "Development",
    description:
      "Through experience, discussion and shared learning.",
    icon: BookOpen,
  },
  {
    title: "Collective Purpose",
    description:
      "Moving beyond the individual towards unity, greater responsibility, and shared direction.",
    icon: HeartHandshake,
  },
]

export const kaursCorePillars: CorePillar[] = [
  {
    title: "Sisterhood",
    description:
      "Built on trust, realness and shared experience, all without judgement.",
    icon: Users,
  },
  {
    title: "Faith",
    description:
      "Strengthening spiritual connection no matter the stage of one’s journey.",
    icon: Sparkles,
  },
  {
    title: "Discipline",
    description:
      "Building control, consistency and strength in both thoughts & action.",
    icon: Mountain,
  },
  {
    title: "Identity",
    description:
      "Living as a Sikh woman in today’s world with clarity and confidence.",
    icon: Sun,
  },
  {
    title: "Development",
    description:
      "Through experience, discussion and shared learning.",
    icon: BookOpen,
  },
  {
    title: "Collective Purpose",
    description:
      "Moving beyond the individual towards unity, greater responsibility, and shared direction.",
    icon: HeartHandshake,
  },
]

export const applicationSteps: ApplicationStep[] = [
  {
    step: "01",
    title: "Apply",
    description:
      "Apply for a spot at Singhs Camp (UK or Europe) using the above links. A donation is requested ahead of time whilst we review your application.\n\nYou will require a proof of ID at this stage of the process.",
  },
  {
    step: "02",
    title: "Review",
    description:
      "Our team will review all applications and assign spaces using our own pro forma of allocation. Please bear with us, we will typically respond with your application process within 3–4 weeks.",
  },
  {
    step: "03",
    title: "Confirm your place",
    description:
      "Successful applications will receive communication by email, a joining pack and other information closer to the time of camp. If you require any further detail, please email our support page.",
  },
  {
    step: "04",
    title: "Arrive at camp",
    description:
      "We will send out a full camper pack, timetable, and more information closer to the time of camp. This will include what clothes to bring, what to pack and travel information.\n\nPs. Although Singhs Camp UK / Europe is called a ‘camp’, you will not be sleeping in tents. In fact, you’ll have your own bed, with pillows and a duvet.",
  },
]

export const singhsCampDescription: string[] = [
  "Singhs Camp is a movement for Sikh men dedicated to strengthening faith, identity, and discipline through shared experience and collective growth. It is a space for men at any stage of their journey, whether firmly grounded in Sikhi, returning to it, or beginning to explore it for the first time.",
  "Established in the United Kingdom in 2019, Singhs Camp UK was the first Sikh residential camp of its kind in the country. It has run annually since, building a strong foundation of brotherhood, shared purpose, and lasting impact. From its origins in the UK, Singhs Camp has grown into an international movement, expanding into Europe in 2026 and continuing to develop with a long term vision of global reach. Attendees now travel from across the UK and internationally, with recent camps welcoming participants from countries including Australia, USA, Canada, the Netherlands, France, and Switzerland.",
  "In an increasingly fast paced and distracting world, Singhs Camp provides a structured environment for reflection, discipline, and clarity of purpose. It creates space for Sikh men to step back from daily noise and engage meaningfully with faith, responsibility, and identity in a grounded and practical way. Each camp is supported by internationally respected speakers and renowned kirtanis, bringing depth, experience, and authenticity to the programme.",
  "At its core, Singhs Camp is built on brotherhood and collective purpose. It brings Sikh men together in an environment defined by respect, openness, and accountability. Through structured discussion, physical activity, and shared learning, participants are challenged and supported in equal measure. The result is not only personal growth, but the formation of lasting bonds rooted in lived experience. Many arrive as individuals, but leave as part of something greater, with many describing the experience as genuinely life changing.",
]

export const kaursCampDescription: string[] = [
  "The Kaur's Space was created for adult Sikh women seeking sisterhood, a deeper connection with Guru Sahib, and a space for empowerment.",
  "Through our annual residential Kaur's Camps and monthly Kaur's Forums, we bring women together in welcoming, non-judgemental environments rooted in Naam, Sangat, Gurbani contemplation, and Seva. From Amrit Vela, Simran, and Kirtan to workshops, reflection, and open conversations, each gathering is designed to nurture spiritual growth.",
  "What began as a single residential Kaur's Camp has now grown into a network of Kaur's Forums and Sangat spaces across the UK & Europe. Our vision is to provide women with a consistent space for connection, learning, and support throughout the year, fostering a sisterhood centred around Guru Sahib.",
]

export const kaursForumsDescription: string[] = [
  "Kaurs Forums are monthly gatherings held across five locations throughout the UK, with plans to continue expanding each year. Following feedback from Kaurs Camp attendees, we recognised that one weekend of connection each year wasn't enough. In response, we created monthly forums to provide Sikh women with a safe, non-judgemental space to connect, grow and support one another through Sikhi.",
  "Each forum brings women together in a warm and welcoming environment to build meaningful friendships, strengthen their faith, and engage in open conversations that inspire both personal and spiritual growth.",
  "Every forum is centred around the same simple values: Naam, Sangat and Seva. Through discussion, reflection, workshops and shared experiences, women are encouraged to learn from one another, deepen their connection to Sikhi, and become part of a supportive sisterhood within their local community.",
  "Whether you're looking to deepen your understanding of Sikhi, build lasting friendships, or simply find a welcoming community of like-minded women, there's a place for you. Explore the information below to find your nearest Kaurs Forum and become part of our growing sisterhood.",
]

export const kaursForums: KaursForum[] = [
  {
    location: "Derby",
    image: "/initiatives/kaurs-forums/derby.png",
  },
  {
    location: "Leicester",
    image: "/initiatives/kaurs-forums/leicester.png",
    instagramUrl: "https://www.instagram.com/kaursforumleicester/",
  },
  {
    location: "Nottingham",
    image: "/initiatives/kaurs-forums/nottingham.png",
    instagramUrl: "https://www.instagram.com/kaurnect_notts/",
  },
  {
    location: "Newcastle",
    image: "/initiatives/kaurs-forums/newcastle.png",
    instagramUrl: "https://www.instagram.com/northeastseva/",
  },
  {
    location: "Birmingham",
    image: "/initiatives/kaurs-forums/birmingham.png",
    instagramUrl: "https://www.instagram.com/kaursforumbirmingham/",
  },
]

export const singhsGalleryImages: string[] = [
  "/initiatives/singhs-camp-1.jpg",
  "/initiatives/singhs-camp-2.jpg",
  "/initiatives/singhs-camp-3.jpg",
  "/initiatives/singhs-camp-4.jpeg",
  "/initiatives/singhs-camp-5.jpeg",
  "/initiatives/singhs-camp-6.jpeg",
  "/initiatives/singhs-camp-7.jpeg",
  "/initiatives/singhs-camp-8.jpeg",
  "/initiatives/singhs-camp-top.jpg",
]

export const kaursGalleryImages: string[] = [
  "/initiatives/kaurs-camp-top.jpg",
  "/initiatives/kaurs-camp-1.jpg",
  "/initiatives/kaurs-camp-2.jpg",
  "/initiatives/kaurs-camp-3.jpg",
]

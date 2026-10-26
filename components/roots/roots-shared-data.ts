import type { LucideIcon } from "lucide-react"
import { Users, Compass, Mountain, Shield, Home, HeartHandshake } from "lucide-react"
import type { CorePillar, ApplicationStep } from "@/components/camps/camp-shared-data"
import type { FAQItem } from "@/components/faq-section"

export const rootsAboutLong: string[] = [
  "In a world where many young people are growing up feeling disconnected, uncertain of who they are, or lacking confidence in themselves, Roots was created to help them rediscover a sense of belonging.",
  "Roots is a residential adventure experience designed to inspire young people to challenge themselves, build meaningful friendships and reconnect with the Sikh values that shape their identity.",
  "Throughout the residential, participants take part in outdoor adventures, team challenges, leadership experiences and inspiring workshops. Every activity is designed to help young people step outside their comfort zone, discover new strengths and create memories that last a lifetime.",
  "At its heart, Roots is about connection: to yourself, your community and your Sikh identity. Through shared experiences and meaningful conversations, young people leave with a stronger sense of identity, greater self-belief and friendships that last long after the programme ends.",
  "Whether attending with friends or arriving on their own, every young person is welcomed into a supportive community where they are encouraged to be themselves, embrace new challenges and realise their full potential.",
]

export const rootsAboutShort: string[] = [
  "Roots is a three-day residential experience designed to inspire the next generation of young Sikhs. Created for young people aged 12–16, Roots combines outdoor adventure, leadership, personal development and Sikh values in an environment where every participant feels welcomed, challenged and supported.",
  "Throughout the residential, participants climb, explore, compete and grow together. From outdoor activities and team challenges to inspiring discussions and workshops, everything is designed to help young people build confidence, resilience and lifelong friendships.",
  "Roots is not simply about the activities. It is about discovering potential, developing character and building a stronger connection with their Roots. Whether your child is already involved in the local community or taking their very first steps, every participant leaves with unforgettable memories, new friendships and the confidence to embrace whatever comes next.",
]

export const rootsExperienceCards: CorePillar[] = [
  {
    title: "Friendship & Community",
    description: "Meet other young people, build new friendships and become part of a positive, supportive community.",
    icon: Users,
  },
  {
    title: "Identity & Heritage",
    description: "Explore Sikh values and identity in a way that feels relevant and meaningful.",
    icon: Compass,
  },
  {
    title: "Adventure Activities",
    description: "Take part in exciting outdoor activities, team challenges and experiences designed to push comfort zones.",
    icon: Mountain,
  },
  {
    title: "Confidence & Leadership",
    description: "Develop confidence, resilience, teamwork and leadership skills through practical challenges and group sessions.",
    icon: Shield,
  },
  {
    title: "Residential Experience",
    description: "Participants will stay on-site in allocated accommodation, supported by the team throughout the residential.",
    icon: Home,
  },
  {
    title: "Support & Welfare",
    description: "Our team will be available throughout the programme to support participants' wellbeing, safety and individual needs.",
    icon: HeartHandshake,
  },
]

export const rootsWhoIsItFor: string[] = [
  "Roots welcomes young Sikhs aged 12–16 from every background and every stage of their Sikhi journey, whether that is continuing existing practices or taking a very first step.",
  "Some participants arrive knowing lots of people. Others come on their own. Some regularly attend Gurdwara, while others are exploring their Sikh identity for the first time.",
  "No matter where they begin, everyone becomes part of one supportive community where they are encouraged to learn, grow and be themselves.",
]

export const rootsForParents: string[] = [
  "Imagine your child returning home with greater confidence, stronger friendships and stories they will be telling for years.",
  "Away from everyday routines and constant screen time, they will discover new abilities, overcome challenges, work together as a team and develop independence in a safe and encouraging environment.",
  "More importantly, they will experience the joy of being surrounded by positive role models, inspiring mentors and other young Sikhs who encourage one another to grow.",
  "Roots is not simply three days away from home. It is the beginning of a lifelong journey and the start of friendships and experiences that continue long after the residential ends.",
]

export const rootsBookingSteps: ApplicationStep[] = [
  {
    step: "01",
    title: "Complete the Boots Camp application",
    description: "Tell us about the participant and provide parent or guardian contact details, medical and dietary needs, and an emergency contact.",
  },
  {
    step: "02",
    title: "Your form is reviewed",
    description: "The Roots team will review the application and check availability and any support needs.",
  },
  {
    step: "03",
    title: "An organiser will contact you",
    description: "An organiser will contact the parent or guardian with the next steps and any further information.",
  },
  {
    step: "04",
    title: "Your place is confirmed",
    description: "The Roots team will confirm the place directly once the application has been reviewed.",
  },
  {
    step: "05",
    title: "Boots Camp information is shared",
    description: "Confirmed participants will receive the relevant Boots Camp arrangements and information about what to bring.",
  },
]

export const rootsFAQs: FAQItem[] = [
  {
    question: "Is my place confirmed once I submit the form?",
    answer: "No. Submitting the form is the first step. The Roots team will review your application and be in touch to confirm availability, discuss the cost and explain how to make payment. Your place is only confirmed once the team has contacted you.",
  },
  {
    question: "When does Roots take place?",
    answer: "Dates for the main Roots Residential will be announced soon. Boys' Boots Camp is a separate programme; the team will share its arrangements with applicants.",
  },
  {
    question: "Who can attend Roots?",
    answer: "Anyone aged 12–16. No pre-requisites required.",
  },
  {
    question: "Can my child attend if they do not know anyone?",
    answer: "Absolutely. Many participants arrive on their own and leave with lifelong friends. The Roots programme is designed to bring young people together, and the team works hard to ensure everyone feels welcomed from the moment they arrive.",
  },

  {
    question: "What information do I need before completing the form?",
    answer: "You will need the participant's details including date of birth, any medical or dietary information, emergency contact details and your parent or guardian contact information. Having this ready will help you complete the form in one sitting.",
  },
]

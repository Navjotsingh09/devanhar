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

export const singhsCorePillars: CorePillar[] = [
  {
    title: "Brotherhood",
    description:
      "Unity through realness, shared experience and collective responsibility.",
    icon: Users,
  },
  {
    title: "Faith",
    description:
      "Strengthening connection at any stage of the journey.",
    icon: Sparkles,
  },
  {
    title: "Discipline",
    description:
      "Building control, consistency and personal strength.",
    icon: Mountain,
  },
  {
    title: "Identity",
    description:
      "Living as a Sikh man in today’s world with clarity and confidence.",
    icon: Sun,
  },
  {
    title: "Growth",
    description:
      "Development through discourse, challenge and reflection.",
    icon: BookOpen,
  },
  {
    title: "Collective Purpose",
    description:
      "Moving from the individual to shared responsibility.",
    icon: HeartHandshake,
  },
]

export const kaursCorePillars: CorePillar[] = [
  {
    title: "Sisterhood",
    description:
      "Unity through realness, shared experience and collective responsibility.",
    icon: Users,
  },
  {
    title: "Faith",
    description:
      "Strengthening connection at any stage of the journey.",
    icon: Sparkles,
  },
  {
    title: "Discipline",
    description:
      "Building control, consistency and personal strength.",
    icon: Mountain,
  },
  {
    title: "Identity",
    description:
      "Living as a Sikh woman in today’s world with clarity and confidence.",
    icon: Sun,
  },
  {
    title: "Growth",
    description:
      "Development through discourse, challenge and reflection.",
    icon: BookOpen,
  },
  {
    title: "Collective Purpose",
    description:
      "Moving from the individual to shared responsibility.",
    icon: HeartHandshake,
  },
]

export const applicationSteps: ApplicationStep[] = [
  {
    step: "01",
    title: "Apply",
    description:
      "Submit a short application telling us a little about yourself and why you'd like to come.",
  },
  {
    step: "02",
    title: "Review",
    description:
      "Our team reviews each application personally. We aim to come back to you within two weeks.",
  },
  {
    step: "03",
    title: "Confirm your place",
    description:
      "Successful applicants secure their spot with a deposit and receive a full joining pack.",
  },
  {
    step: "04",
    title: "Arrive at camp",
    description:
      "Travel details, kit list and a warm welcome await — all you need to do is show up open-hearted.",
  },
]

export const singhsCampDescription: string[] = [
  "Singhs Camp is a movement for Sikh men dedicated to strengthening faith, identity, and discipline through shared experience and collective growth. It is a space for men at any stage of their journey, whether firmly grounded in Sikhi, returning to it, or beginning to explore it for the first time.",
  "Established in the United Kingdom in 2019, Singhs Camp UK was the first Sikh residential camp of its kind in the country. It has run annually since, building a strong foundation of brotherhood, shared purpose, and lasting impact. From its origins in the UK, Singhs Camp has grown into an international movement, expanding into Europe in 2026 and continuing to develop with a long term vision of global reach. Attendees now travel from across the UK and internationally, with recent camps welcoming participants from countries including Australia, USA, Canada, the Netherlands, France, and Switzerland.",
  "In an increasingly fast paced and distracting world, Singhs Camp provides a structured environment for reflection, discipline, and clarity of purpose. It creates space for Sikh men to step back from daily noise and engage meaningfully with faith, responsibility, and identity in a grounded and practical way. Each camp is supported by internationally respected speakers and renowned kirtanis, bringing depth, experience, and authenticity to the programme.",
  "At its core, Singhs Camp is built on brotherhood and collective purpose. It brings Sikh men together in an environment defined by respect, openness, and accountability. Through structured discussion, physical activity, and shared learning, participants are challenged and supported in equal measure. The result is not only personal growth, but the formation of lasting bonds rooted in lived experience. Many arrive as individuals, but leave as part of something greater, with many describing the experience as genuinely life changing.",
]

export const kaursCampDescription: string[] = [
  "Kaurs Camps are residential retreats created for Adult Sikh women seeking space to reconnect with Sikhi, build sisterhood and step away from the noise of everyday life.",
  "Every camp is built around the same simple idea: Naam, Sangat and Seva. We rise early for Amrit Vela, sit together in kirtan and simran, share langar, take part in workshops and katha, and make space for movement, reflection and time in nature.",
  "In 2027 we're taking that experience to mainland Europe for the first time. Whether you join us in the UK or register your interest for the EU camp, you'll be welcomed into a sisterhood that lasts long after the camp ends.",
]

export const singhsGalleryImages: string[] = [
  "/initiatives/singhs-camp-1.jpg",
  "/initiatives/singhs-camp-2.jpg",
  "/initiatives/singhs-camp-3.jpg",
  "/initiatives/singhs-camp-top.jpg",
]

export const kaursGalleryImages: string[] = [
  "/initiatives/kaurs-camp-top.jpg",
]

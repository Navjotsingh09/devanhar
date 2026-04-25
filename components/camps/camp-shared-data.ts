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
    title: "Naam",
    description:
      "Daily Amrit Vela, simran and kirtan create the spiritual foundation of every camp.",
    icon: Sparkles,
  },
  {
    title: "Sangat",
    description:
      "Brotherhood with Singhs from across the country who walk the same path with you.",
    icon: Users,
  },
  {
    title: "Seva",
    description:
      "Hands-on seva — from langar to setup — keeps us humble and rooted in service.",
    icon: HeartHandshake,
  },
  {
    title: "Vidya",
    description:
      "Workshops, talks and katha that deepen understanding of Gurbani and Sikh history.",
    icon: BookOpen,
  },
  {
    title: "Kasrat",
    description:
      "Shastar vidya, sport and outdoor challenges to strengthen body alongside the mind.",
    icon: Mountain,
  },
  {
    title: "Reflection",
    description:
      "Quiet time in nature to reset, reflect and return home with clarity and intent.",
    icon: Sun,
  },
]

export const kaursCorePillars: CorePillar[] = [
  {
    title: "Naam",
    description:
      "Daily Amrit Vela, simran and kirtan create the spiritual foundation of every camp.",
    icon: Sparkles,
  },
  {
    title: "Sangat",
    description:
      "Sisterhood with Kaurs from across the country who walk the same path with you.",
    icon: Users,
  },
  {
    title: "Seva",
    description:
      "Hands-on seva — from langar to setup — keeps us humble and rooted in service.",
    icon: HeartHandshake,
  },
  {
    title: "Vidya",
    description:
      "Workshops, talks and katha that deepen understanding of Gurbani and Sikh history.",
    icon: BookOpen,
  },
  {
    title: "Kasrat",
    description:
      "Movement, outdoor activity and challenges to strengthen body alongside the mind.",
    icon: Mountain,
  },
  {
    title: "Reflection",
    description:
      "Quiet time in nature to reset, reflect and return home with clarity and intent.",
    icon: Sun,
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
  "Singhs Camps began as a UK residential in 2019 — a small gathering of brothers wanting space to reconnect with Sikhi away from the noise of everyday life. Since then it has grown into one of the most loved retreats for Adult Sikh men in the country.",
  "Every camp is built around the same simple idea: Naam, Sangat and Seva. We rise early for Amrit Vela, sit together in kirtan and simran, share langar, take part in workshops and katha, and make space for sport, reflection and time in nature.",
  "In 2027 we're taking that experience to mainland Europe for the first time. Whether you join us in the UK or register your interest for the EU camp, you'll be welcomed into a brotherhood that lasts long after the camp ends.",
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

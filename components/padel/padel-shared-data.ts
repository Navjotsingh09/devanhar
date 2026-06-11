import type { LucideIcon } from "lucide-react"
import {
  Trophy,
  Users,
  Activity,
  HeartHandshake,
  Target,
  CalendarDays,
} from "lucide-react"

// NOTE: Copy below is PLACEHOLDER content pending final copy/branding from
// Ambi's OneDrive. Swap the strings (and gallery image paths) when received.
// No fabricated statistics, quotes, or attributions are used.

export interface PadelPillar {
  title: string
  description: string
  icon: LucideIcon
}

export interface PadelStep {
  step: string
  title: string
  description: string
}

export const padelPillars: PadelPillar[] = [
  {
    title: "Community",
    description:
      "Bringing the Sikh sangat together through sport, friendly competition and shared energy on court.",
    icon: Users,
  },
  {
    title: "Sport",
    description:
      "Fast, social and accessible — padel is one of the fastest growing racket sports and easy to pick up.",
    icon: Activity,
  },
  {
    title: "Competition",
    description:
      "Team-based tournaments with rounds, rankings and a live leaderboard to track every match.",
    icon: Trophy,
  },
  {
    title: "Discipline",
    description:
      "Building focus, teamwork and resilience through structured play and training.",
    icon: Target,
  },
  {
    title: "Brotherhood & Sisterhood",
    description:
      "Lasting bonds formed through the highs and lows of competing alongside your partner.",
    icon: HeartHandshake,
  },
  {
    title: "Events",
    description:
      "Regular fixtures and showcase tournaments hosted at quality courts across the UK.",
    icon: CalendarDays,
  },
]

export const padelSteps: PadelStep[] = [
  {
    step: "01",
    title: "Register your team",
    description:
      "Enter your team name and the details of both players using the registration form. An entry fee is requested up front while we confirm places.",
  },
  {
    step: "02",
    title: "Payment held securely",
    description:
      "Your entry fee is authorised through Stripe and held — not taken — until the team confirms your place.",
  },
  {
    step: "03",
    title: "Place confirmed",
    description:
      "Once your team is confirmed you will receive an email with full event details, your group and timings.",
  },
  {
    step: "04",
    title: "Play & climb the leaderboard",
    description:
      "Compete across the rounds on the day. Results and rankings are updated on the live leaderboard after each round.",
  },
]

export const padelDescription: string[] = [
  "The Sikh Padel Association is a Devanhaar initiative bringing the Sikh community together through padel — one of the world's fastest growing racket sports. It is a space for players of every level, whether you have played for years or are stepping onto a court for the first time.",
  "Padel is played in pairs on an enclosed court, combining elements of tennis and squash. It is social, fast to learn and genuinely fun, making it the perfect setting to build community, friendship and a bit of healthy competition.",
  "Through regular fixtures and showcase tournaments, the Sikh Padel Association creates opportunities to compete, connect and represent — on and off the court.",
]

export const padelGalleryImages: string[] = [
  // PLACEHOLDER images — replace with action shots from Ambi's OneDrive.
  "/initiatives/sikh-padel-association-1.jpg",
  "/initiatives/sikh-padel-association-2.jpg",
  "/initiatives/sikh-padel-association-3.jpg",
  "/initiatives/sikh-padel-association-top.jpg",
]

export const padelFaqs = [
  {
    question: "Do I need experience to take part?",
    answer:
      "No. The Sikh Padel Association welcomes players of all levels, from complete beginners to experienced competitors. You register as a team of two.",
  },
  {
    question: "How do teams work?",
    answer:
      "Padel is played in pairs, so you register as a team of two players. One player acts as the team captain and primary contact for all communication.",
  },
  {
    question: "When is the next event?",
    answer:
      "Our upcoming tournament takes place on 4th July. Register your team to secure your place — further details will be shared with confirmed teams by email.",
  },
  {
    question: "How does payment work?",
    answer:
      "The team entry fee is processed securely through Stripe. The amount is authorised and held when you register, and only taken once your place is confirmed.",
  },
  {
    question: "How is the leaderboard updated?",
    answer:
      "Results are recorded after each round and the leaderboard — showing games, points and rankings — is updated throughout the tournament.",
  },
]

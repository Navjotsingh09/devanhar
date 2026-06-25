import type { LucideIcon } from "lucide-react"
import {
  Users,
  HeartHandshake,
  BookOpen,
  Sparkles,
  Mountain,
  Sun,
  Heart,
  Home,
} from "lucide-react"
import type { CorePillar, ApplicationStep } from "@/components/camps/camp-shared-data"
import type { FAQItem } from "@/components/faq-section"

export const retreatDetailCards: CorePillar[] = [
  { title: "Family sangat", description: "Spend time with other families in a warm, welcoming and supportive environment.", icon: Users },
  { title: "Sikhi learning", description: "Explore Sikh teachings, history, values and identity in a way that is meaningful for both adults and children.", icon: BookOpen },
  { title: "Children and young people", description: "Age-appropriate activities will help children and young people feel included, engaged and inspired.", icon: Sparkles },
  { title: "Reflection and connection", description: "Create space for families to pause, reflect and reconnect with what matters most.", icon: HeartHandshake },
  { title: "Accommodation", description: "Accommodation will be allocated by the organising team based on availability, family size and suitability.", icon: Home as unknown as LucideIcon },
  { title: "Sevadaar support", description: "A sevadaar will follow up after your booking form is submitted to discuss your family's needs and next steps.", icon: Sun },
]

export const retreatExperienceCards: CorePillar[] = [
  { title: "Gurbani and reflection", description: "Opportunities to connect with Sikh teachings and reflect on how they guide family life.", icon: Sparkles },
  { title: "Sikh history and identity", description: "Sessions and activities that help children and adults understand Sikh heritage with pride and clarity.", icon: BookOpen },
  { title: "Family activities", description: "Shared experiences that help parents, children and young people spend quality time together.", icon: Users },
  { title: "Seva and responsibility", description: "Encouraging children and adults to understand the importance of service, humility and contribution.", icon: Heart as unknown as LucideIcon },
  { title: "Friendship and belonging", description: "A chance for families to meet others, build friendships and feel part of a wider sangat.", icon: HeartHandshake },
  { title: "Memories beyond the retreat", description: "The retreat is designed to leave families with practical inspiration they can continue at home.", icon: Mountain },
]

export const bookingSteps: ApplicationStep[] = [
  { step: "01", title: "Complete the family booking form", description: "Tell us about your family, who will be attending, your accommodation preferences, medical or dietary needs and anything else that will help us support you." },
  { step: "02", title: "Your form is reviewed", description: "The organising team will review your booking request and check accommodation availability, family size and any support needs." },
  { step: "03", title: "A sevadaar will contact you", description: "A sevadaar will follow up with you directly to discuss the cost for your family, explain the payment options and answer any questions." },
  { step: "04", title: "Your place is confirmed", description: "Once availability has been checked and the next steps have been completed, the retreat team will confirm your family's place." },
  { step: "05", title: "Retreat information is shared", description: "Confirmed families will receive further details, including arrival information, what to bring, accommodation guidance and the retreat timetable." },
]

export const retreatFAQs: FAQItem[] = [
  { question: "Is my place confirmed once I submit the form?", answer: "No. Submitting the form sends your booking request to the organising team. A sevadaar will contact you after your form has been reviewed. Your place is only confirmed once availability and the next steps have been agreed." },
  { question: "How will I know the cost for my family?", answer: "A sevadaar will contact you after your form is submitted to discuss the cost for your family and explain how payment can be made." },
  { question: "Can I request specific accommodation?", answer: "Yes, you can share your accommodation preference on the form. The organising team will try to support requests where possible, but accommodation is limited and will be allocated based on availability and suitability." },
  { question: "Can children attend?", answer: "Yes. The Sikh Family Retreat is designed for families, including children and young people. Please include all children attending on the booking form so the team can plan appropriately." },
  { question: "What information do I need before completing the form?", answer: "You will need adult details, children's details, medical and dietary information, emergency contact details and any accommodation or support needs." },
  { question: "Who should complete the form?", answer: "The main adult contact for the family should complete the form. This person will receive follow-up communication from the retreat team." },
  { question: "What happens if places are full?", answer: "If places are full, the retreat team may place your family on a waiting list and contact you if a suitable space becomes available." },
  { question: "Can I speak to someone before completing the form?", answer: "Yes. If you have questions before booking, you can contact the retreat team and a sevadaar will be happy to help." },
]

export const retreatDescription: string[] = [
  "The Sikh Family Retreat has been created to give families meaningful time together in a spiritually uplifting environment. Across the retreat, families will have the opportunity to learn, reflect, take part in activities and spend time with other families who are also trying to strengthen their connection with Sikhi and each other.",
  "The retreat is not simply a weekend away. It is a chance to build sangat, create memories and give children and young people positive experiences of Sikh values, identity and community.",
  "Families from different stages of their Sikhi journey are welcome. Whether your family is just beginning to learn or already has a strong connection with Gurbani, Sikh history and Punjabi, the retreat is designed to be welcoming, supportive and accessible.",
]

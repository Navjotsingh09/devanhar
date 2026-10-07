"use client"

import { useRouter } from "next/navigation"
import { PadelRegistrationForm } from "@/components/padel-registration-form"
import type { PublicPadelEvent } from "@/lib/padel-public-event"

export function PadelRegisterPageClient({ event }: { event: PublicPadelEvent }) {
  const router = useRouter()
  return (
    <PadelRegistrationForm
      event={event}
      onClose={() => router.push("/initiatives/sikh-padel-association")}
    />
  )
}

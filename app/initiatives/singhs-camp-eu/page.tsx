import { redirect } from "next/navigation"

// Force dynamic so Next.js skips static data collection on this redirect-only page.
export const dynamic = 'force-dynamic'

export default function SinghsCampEuRedirect() {
  redirect("/initiatives/singhs-camp/eu")
}

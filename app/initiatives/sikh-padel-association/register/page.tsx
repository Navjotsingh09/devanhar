import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { PadelRegisterPageClient } from "@/components/padel/padel-register-page-client"
import { getPublicPadelEvent } from "@/lib/padel-public-event"

export const dynamic = "force-dynamic"

export default async function PadelRegisterPage() {
  const event = await getPublicPadelEvent()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 md:pt-24">
        <PadelRegisterPageClient event={event} />
      </main>
      <FooterSection hideContact />
    </>
  )
}

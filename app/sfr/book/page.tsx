import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { FooterSection } from '@/components/footer-section'
import { FamilyRetreatBookingForm } from '@/components/family-retreat/family-retreat-booking-form'
import { isRetreatBookingEvent, isRetreatBookingOpen, RETREAT_BOOKING_EVENTS } from '@/lib/family-retreat-booking-details'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Request a Sikh Family Retreat booking | Devanhaar',
  robots: { index: false, follow: false },
}

export default async function RetreatBookingPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event } = await searchParams
  if (!isRetreatBookingEvent(event) || !isRetreatBookingOpen(event)) notFound()
  const retreat = RETREAT_BOOKING_EVENTS[event]
  return <>
    <Navbar />
    <main className="min-h-screen bg-secondary/20 pb-16 pt-28 md:pt-32">
      <div className="container mx-auto max-w-3xl px-6 lg:px-12">
        <Link href="/sfr#retreats" className="text-sm underline">Back to Sikh Family Retreat</Link>
        <header className="my-8">
          <p className="text-sm font-medium">Sikh Family Retreat · Booking request</p>
          <h1 className="mt-2 text-3xl font-bold">{retreat.title}</h1>
          <p className="mt-2 text-muted-foreground">{retreat.date}</p>
        </header>
        <FamilyRetreatBookingForm event={event} />
      </div>
    </main>
    <FooterSection hideContact />
  </>
}

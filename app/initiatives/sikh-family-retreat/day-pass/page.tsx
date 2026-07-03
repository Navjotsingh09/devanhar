import { reconcileDayPassBySession } from '@/lib/day-pass-reconcile'
import DayPassBookingForm from '@/components/family-retreat/day-pass-booking-form'

export const dynamic = 'force-dynamic'

export default async function DayPassPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; session_id?: string }>
}) {
  const params = await searchParams
  const paid = params.paid === '1'
  const sessionId = params.session_id || null

  if (paid && sessionId) {
    await reconcileDayPassBySession(sessionId)
  }

  return (
    <main className="min-h-screen bg-background">
      {paid ? (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Payment received — your Day Pass is confirmed!</h1>
          <p className="text-muted-foreground mb-6">A confirmation email is on its way to you. We look forward to seeing you at Hilston Park.</p>
          <a href="/initiatives/sikh-family-retreat" className="text-amber-600 hover:underline text-sm">Back to Sikh Family Retreat</a>
        </div>
      ) : (
        <DayPassBookingForm />
      )}
    </main>
  )
}

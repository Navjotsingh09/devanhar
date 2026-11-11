import { getRequestStaff } from '@/lib/crm/request-staff'
import { retreatProgress, type RetreatTrackerEvent } from '@/lib/family-retreat-tracker'
import { FamilyBookingInsights } from '@/components/family-initiative/family-booking-insights'
import { requireProgramme } from "@/lib/staff-programme-server"
import { FamilyRetreatBookingsTable, type FamilyRetreatBooking } from "@/components/family-retreat/family-retreat-bookings-table"
import { FamilyInterestTable, type FamilyInterestSubmission } from "@/components/family-initiative/family-interest-table"
import { RecoveredPaymentSection, type RecoveredPaymentRecord } from "@/components/dashboard/recovered-payment-section"

export const dynamic = "force-dynamic"
export const metadata = { title: "Sikh Family Retreat | Sikh Family Initiative | Dashboard" }

async function getData(): Promise<{ bookings: FamilyRetreatBooking[]; interests: FamilyInterestSubmission[]; recoveredPayments: RecoveredPaymentRecord[]; tracker: RetreatTrackerEvent[] | null; reviewer: boolean }> {
  const supabase = await requireProgramme('family')
  const staff = await getRequestStaff()
  const reviewer = ['admin','super_admin'].includes(staff.profile.data?.role ?? '')
  const [bookingsResult, interestsResult, recoveredResult, tracker] = await Promise.all([
    supabase.from("family_retreat_bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("form_submissions").select("id, full_name, email, phone, form_data, created_at").order("created_at", { ascending: false }).limit(5000),
    supabase.from("recovery_payment_ledger").select("id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, customer_phone, payment_reference").ilike("description", "%Family Retreat%").order("occurred_at", { ascending: false }),
    readTracker(supabase),
  ])
  const interests = (interestsResult.data || []).filter((row: any) => String(row.form_data?.project || "").toLowerCase() === "sikh family retreat")
  return {
    tracker, reviewer,
    bookings: (bookingsResult.data || []) as FamilyRetreatBooking[],
    interests: interests as FamilyInterestSubmission[],
    recoveredPayments: (recoveredResult.data || []) as RecoveredPaymentRecord[],
  }
}

async function readTracker(supabase: Awaited<ReturnType<typeof requireProgramme>>) {
  const events: RetreatTrackerEvent[] = []
  let cursor: number | undefined
  while (true) {
    let query = supabase.from('family_retreat_tracker').select('id, booking_id, action, amount_pence, note, reference, occurred_on, request_id, actor_name, created_at').order('id', { ascending: false }).limit(500)
    if (cursor !== undefined) query = query.lt('id', cursor)
    const { data, error } = await query
    if (error || !data) return null
    if (!data.length) return events
    const rows = data as RetreatTrackerEvent[]
    events.push(...rows)
    cursor = rows[rows.length - 1].id
  }
}

export default async function RetreatDashboardPage() {
  const { bookings, interests, recoveredPayments, tracker, reviewer } = await getData()
  const activity = new Map<string, RetreatTrackerEvent[]>()
  for (const event of tracker ?? []) {
    const entries = activity.get(event.booking_id) ?? []
    entries.push(event)
    activity.set(event.booking_id, entries)
  }
  const reportingBookings = bookings.map(booking => {
    const events = activity.get(booking.id)
    if (!events?.length) return booking
    const progress = retreatProgress(events, booking)
    return {
      ...booking,
      payment_status: progress.paid ? 'paid' : 'unpaid',
      amount_due: progress.due / 100,
      amount_paid: progress.refundable / 100,
    }
  })
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sikh Family Initiative</p>
        <h1 className="mt-2 text-2xl font-bold">Sikh Family Retreat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage New Year Reset, Spring and Summer interest registrations plus existing retreat bookings.</p>
      </div>
      <FamilyBookingInsights bookings={reportingBookings} interests={interests} />
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Interest registrations ({interests.length})</h2><p className="text-sm text-muted-foreground">Includes New Year Reset and future retreat interest captured from the website.</p></div>
        <FamilyInterestTable submissions={interests} emptyLabel="No Sikh Family Retreat interest registrations yet." />
      </section>
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Retreat bookings ({bookings.length})</h2><p className="text-sm text-muted-foreground">Track conversations, payment requests, receipts and refunds.</p></div>
        <FamilyRetreatBookingsTable bookings={bookings} tracker={tracker} reviewer={reviewer} />
      </section>
      <RecoveredPaymentSection title="Recovered Family Retreat Bookings" records={recoveredPayments} />
    </div>
  )
}

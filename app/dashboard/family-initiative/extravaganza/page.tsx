import { FamilyBookingInsights } from '@/components/family-initiative/family-booking-insights'
import { requireProgramme } from "@/lib/staff-programme-server"
import { FamilyInitiativeBookingsTable, type FamilyInitiativeBooking } from "@/components/family-initiative/family-initiative-bookings-table"
import { FamilyInterestTable, type FamilyInterestSubmission } from "@/components/family-initiative/family-interest-table"
import { RecoveredPaymentSection, type RecoveredPaymentRecord } from "@/components/dashboard/recovered-payment-section"

export const dynamic = "force-dynamic"
export const metadata = { title: "Sikh Family Extravaganza | Sikh Family Initiative | Dashboard" }

async function getData(): Promise<{ bookings: FamilyInitiativeBooking[]; interests: FamilyInterestSubmission[]; recoveredPayments: RecoveredPaymentRecord[] }> {
  const supabase = await requireProgramme('family')
  const [bookingsResult, interestsResult, recoveredResult] = await Promise.all([
    supabase.from("family_initiative_bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("form_submissions").select("id, full_name, email, phone, form_data, created_at").order("created_at", { ascending: false }).limit(5000),
    supabase.from("recovery_payment_ledger").select("id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, customer_phone, payment_reference").ilike("description", "%Family Fun Day%").order("occurred_at", { ascending: false }),
  ])
  const interests = (interestsResult.data || []).filter((row: any) => String(row.form_data?.project || "").toLowerCase() === "sikh family extravaganza")
  return {
    bookings: (bookingsResult.data || []) as FamilyInitiativeBooking[],
    interests: interests as FamilyInterestSubmission[],
    recoveredPayments: (recoveredResult.data || []) as RecoveredPaymentRecord[],
  }
}

export default async function ExtravaganzaDashboardPage() {
  const { bookings, interests, recoveredPayments } = await getData()
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sikh Family Initiative</p>
        <h1 className="mt-2 text-2xl font-bold">Sikh Family Extravaganza</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage May 2027 interest registrations and historic Family Fun Day / Extravaganza bookings.</p>
      </div>
      <FamilyBookingInsights bookings={bookings} interests={interests} />
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Interest registrations ({interests.length})</h2></div>
        <FamilyInterestTable submissions={interests} emptyLabel="No Sikh Family Extravaganza interest registrations yet." />
      </section>
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Event bookings ({bookings.length})</h2><p className="text-sm text-muted-foreground">Existing Sikh Family Initiative / Family Fun Day booking records are retained here.</p></div>
        <FamilyInitiativeBookingsTable bookings={bookings} />
      </section>
      <RecoveredPaymentSection title="Recovered Family Fun Day / Extravaganza Bookings" records={recoveredPayments} />
    </div>
  )
}

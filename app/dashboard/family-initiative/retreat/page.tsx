import { createClient } from "@supabase/supabase-js"
import { FamilyRetreatBookingsTable, type FamilyRetreatBooking } from "@/components/family-retreat/family-retreat-bookings-table"
import { FamilyInterestTable, type FamilyInterestSubmission } from "@/components/family-initiative/family-interest-table"
import { RecoveredPaymentSection, type RecoveredPaymentRecord } from "@/components/dashboard/recovered-payment-section"

export const dynamic = "force-dynamic"
export const metadata = { title: "Sikh Family Retreat | Sikh Family Initiative | Dashboard" }

async function getData(): Promise<{ bookings: FamilyRetreatBooking[]; interests: FamilyInterestSubmission[]; recoveredPayments: RecoveredPaymentRecord[] }> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
  const [bookingsResult, interestsResult, recoveredResult] = await Promise.all([
    supabase.from("family_retreat_bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("form_submissions").select("id, full_name, email, phone, form_data, created_at").order("created_at", { ascending: false }).limit(5000),
    supabase.from("recovery_payment_ledger").select("id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, customer_phone, payment_reference").ilike("description", "%Family Retreat%").order("occurred_at", { ascending: false }),
  ])
  const interests = (interestsResult.data || []).filter((row: any) => String(row.form_data?.project || "").toLowerCase() === "sikh family retreat")
  return {
    bookings: (bookingsResult.data || []) as FamilyRetreatBooking[],
    interests: interests as FamilyInterestSubmission[],
    recoveredPayments: (recoveredResult.data || []) as RecoveredPaymentRecord[],
  }
}

export default async function RetreatDashboardPage() {
  const { bookings, interests, recoveredPayments } = await getData()
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sikh Family Initiative</p>
        <h1 className="mt-2 text-2xl font-bold">Sikh Family Retreat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage New Year Reset, Spring and Summer interest registrations plus existing retreat bookings.</p>
      </div>
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Interest registrations ({interests.length})</h2><p className="text-sm text-muted-foreground">Includes New Year Reset and future retreat interest captured from the website.</p></div>
        <FamilyInterestTable submissions={interests} emptyLabel="No Sikh Family Retreat interest registrations yet." />
      </section>
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Retreat bookings ({bookings.length})</h2><p className="text-sm text-muted-foreground">Existing detailed retreat booking records and payment workflow.</p></div>
        <FamilyRetreatBookingsTable bookings={bookings} />
      </section>
      <RecoveredPaymentSection title="Recovered Family Retreat Bookings" records={recoveredPayments} />
    </div>
  )
}

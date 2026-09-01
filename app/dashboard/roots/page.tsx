import { createClient } from "@supabase/supabase-js"
import { RootsBookingsTable } from "@/components/roots/roots-bookings-table"
import { RecoveredPaymentSection, type RecoveredPaymentRecord } from "@/components/dashboard/recovered-payment-section"
export const dynamic = "force-dynamic"
export const metadata = { title: "Roots Bookings | Dashboard" }
async function getData() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
  const [bookingsResult, recoveredResult] = await Promise.all([supabase.from("roots_bookings").select("*").order("created_at", { ascending: false }), supabase.from("recovery_payment_ledger").select("id, source, occurred_at, amount, currency, payment_status, customer_name, customer_email, customer_phone, payment_reference").ilike("description", "%Roots Residential%").order("occurred_at", { ascending: false })])
  if (bookingsResult.error) console.error("[dashboard/roots] fetch error:", bookingsResult.error)
  return { bookings: bookingsResult.data ?? [], recoveredPayments: (recoveredResult.data ?? []) as RecoveredPaymentRecord[] }
}
export default async function RootsDashboardPage() { const { bookings, recoveredPayments } = await getData(); return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-foreground">Roots Bookings</h1><p className="text-sm text-muted-foreground mt-1">Manage booking requests for Roots Residential.</p></div><RootsBookingsTable bookings={bookings} /><RecoveredPaymentSection title="Recovered Roots Residential Bookings" records={recoveredPayments} /></div> }

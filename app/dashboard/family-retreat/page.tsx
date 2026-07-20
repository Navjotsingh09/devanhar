import { createClient } from "@supabase/supabase-js"
import { FamilyRetreatBookingsTable, type FamilyRetreatBooking } from "@/components/family-retreat/family-retreat-bookings-table"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Sikh Family Retreat Bookings | Dashboard",
}

async function getFamilyRetreatBookings(): Promise<FamilyRetreatBooking[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!url || !key) {
    console.error("[dashboard/family-retreat] missing Supabase env vars")
    return []
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from("family_retreat_bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[dashboard/family-retreat] fetch failed", error)
    return []
  }

  return (data || []) as FamilyRetreatBooking[]
}

export default async function FamilyRetreatDashboardPage() {
  const bookings = await getFamilyRetreatBookings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sikh Family Retreat Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage approvals, payments, additional charges, and records for retreat applications.
        </p>
      </div>
      <FamilyRetreatBookingsTable bookings={bookings} />
    </div>
  )
}

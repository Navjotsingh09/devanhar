import { createClient } from "@supabase/supabase-js"
import { RootsBookingsTable } from "@/components/roots/roots-bookings-table"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Roots Bookings | Dashboard",
}

async function getBookings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from("roots_bookings")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("[dashboard/roots] fetch error:", error)
    return []
  }
  return data ?? []
}

export default async function RootsDashboardPage() {
  const bookings = await getBookings()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roots Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage booking requests for Roots Residential.
        </p>
      </div>
      <RootsBookingsTable bookings={bookings} />
    </div>
  )
}

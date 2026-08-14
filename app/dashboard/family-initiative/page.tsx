import { createClient } from "@supabase/supabase-js"
import { FamilyInitiativeBookingsTable, type FamilyInitiativeBooking } from "@/components/family-initiative/family-initiative-bookings-table"

export const dynamic = "force-dynamic"
export const metadata = { title: "Sikh Family Initiative Bookings | Dashboard" }

async function getBookings(): Promise<FamilyInitiativeBooking[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!url || !key) return []
  const { data, error } = await createClient(url, key).from("family_initiative_bookings").select("*").order("created_at", { ascending: false })
  if (error) { console.error("[dashboard/family-initiative] fetch failed", error); return [] }
  return (data || []) as FamilyInitiativeBooking[]
}

export default async function FamilyInitiativeDashboardPage() {
  const bookings = await getBookings()
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-foreground">Sikh Family Initiative</h1><p className="mt-1 text-sm text-muted-foreground">Manage Family Fun Day - Summer Extravaganza booking requests, attendee details, transport, and follow-up.</p></div><FamilyInitiativeBookingsTable bookings={bookings} /></div>
}

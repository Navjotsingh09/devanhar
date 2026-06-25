import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Home } from 'lucide-react'
import { FamilyRetreatBookingsTable } from '@/components/family-retreat/family-retreat-bookings-table'
import type { FamilyRetreatBooking } from '@/components/family-retreat/family-retreat-bookings-table'

export const dynamic = "force-dynamic"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createServiceClient(url, key)
}

async function getFamilyRetreatBookings(): Promise<FamilyRetreatBooking[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('family_retreat_bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)
  if (error) {
    console.error('[family-retreat dashboard]', error)
    return []
  }
  return (data ?? []) as FamilyRetreatBooking[]
}

export default async function FamilyRetreatDashboard() {
  const bookings = await getFamilyRetreatBookings()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Home className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sikh Family Retreat</h1>
          <p className="text-muted-foreground">Family booking requests — confirm, waitlist or decline</p>
        </div>
      </div>
      <FamilyRetreatBookingsTable bookings={bookings} />
    </div>
  )
}

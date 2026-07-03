import { createClient } from '@supabase/supabase-js'
import { DayPassBookingsTable } from '@/components/family-retreat/day-pass-bookings-table'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export default async function DayPassDashboardPage() {
  const supabase = getSupabaseAdmin()
  const { data: bookings, error } = await supabase
    .from('family_retreat_day_pass_bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-600">Failed to load bookings: {error.message}</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Sikh Family Retreat</p>
        <h1 className="text-2xl font-bold text-foreground">Day Pass Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Hilston Park, Wales &mdash; 23&ndash;26 July 2026</p>
      </div>
      <DayPassBookingsTable bookings={bookings ?? []} />
    </div>
  )
}

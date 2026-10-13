import type { SupabaseClient } from '@supabase/supabase-js'
import type { PadelEntry } from '@/components/padel/padel-entries-dashboard'
import { getPadelPaymentStatus } from '@/lib/padel-payment'

export async function getPadelEntries(supabase: SupabaseClient): Promise<PadelEntry[]> {
  const { data, error } = await supabase.from('padel_registrations').select('*').order('created_at', { ascending: false })
  if (error) throw new Error('Unable to load tournament registrations: ' + error.message)
  return (data || []).map(row => ({
    id: row.id, name: `${row.captain_first_name} ${row.captain_last_name}`,
    email: row.captain_email, phone: row.captain_phone,
    amount: row.entry_fee_pence == null ? null : row.entry_fee_pence / 100, currency: 'GBP',
    status: row.status === 'approved' ? 'approved' : row.status === 'declined' ? 'declined' : row.status === 'archived' ? 'archived' : 'pending',
    paymentStatus: getPadelPaymentStatus(row), eventName: row.event_name || 'SPA tournament',
    source: 'Live registration', created_at: row.created_at, details: row, isLiveRegistration: true,
  }))
}

import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { checkPadelStaffAccess } from '@/lib/padel-admin'
import { getPadelPaymentStatus } from '@/lib/padel-payment'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const fields = [
  'id', 'event_name', 'tournament_id', 'created_at', 'status', 'payment_status',
  'captain_first_name', 'captain_last_name', 'captain_date_of_birth', 'captain_email',
  'captain_phone', 'city_country', 'playtomic_id', 'occupation', 'captain_gender',
  'captain_playtomic_ranking', 'player2_first_name', 'player2_last_name',
  'player2_date_of_birth', 'player2_phone', 'player2_playtomic_id',
  'player2_occupation', 'player2_gender', 'player2_playtomic_ranking',
  'entry_fee_pence', 'payment_provider', 'stripe_pi_status',
] as const

export async function GET() {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) return NextResponse.json({ error: 'SPA access required' }, { status: 403 })
  try {
    // Fetch every page, without application/payment filters (including archived).
    // Stable ordering prevents page boundaries shifting between equal timestamps.
    const rows: Record<string, unknown>[] = []
    const pageSize = 500
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase.from('padel_registrations')
        .select(fields.join(',')).ilike('event_name', '%Amsterdam%')
        .order('created_at', { ascending: false }).order('id')
        .range(from, from + pageSize - 1)
      if (error) throw error
      const page = (data || []) as unknown as Record<string, unknown>[]
      rows.push(...page)
      if (page.length < pageSize) break
    }
    if (!rows.length) return NextResponse.json({ error: 'No Amsterdam applications found.' }, { status: 404 })
    const exported = rows.map(row => ({
      ...Object.fromEntries(fields.filter(key => key !== 'entry_fee_pence').map(key => [key, row[key] ?? ''])),
      verified_payment_status: getPadelPaymentStatus({ payment_status: row.payment_status as string | null, stripe_pi_status: row.stripe_pi_status as string | null }),
      entry_fee_gbp: row.entry_fee_pence == null ? '' : Number(row.entry_fee_pence) / 100,
    }))
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.json_to_sheet(exported)
    sheet['!autofilter'] = { ref: sheet['!ref']! }
    sheet['!cols'] = Object.keys(exported[0]).map(() => ({ wch: 24 }))
    XLSX.utils.book_append_sheet(workbook, sheet, 'Amsterdam Applications')
    // json_to_sheet stores applicant text as strings, never executable formulas.
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return new Response(new Uint8Array(buffer), { headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="SPA-Amsterdam-Applications.xlsx"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } })
  } catch {
    return NextResponse.json({ error: 'Unable to export applications. Please try again.' }, { status: 500 })
  }
}

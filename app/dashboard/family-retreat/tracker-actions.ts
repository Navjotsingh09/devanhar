'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { encodeRetreatQuote, parseRetreatPounds, retreatTrackerActions } from '@/lib/family-retreat-tracker'

type RetreatEventResult = { success: true; refreshWarning?: string } | { success: false; error: string }

export async function recordRetreatEvent(bookingId: string, form: FormData) {
  let staff: Awaited<ReturnType<typeof getRequestStaff>>
  try {
    staff = await getRequestStaff()
  } catch {
    console.error('[family-retreat-tracker] Staff access lookup failed')
    return { success: false, error: 'Could not verify your account. Reload the page and sign in again.' } satisfies RetreatEventResult
  }
  const { user, authError, profile, grants } = staff
  if (authError || !user || profile.error || !profile.data || grants.error || !Array.isArray(grants.data))
    return { success: false, error: 'Sign in with an authorised account to update the booking.' } satisfies RetreatEventResult
  const reviewer = ['admin', 'super_admin'].includes(profile.data.role)
  if (!reviewer && !grants.data.some(row => row.programme === 'family'))
    return { success: false, error: 'Family Retreat access is required.' } satisfies RetreatEventResult
  const action = String(form.get('action') ?? '')
  if (!retreatTrackerActions.some(value => value === action))
    return { success: false, error: 'Unknown booking action.' } satisfies RetreatEventResult
  if (['refund_approved', 'refund_declined', 'refund_recorded'].includes(action) && !reviewer)
    return { success: false, error: 'Only an administrator can review or record a refund.' } satisfies RetreatEventResult
  const amount = parseRetreatPounds(String(form.get('amount') ?? ''))
  if (['link_sent', 'payment', 'refund_requested'].includes(action) && amount === null)
    return { success: false, error: 'Enter a valid amount in pounds.' } satisfies RetreatEventResult
  let note = String(form.get('note') ?? '').trim()
  if (action === 'link_sent') {
    const headcount = Number(form.get('headcount'))
    if (!Number.isSafeInteger(headcount) || headcount < 1 || headcount > 1000)
      return { success: false, error: 'Enter the total number of people attending, including children.' } satisfies RetreatEventResult
    note = encodeRetreatQuote(headcount, note)
    if (note.length > 1000)
      return { success: false, error: 'Please shorten the payment request note.' } satisfies RetreatEventResult
  }
  const requestId = Number(form.get('requestId'))
  if (['refund_approved', 'refund_declined', 'refund_recorded'].includes(action) && (!Number.isSafeInteger(requestId) || requestId < 1))
    return { success: false, error: 'Reload the booking and select the refund again.' } satisfies RetreatEventResult
  const reference = String(form.get('reference') ?? '').trim()
  const date = String(form.get('date') ?? '')
  if (['payment', 'refund_recorded'].includes(action)) {
    if (form.get('verified') !== 'on')
      return { success: false, error: 'Confirm that you checked the completed transaction.' } satisfies RetreatEventResult
    if (!/^[A-Za-z0-9][A-Za-z0-9 ./_-]{1,99}$/.test(reference) || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return { success: false, error: 'Enter the provider reference and date.' } satisfies RetreatEventResult
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key)
    return { success: false, error: 'Booking tracker configuration is unavailable. Contact an administrator.' } satisfies RetreatEventResult
  let rpcError: { code?: string; message: string } | null = null
  try {
    const db = createClient(url, key, { auth: { persistSession: false } })
    const result = await db.rpc('record_family_retreat_tracker', {
      p_booking_id: bookingId, p_action: action, p_actor: user.id,
      p_amount: amount, p_note: note,
      p_reference: reference || null, p_occurred_on: date || null, p_request_id: requestId || null,
    })
    rpcError = result.error
  } catch {
    console.error('[family-retreat-tracker] Database call failed', { action })
    return { success: false, error: 'The booking update could not be saved. Please reload and try again.' } satisfies RetreatEventResult
  }
  if (rpcError) {
    console.error('[family-retreat-tracker] Database rejected update', { action, code: rpcError.code })
    if (rpcError.code === 'P0001') {
      return { success: false, error: rpcError.message } satisfies RetreatEventResult
    }
    if (rpcError.code === 'PGRST202' || rpcError.code === '42883') {
      return { success: false, error: 'The booking tracker database setup is incomplete. Contact an administrator.' } satisfies RetreatEventResult
    }
    return { success: false, error: 'The booking update could not be saved. Please reload and try again.' } satisfies RetreatEventResult
  }

  try {
    revalidatePath('/dashboard/family-initiative/retreat')
    return { success: true } satisfies RetreatEventResult
  } catch {
    console.error('[family-retreat-tracker] Event saved but dashboard refresh failed', { action })
    return { success: true, refreshWarning: 'Saved. Reload the dashboard to see the update.' } satisfies RetreatEventResult
  }
}

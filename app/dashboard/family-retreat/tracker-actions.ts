'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { encodeRetreatQuote, parseRetreatPounds, retreatTrackerActions } from '@/lib/family-retreat-tracker'

export async function recordRetreatEvent(bookingId: string, form: FormData) {
  const { user, authError, profile, grants } = await getRequestStaff()
  if (authError || !user || profile.error || !profile.data || grants.error || !Array.isArray(grants.data))
    throw new Error('Sign in with an authorised account to update the booking.')
  const reviewer = ['admin', 'super_admin'].includes(profile.data.role)
  if (!reviewer && !grants.data.some(row => row.programme === 'family')) throw new Error('Family Retreat access is required.')
  const action = String(form.get('action') ?? '')
  if (!retreatTrackerActions.some(value => value === action)) throw new Error('Unknown booking action.')
  if (['refund_approved', 'refund_declined', 'refund_recorded'].includes(action) && !reviewer)
    throw new Error('Only an administrator can review or record a refund.')
  const amount = parseRetreatPounds(String(form.get('amount') ?? ''))
  if (['link_sent', 'payment', 'refund_requested'].includes(action) && amount === null)
    throw new Error('Enter a valid amount in pounds.')
  let note = String(form.get('note') ?? '').trim()
  if (action === 'link_sent') {
    const headcount = Number(form.get('headcount'))
    if (!Number.isSafeInteger(headcount) || headcount < 1 || headcount > 1000)
      throw new Error('Enter the total number of people attending, including children.')
    note = encodeRetreatQuote(headcount, note)
    if (note.length > 1000) throw new Error('Please shorten the payment request note.')
  }
  const requestId = Number(form.get('requestId'))
  if (['refund_approved', 'refund_declined', 'refund_recorded'].includes(action) && (!Number.isSafeInteger(requestId) || requestId < 1))
    throw new Error('Reload the booking and select the refund again.')
  const reference = String(form.get('reference') ?? '').trim()
  const date = String(form.get('date') ?? '')
  if (['payment', 'refund_recorded'].includes(action)) {
    if (form.get('verified') !== 'on') throw new Error('Confirm that you checked the completed transaction.')
    if (!/^[A-Za-z0-9][A-Za-z0-9 ./_-]{1,99}$/.test(reference) || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new Error('Enter the provider reference and date.')
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Booking tracker is unavailable.')
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await db.rpc('record_family_retreat_tracker', {
    p_booking_id: bookingId, p_action: action, p_actor: user.id,
    p_amount: amount, p_note: note,
    p_reference: reference || null, p_occurred_on: date || null, p_request_id: requestId || null,
  })
  if (error) {
    if (error.code === 'P0001') throw new Error(error.message)
    throw new Error('The booking update could not be saved. Please reload and try again.')
  }
  revalidatePath('/dashboard/family-initiative/retreat')
}

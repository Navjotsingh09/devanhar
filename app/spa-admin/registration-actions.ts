'use server'

import { checkPadelStaffAccess } from '@/lib/padel-admin'
import { getPadelPaymentStatus } from '@/lib/padel-payment'
import { revalidatePath } from 'next/cache'
import { sendPadelRegistrationApprovedEmail, sendPadelRegistrationDeclinedEmail } from '@/lib/padel-registration-emails'

async function registration(id: string) {
  const supabase = await checkPadelStaffAccess()
  if (!supabase) throw new Error('Only authorised SPA organisers may manage applications')
  const { data: { user } } = await supabase.auth.getUser()
  const { data: row, error } = await supabase.from('padel_registrations').select('*').eq('id', id).single()
  if (error || !row || !user) throw new Error('Registration not found')
  return { supabase, row, user }
}

function refresh() {
  revalidatePath('/dashboard/padel')
  revalidatePath('/dashboard/submissions')
  revalidatePath('/spa-admin', 'layout')
}

export async function decidePadelRegistration(id: string, decision: 'approved' | 'declined') {
  if (!['approved', 'declined'].includes(decision)) throw new Error('Invalid decision')
  const { supabase, row, user } = await registration(id)
  if (row.status === 'archived') throw new Error('Archived applications cannot be changed')
  if (row.status === decision) throw new Error(`Already ${decision}`)
  if (row.status === 'declined' && decision === 'approved') throw new Error('A declined application cannot be approved without a new application')
  const { data, error } = await supabase.from('padel_registrations')
    .update({ status: decision, reviewed_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', id).eq('status', row.status).select('id').single()
  if (error || !data) throw new Error('Application changed or could not be saved. Refresh and try again.')
  await supabase.from('padel_activity_log').insert({ admin_id: user.id, registration_id: id, action: decision })
  refresh()
  const params = {
    to: row.captain_email, firstName: row.captain_first_name || 'Player',
    teamName: `${row.captain_first_name} & ${row.player2_first_name}`,
    paymentVerified: getPadelPaymentStatus(row) === 'paid',
  }
  const emailSent = decision === 'approved'
    ? await sendPadelRegistrationApprovedEmail(params)
    : await sendPadelRegistrationDeclinedEmail(params)
  return { success: true, emailSent }
}

export async function archivePadelRegistration(id: string) {
  const { supabase, row, user } = await registration(id)
  if (row.status === 'archived') throw new Error('Already archived')
  const { data, error } = await supabase.from('padel_registrations')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id).eq('status', row.status).select('id').single()
  if (error || !data) throw new Error('Unable to archive. Refresh and try again.')
  await supabase.from('padel_activity_log').insert({ admin_id: user.id, registration_id: id, action: 'archived' })
  refresh()
}

export async function recordPadelPayment(id: string, reference: string, amountPence: number) {
  const { supabase, row, user } = await registration(id)
  if (['declined', 'archived', 'cancelled', 'rejected'].includes(row.status)) throw new Error('Payment cannot confirm an inactive or declined application')
  if (getPadelPaymentStatus(row) === 'paid') throw new Error('Payment is already recorded')
  if (reference.trim().length < 3 || reference.length > 255) throw new Error('Enter the payment receipt or transaction reference')
  if (!Number.isSafeInteger(amountPence) || amountPence <= 0 || amountPence !== row.entry_fee_pence) {
    throw new Error('The verified amount must match the team entry fee')
  }
  const { data, error } = await supabase.from('padel_registrations').update({
    status: 'approved', payment_status: 'paid', payment_reference: reference.trim(),
    final_amount_pence: amountPence, payment_verified_by: user.id,
    payment_verified_at: new Date().toISOString(), reviewed_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('status', row.status).eq('payment_status', row.payment_status).select('id').single()
  if (error || !data) throw new Error('Payment could not be saved. Refresh and try again.')
  await supabase.from('padel_activity_log').insert({
    admin_id: user.id, registration_id: id, action: 'payment_verified',
    metadata: { reference: reference.trim(), amount_pence: amountPence, provider: row.payment_provider },
  })
  refresh()
  const emailSent = await sendPadelRegistrationApprovedEmail({
    to: row.captain_email, firstName: row.captain_first_name || 'Player',
    teamName: `${row.captain_first_name} & ${row.player2_first_name}`, paymentVerified: true,
  })
  return { success: true, emailSent }
}

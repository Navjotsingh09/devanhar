'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { sendApprovalEmail, sendDeclineEmail } from '@/lib/resend-email'
import { revalidatePath } from 'next/cache'

type SourceTable = 'form_submissions' | 'camp_applications'

export async function updateSubmissionStatus(id: string, status: string, sourceTable: SourceTable = 'form_submissions') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from(sourceTable)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Updated ${sourceTable === 'camp_applications' ? 'camp application' : 'submission'} status to ${status}`,
    entity_type: sourceTable === 'camp_applications' ? 'camp_application' : 'form_submission',
    entity_id: id,
  })

  revalidatePath('/dashboard/submissions')
}

export async function updateSubmissionNotes(id: string, notes: string, sourceTable: SourceTable = 'form_submissions') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from(sourceTable)
    .update({ internal_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/submissions')
}

export async function assignSubmission(id: string, adminId: string | null, sourceTable: SourceTable = 'form_submissions') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (sourceTable === 'form_submissions') {
    updateData.assigned_to = adminId
  } else {
    updateData.reviewed_by = adminId
  }

  const { error } = await supabase
    .from(sourceTable)
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Assigned ${sourceTable === 'camp_applications' ? 'camp application' : 'submission'}`,
    entity_type: sourceTable === 'camp_applications' ? 'camp_application' : 'form_submission',
    entity_id: id,
  })

  revalidatePath('/dashboard/submissions')
}


export async function captureApplicationPayment(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: app } = await supabase.from('camp_applications').select('stripe_payment_intent_id, status, first_name, last_name, email, requires_payment_support').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'approved') throw new Error('Already approved')
  if (app.stripe_payment_intent_id) { const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); await stripe.paymentIntents.capture(app.stripe_payment_intent_id) }
  await supabase.from('camp_applications').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', applicationId)
  await supabase.from('activity_log').insert({ admin_id: user.id, action: 'Approved ' + app.first_name + ' ' + app.last_name, entity_type: 'camp_application', entity_id: applicationId })
  sendApprovalEmail(app.email, app.first_name, app.requires_payment_support === true).catch(() => {})
  revalidatePath('/dashboard/submissions')
}

export async function cancelApplicationPayment(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: app } = await supabase.from('camp_applications').select('stripe_payment_intent_id, status, first_name, last_name, email').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'declined') throw new Error('Already declined')
  if (app.stripe_payment_intent_id) { const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); try { await stripe.paymentIntents.cancel(app.stripe_payment_intent_id) } catch { await stripe.refunds.create({ payment_intent: app.stripe_payment_intent_id }) } }
  await supabase.from('camp_applications').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', applicationId)
  await supabase.from('activity_log').insert({ admin_id: user.id, action: 'Declined ' + app.first_name + ' ' + app.last_name, entity_type: 'camp_application', entity_id: applicationId })
  sendDeclineEmail(app.email, app.first_name).catch(() => {})
  revalidatePath('/dashboard/submissions')
}

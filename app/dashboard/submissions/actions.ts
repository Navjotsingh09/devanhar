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
  const { data: app } = await supabase.from('camp_applications').select('*').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'approved') throw new Error('Already approved')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  if (app.stripe_payment_intent_id) {
    try { await stripe.paymentIntents.capture(app.stripe_payment_intent_id) } catch (captureErr: any) {
      if (captureErr?.code !== 'payment_intent_unexpected_state') throw captureErr
      console.warn('[Capture] Payment intent already captured or in unexpected state')
    }
  }
  await supabase.from('camp_applications').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', applicationId)
  await supabase.from('activity_log').insert({ admin_id: user.id, action: 'Approved ' + app.first_name + ' ' + app.last_name, entity_type: 'camp_application', entity_id: applicationId })
  // Create monthly subscription if opted in
  if (app.monthly_donation_opted && Number(app.monthly_donation_amount) > 0 && app.stripe_payment_intent_id) {
    try {
      const pi = await stripe.paymentIntents.retrieve(app.stripe_payment_intent_id, { expand: ['customer', 'payment_method'] })
      if (pi.customer && pi.payment_method) {
        const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer.id
        const pmId = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method.id
        await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: pmId } })
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: (await stripe.prices.create({ currency: 'gbp', unit_amount: Math.round(app.monthly_donation_amount * 100), recurring: { interval: 'month' }, product_data: { name: 'Devanhaar Monthly Donation' } })).id }],
          metadata: { camp_application_id: applicationId },
        })
        await supabase.from('camp_applications').update({ stripe_subscription_id: subscription.id }).eq('id', applicationId)
        console.log('[Subscription] Created monthly subscription:', subscription.id)
      }
    } catch (subErr) {
      console.error('[Subscription] Failed to create monthly subscription (non-blocking):', subErr)
    }
  }
  sendApprovalEmail(app.email, app.first_name, app.requires_payment_support === true, Number(app.donation_amount) || 199, Number(app.monthly_donation_amount) || 0).catch(() => {})
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

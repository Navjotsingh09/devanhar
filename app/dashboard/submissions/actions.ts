'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { sendApprovalEmail, sendDeclineEmail } from '@/lib/resend-email'
import { revalidatePath } from 'next/cache'
import { buildResumeUrl } from '@/lib/camp-resume-token'
import { sendApplicationPaymentReminderEmail } from '@/lib/camp-applicant-emails'

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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  if (app.stripe_payment_intent_id) {
    // Idempotent: only capture if the PI is still in requires_capture. This
    // lets admins safely re-run on records that were marked approved in the
    // DB without the Stripe capture having actually run.
    try {
      const pi = await stripe.paymentIntents.retrieve(app.stripe_payment_intent_id)
      if (pi.status === 'requires_capture') {
        await stripe.paymentIntents.capture(app.stripe_payment_intent_id)
      } else if (pi.status === 'succeeded') {
        console.log('[Capture] Payment intent already captured:', pi.id)
      } else {
        throw new Error(`Cannot capture payment in state "${pi.status}"`)
      }
    } catch (captureErr: any) {
      if (captureErr?.code === 'payment_intent_unexpected_state') {
        console.warn('[Capture] Payment intent already captured or in unexpected state')
      } else {
        throw captureErr
      }
    }
  } else if (app.status === 'approved') {
    throw new Error('Already approved (no payment intent on file)')
  } else if (app.requires_payment_support === true) {
    // Payment-support applicants are approved manually by the team without Stripe.
    // No capture needed — fall through to DB update and send approval email directly.
    sendApprovalEmail(app.email, app.first_name, true, Number(app.donation_amount) || 199, 0).catch(() => {})
  } else {
    // stripe_payment_intent_id is null and not yet approved — payment was never
    // authorized (applicant never completed checkout). Refuse to silently approve.
    throw new Error('No payment intent on file — applicant has not completed checkout. Use "Requires Payment Support" flow or ensure the applicant pays first.')
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
  // NOTE: Approval email is sent by the Stripe webhook (payment_intent.succeeded),
  // which fires after the capture above completes. Do not send it here to avoid duplicates.
  revalidatePath('/dashboard/submissions')
}

export async function cancelApplicationPayment(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: app } = await supabase.from('camp_applications').select('stripe_payment_intent_id, status, first_name, last_name, email').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'declined') throw new Error('Already declined')
  if (app.stripe_payment_intent_id) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    try {
      await stripe.paymentIntents.cancel(app.stripe_payment_intent_id)
    } catch (cancelErr: any) {
      // If PI is already captured (succeeded), issue a refund instead
      if (cancelErr?.code === 'payment_intent_unexpected_state') {
        try {
          await stripe.refunds.create({ payment_intent: app.stripe_payment_intent_id })
        } catch (refundErr: any) {
          console.error('[Decline] Refund failed after cancel failed:', refundErr?.message)
          throw new Error(`Could not release payment: ${refundErr?.message || 'Refund failed'}`)
        }
      } else {
        throw cancelErr
      }
    }
  }
  await supabase.from('camp_applications').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', applicationId)
  await supabase.from('activity_log').insert({ admin_id: user.id, action: 'Declined ' + app.first_name + ' ' + app.last_name, entity_type: 'camp_application', entity_id: applicationId })
  sendDeclineEmail(app.email, app.first_name).catch(() => {})
  revalidatePath('/dashboard/submissions')
}

export async function deleteSubmission(id: string, sourceTable: SourceTable = 'form_submissions') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (sourceTable === 'camp_applications') {
    const { data: app } = await supabase
      .from('camp_applications')
      .select('first_name, last_name, email, stripe_payment_intent_id')
      .eq('id', id)
      .single()

    if (app?.stripe_payment_intent_id) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        const pi = await stripe.paymentIntents.retrieve(app.stripe_payment_intent_id)
        if (pi.status === 'requires_capture' || pi.status === 'requires_payment_method' || pi.status === 'requires_confirmation' || pi.status === 'requires_action') {
          await stripe.paymentIntents.cancel(app.stripe_payment_intent_id)
        }
      } catch (err) {
        console.warn('[Delete] Failed to cancel Stripe PI before delete (continuing):', err)
      }
    }

    await supabase.from('activity_log').insert({
      admin_id: user.id,
      action: `Deleted camp application: ${app?.first_name ?? ''} ${app?.last_name ?? ''} <${app?.email ?? ''}>`,
      entity_type: 'camp_application',
      entity_id: id,
    })
  } else {
    await supabase.from('activity_log').insert({
      admin_id: user.id,
      action: 'Deleted form submission',
      entity_type: 'form_submission',
      entity_id: id,
    })
  }

  const { error } = await supabase.from(sourceTable).delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/submissions')
}

export async function resendPaymentLink(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: app } = await supabase.from('camp_applications').select('id, email, first_name, last_name, initiative_id, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid, status, stripe_payment_intent_id').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  const isBrokenApproval = app.status === 'approved' && !app.stripe_payment_intent_id
  if (app.status !== 'payment_pending' && !isBrokenApproval) {
    throw new Error(`Cannot resend payment link: status is "${app.status}" and a payment intent already exists`)
  }
  if (isBrokenApproval) {
    await supabase.from('camp_applications').update({ status: 'payment_pending', updated_at: new Date().toISOString() }).eq('id', applicationId)
    await supabase.from('activity_log').insert({ admin_id: user.id, action: `Reset status from approved -> payment_pending (no PI on file, sending fresh payment link)`, entity_type: 'camp_application', entity_id: applicationId })
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY')
  const stripe = new Stripe(stripeKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || '199')
  let initiativeSlug = 'singhs-camp'
  if (app.initiative_id) {
    const { data: init } = await supabase.from('initiatives').select('slug').eq('id', app.initiative_id).maybeSingle()
    if (init?.slug) initiativeSlug = init.slug
  }
  const initiativePath = `/initiatives/${initiativeSlug}`
  const returnTo = encodeURIComponent(initiativePath)
  const donationAmountPence = app.stripe_checkout_amount_pence && app.stripe_checkout_amount_pence > 0 ? app.stripe_checkout_amount_pence : campFeeGbp * 100
  const session = await stripe.checkout.sessions.create({ mode: 'payment', payment_method_types: ['card'], payment_intent_data: { capture_method: 'manual', ...(app.monthly_donation_opted ? { setup_future_usage: 'off_session' } : {}), metadata: { camp_application_id: app.id } }, customer_email: app.email, customer_creation: 'always',
    line_items: [{ price_data: { currency: 'gbp', unit_amount: donationAmountPence, product_data: { name: 'Singhs Camp UK Camp Fee', description: `One-off donation for ${app.first_name} ${app.last_name}` } }, quantity: 1 }],
    custom_fields: [{ key: 'gift_aid', label: { type: 'custom', custom: 'Gift Aid declaration' }, type: 'dropdown', optional: false, dropdown: { options: [{ label: 'Yes - I am a UK taxpayer and want Devanhaar to claim Gift Aid', value: 'yes' }, { label: 'No - do not claim Gift Aid on this payment', value: 'no' }] } }],
    metadata: { camp_application_id: app.id, gift_aid: app.gift_aid ? 'true' : 'false', monthly_donation_opted: app.monthly_donation_opted ? 'true' : 'false', monthly_donation_amount: app.monthly_donation_opted ? String(app.monthly_donation_amount || '0') : '0', resumed: 'admin_resend' },
    success_url: `${siteUrl}${initiativePath}?payment=success`, cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&applicationId=${app.id}` })
  await supabase.from('camp_applications').update({ stripe_checkout_session_id: session.id, stripe_checkout_url: session.url, stripe_checkout_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null, stripe_checkout_amount_pence: donationAmountPence, payment_reminder_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', applicationId)
  const resumeUrl = buildResumeUrl(siteUrl, String(app.id))
  await sendApplicationPaymentReminderEmail({ to: app.email, firstName: app.first_name || 'Applicant', resumeUrl, amountGbp: Math.round(donationAmountPence) / 100 })
  await supabase.from('activity_log').insert({ admin_id: user.id, action: `Resent payment link to ${app.first_name} ${app.last_name} <${app.email}>`, entity_type: 'camp_application', entity_id: applicationId })
  revalidatePath('/dashboard/submissions')
}

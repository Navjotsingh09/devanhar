'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'
import { buildResumeUrl } from '@/lib/camp-resume-token'
import { sendApplicationPaymentReminderEmail, sendApplicationApprovedEmail, sendApplicationDeclinedEmail } from '@/lib/camp-applicant-emails'
import { sendVidyalaApprovalEmail, sendVidyalaDeclineEmail } from '@/lib/vidyala-emails'

type SourceTable = 'form_submissions' | 'camp_applications' | 'vidyala_applications' | 'padel_registrations'

/**
 * Locate the Stripe PaymentIntent that belongs to a camp_application even
 * when stripe_payment_intent_id is NULL in Supabase. Mirrors the fallback
 * chain used by app/dashboard/submissions/page.tsx fetchStripeStatusMap so
 * the admin actions can't fail just because the column was never populated.
 *
 * Lookup order:
 *   1. app.stripe_payment_intent_id (direct)
 *   2. app.stripe_checkout_session_id -> session.payment_intent
 *   3. Stripe PIs with metadata.camp_application_id == app.id
 *   4. Stripe PIs whose receipt_email matches app.email (newest, prefer
 *      requires_capture or succeeded)
 *
 * Returns null if nothing matches. Pure read-only; safe to call freely.
 */
async function findStripePiForApp(
  stripe: Stripe,
  app: { id: string | number; email?: string | null; stripe_payment_intent_id?: string | null; stripe_checkout_session_id?: string | null }
): Promise<Stripe.PaymentIntent | null> {
  // 1) Direct PI id.
  if (app.stripe_payment_intent_id) {
    try {
      return await stripe.paymentIntents.retrieve(app.stripe_payment_intent_id)
    } catch (e) {
      console.warn('[findStripePiForApp] direct PI retrieve failed:', (e as Error).message)
    }
  }

  // 2) Checkout session -> PI.
  if (app.stripe_checkout_session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(app.stripe_checkout_session_id)
      if (session.payment_intent && typeof session.payment_intent === 'string') {
        return await stripe.paymentIntents.retrieve(session.payment_intent)
      }
    } catch (e) {
      console.warn('[findStripePiForApp] session lookup failed:', (e as Error).message)
    }
  }

  // 3 + 4) Scan recent PIs for metadata match or email match. Page through
  // up to 5 pages (~500 PIs) within the last 18 months. The created filter
  // is essential — without it Stripe can stream forever and hit Vercel's
  // function timeout.
  const email = (app.email || '').toLowerCase().trim()
  const appIdStr = String(app.id)
  const eighteenMonthsAgoSec = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30 * 18
  let startingAfter: string | undefined
  for (let pageIdx = 0; pageIdx < 5; pageIdx++) {
    const pg: Stripe.ApiList<Stripe.PaymentIntent> = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: eighteenMonthsAgoSec },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    // metadata match wins
    for (const pi of pg.data) {
      const metaId = pi.metadata?.camp_application_id
      if (metaId && String(metaId) === appIdStr) return pi
    }
    // email match (prefer requires_capture, then succeeded, then newest)
    if (email) {
      const matches = pg.data.filter(pi => (pi.receipt_email || pi.metadata?.email || '').toLowerCase().trim() === email)
      if (matches.length > 0) {
        const order = ['requires_capture', 'succeeded']
        matches.sort((a, b) => {
          const ai = order.indexOf(a.status) === -1 ? 99 : order.indexOf(a.status)
          const bi = order.indexOf(b.status) === -1 ? 99 : order.indexOf(b.status)
          return ai !== bi ? ai - bi : b.created - a.created
        })
        return matches[0]
      }
    }
    if (!pg.has_more) break
    startingAfter = pg.data[pg.data.length - 1].id
  }

  return null
}


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

  // Resolve the PI even if stripe_payment_intent_id is NULL (column was not
  // populated for some legacy records). Mirrors page.tsx fallback chain.
  const pi = await findStripePiForApp(stripe, app)
  let resolvedPiId: string | null = pi?.id ?? null

  if (pi) {
    if (pi.status === 'requires_capture') {
      try {
        await stripe.paymentIntents.capture(pi.id)
      } catch (captureErr: any) {
        if (captureErr?.code === 'payment_intent_unexpected_state') {
          console.warn('[Capture] PI already captured between retrieve and capture')
        } else {
          throw captureErr
        }
      }
    } else if (pi.status === 'succeeded') {
      console.log('[Capture] Payment intent already captured:', pi.id)
    } else if (pi.status === 'requires_action') {
      throw new Error('Customer must complete 3-D Secure authentication before this can be captured. Resend payment link.')
    } else if (pi.status === 'canceled') {
      throw new Error('Payment was canceled or expired. Resend payment link to start a new authorisation.')
    } else {
      throw new Error(`Cannot capture payment in state "${pi.status}"`)
    }
  } else if (app.status === 'approved') {
    throw new Error('Already approved (no payment intent on file)')
  } else if (app.requires_payment_support === true) {
    // Payment-support applicants are approved manually by the team without Stripe.
    // No capture needed — fall through to DB update; approval email sent below.
  } else {
    // No PI in Stripe at all — applicant truly never started checkout.
    throw new Error('No payment intent on file — applicant has not completed checkout. Use "Requires Payment Support" flow or ensure the applicant pays first.')
  }

  // Backfill stripe_payment_intent_id so future reads don't need the fallback.
  const dbUpdate: Record<string, unknown> = { status: 'approved', updated_at: new Date().toISOString() }
  if (resolvedPiId && !app.stripe_payment_intent_id) dbUpdate.stripe_payment_intent_id = resolvedPiId
  await supabase.from('camp_applications').update(dbUpdate).eq('id', applicationId)
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
  // Send the approval email directly. The webhook's payment_intent.succeeded
  // handler has a .neq("status","approved") guard which no-ops since we already
  // flipped status above — so the action MUST own the email.
  if (app.email) {
    sendApplicationApprovedEmail({ to: app.email, firstName: app.first_name || 'Applicant' })
      .catch(err => console.error('[Capture] Approval email failed (non-blocking):', err))
  }
  revalidatePath('/dashboard/submissions')
}

export async function cancelApplicationPayment(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: app } = await supabase.from('camp_applications').select('id, stripe_payment_intent_id, stripe_checkout_session_id, status, first_name, last_name, email').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'declined') throw new Error('Already declined')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  // Find the PI even if stripe_payment_intent_id is NULL so we don't silently
  // leave money on a 7-day hold when an admin clicks Release.
  const pi = await findStripePiForApp(stripe, app)
  let resolvedPiId: string | null = pi?.id ?? null

  if (pi) {
    try {
      if (pi.status === 'succeeded') {
        // Already captured — refund.
        await stripe.refunds.create({ payment_intent: pi.id })
      } else if (pi.status !== 'canceled') {
        // requires_capture / requires_action / requires_payment_method / processing — cancel the hold.
        await stripe.paymentIntents.cancel(pi.id)
      }
    } catch (cancelErr: any) {
      if (cancelErr?.code === 'payment_intent_unexpected_state') {
        // Race: PI flipped between retrieve and cancel. Try refund as last resort.
        try { await stripe.refunds.create({ payment_intent: pi.id }) } catch (refundErr: any) {
          console.error('[Decline] Refund failed after cancel failed:', refundErr?.message)
          throw new Error(`Could not release payment: ${refundErr?.message || 'Refund failed'}`)
        }
      } else {
        throw cancelErr
      }
    }
  }

  const dbUpdate: Record<string, unknown> = { status: 'declined', updated_at: new Date().toISOString() }
  if (resolvedPiId && !app.stripe_payment_intent_id) dbUpdate.stripe_payment_intent_id = resolvedPiId
  await supabase.from('camp_applications').update(dbUpdate).eq('id', applicationId)
  await supabase.from('activity_log').insert({ admin_id: user.id, action: 'Declined ' + app.first_name + ' ' + app.last_name, entity_type: 'camp_application', entity_id: applicationId })
  // Send the decline email directly. Webhook payment_intent.canceled now has
  // a .neq("status","declined") guard, so it will not double-send.
  if (app.email) {
    sendApplicationDeclinedEmail({ to: app.email, firstName: app.first_name || 'Applicant' })
      .catch(err => console.error('[Decline] Decline email failed (non-blocking):', err))
  }
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

export async function resendPaymentLink(applicationId: string, opts?: { force?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: app } = await supabase.from('camp_applications').select('id, email, first_name, last_name, initiative_id, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid, status, stripe_payment_intent_id').eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')
  const isBrokenApproval = app.status === 'approved' && !app.stripe_payment_intent_id
  if (app.status !== 'payment_pending' && !isBrokenApproval) {
    throw new Error(`Cannot resend payment link: status is "${app.status}" and a payment intent already exists`)
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY')
  const stripe = new Stripe(stripeKey)

  // HARD GUARD: don't resend if Pritam (or any admin) already issued an
  // invoice / manual checkout session for this applicant via the Stripe
  // dashboard. Pass opts.force=true from the UI to override.
  if (!opts?.force) {
    try {
      const contactMap = await fetchStripeManualContactMap(stripe)
      const manual = contactMap.get((app.email || '').toLowerCase().trim())
      if (manual) {
        throw new Error(`Blocked: this applicant was already contacted manually via Stripe ${manual.kind} ${manual.identifier} (${manual.status}, GBP ${manual.amount_gbp.toFixed(2)}). Use the override option to send anyway.`)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.startsWith('Blocked:')) throw e
      throw new Error(`Could not verify Stripe to avoid duplicate sends: ${msg}`)
    }
  }

  if (isBrokenApproval) {
    await supabase.from('camp_applications').update({ status: 'payment_pending', updated_at: new Date().toISOString() }).eq('id', applicationId)
    await supabase.from('activity_log').insert({ admin_id: user.id, action: `Reset status from approved -> payment_pending (no PI on file, sending fresh payment link)`, entity_type: 'camp_application', entity_id: applicationId })
  }
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

export async function reconcileApplicationWithStripe(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app } = await supabase.from('camp_applications')
    .select('id, email, first_name, last_name, status, stripe_payment_intent_id, stripe_checkout_session_id')
    .eq('id', applicationId).single()
  if (!app) throw new Error('Application not found')

  if (app.stripe_payment_intent_id) {
    return { success: false, message: 'Already has PI on file', piId: app.stripe_payment_intent_id }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY')
  const stripe = new Stripe(stripeKey)

  let foundPI: Stripe.PaymentIntent | null = null

  if (app.stripe_checkout_session_id) {
    const session = await stripe.checkout.sessions.retrieve(app.stripe_checkout_session_id)
    if (session.payment_intent && typeof session.payment_intent === 'string') {
      foundPI = await stripe.paymentIntents.retrieve(session.payment_intent)
    }
  } else if (app.email) {
    const customers = await stripe.customers.list({ email: app.email, limit: 10 })
    for (const cust of customers.data) {
      const intents = await stripe.paymentIntents.list({ customer: cust.id, limit: 100 })
      const matched = intents.data
        .filter(pi => pi.status === 'succeeded' || pi.status === 'requires_capture')
        .sort((a, b) => b.created - a.created)
      if (matched.length > 0) { foundPI = matched[0]; break }
    }
  }

  if (!foundPI) {
    return { success: false, message: 'No payment found in Stripe for this application' }
  }

  await supabase.from('camp_applications')
    .update({ stripe_payment_intent_id: foundPI.id, updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Reconciled with Stripe: backfilled stripe_payment_intent_id = ${foundPI.id} (status: ${foundPI.status})`,
    entity_type: 'camp_application',
    entity_id: applicationId,
  })

  revalidatePath('/dashboard/submissions')
  return { success: true, message: `Linked PI ${foundPI.id} (${foundPI.status})`, piId: foundPI.id }
}

export async function sendAllPaymentLinks(
  allowedIds?: number[],
  opts?: { force?: boolean }
): Promise<{ sent: number; failed: number; errors: string[]; sent_to: string[]; skipped_already_contacted: string[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY')
  const stripe = new Stripe(stripeKey)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || '199')

  const { data: apps } = await supabase
    .from('camp_applications')
    .select('id, email, first_name, last_name, initiative_id, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid, status, stripe_payment_intent_id')
    .or('status.eq.payment_pending,and(status.eq.approved,stripe_payment_intent_id.is.null)')
    .order('created_at', { ascending: true })

  if (!apps || apps.length === 0) return { sent: 0, failed: 0, errors: [], sent_to: [], skipped_already_contacted: [] }

  const eligible = allowedIds && allowedIds.length > 0
    ? apps.filter(a => allowedIds.includes(a.id))
    : apps

  if (eligible.length === 0) return { sent: 0, failed: 0, errors: [], sent_to: [], skipped_already_contacted: [] }

  // HARD GUARD: re-fetch Stripe manual-contact map server-side so even if the
  // UI is stale or bypassed we cannot double-email someone already invoiced
  // by hand. Pass opts.force=true to override.
  const skipped_already_contacted: string[] = []
  let contactMap = new Map<string, StripeManualContact>()
  if (!opts?.force) {
    try {
      contactMap = await fetchStripeManualContactMap(stripe)
    } catch (e) {
      console.warn('[sendAllPaymentLinks] Stripe dedupe lookup failed; bailing for safety:', (e as Error).message)
      throw new Error('Could not verify Stripe to avoid duplicate sends. Aborted.')
    }
  }

  const { data: initiatives } = await supabase.from('initiatives').select('id, slug')
  const slugMap = new Map((initiatives ?? []).map(i => [i.id, i.slug]))

  let sent = 0
  const errors: string[] = []

  const sent_to: string[] = []
  for (const app of eligible) {
    const email = (app.email || '').toLowerCase().trim()
    const manual = contactMap.get(email)
    if (manual && !opts?.force) {
      skipped_already_contacted.push(`${app.first_name} ${app.last_name} <${app.email}> -- Stripe ${manual.kind} ${manual.identifier} (${manual.status})`)
      await supabase.from('activity_log').insert({
        admin_id: user.id,
        action: `Bulk send: SKIPPED ${app.first_name} ${app.last_name} <${app.email}> -- already contacted via Stripe ${manual.kind} ${manual.identifier} (${manual.status}, GBP ${manual.amount_gbp.toFixed(2)})`,
        entity_type: 'camp_application', entity_id: app.id,
      })
      continue
    }
    try {
      const initiativeSlug = (app.initiative_id && slugMap.get(app.initiative_id)) || 'singhs-camp'
      const initiativePath = `/initiatives/${initiativeSlug}`
      const returnTo = encodeURIComponent(initiativePath)
      const donationAmountPence = app.stripe_checkout_amount_pence && app.stripe_checkout_amount_pence > 0
        ? app.stripe_checkout_amount_pence : campFeeGbp * 100

      if (app.status === 'approved' && !app.stripe_payment_intent_id) {
        await supabase.from('camp_applications').update({ status: 'payment_pending', updated_at: new Date().toISOString() }).eq('id', app.id)
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment', payment_method_types: ['card'],
        payment_intent_data: { capture_method: 'manual', ...(app.monthly_donation_opted ? { setup_future_usage: 'off_session' } : {}), metadata: { camp_application_id: app.id } },
        customer_email: app.email, customer_creation: 'always',
        line_items: [{ price_data: { currency: 'gbp', unit_amount: donationAmountPence, product_data: { name: 'Singhs Camp UK Camp Fee', description: `One-off donation for ${app.first_name} ${app.last_name}` } }, quantity: 1 }],
        custom_fields: [{ key: 'gift_aid', label: { type: 'custom', custom: 'Gift Aid declaration' }, type: 'dropdown', optional: false, dropdown: { options: [{ label: 'Yes - I am a UK taxpayer and want Devanhaar to claim Gift Aid', value: 'yes' }, { label: 'No - do not claim Gift Aid on this payment', value: 'no' }] } }],
        metadata: { camp_application_id: app.id, gift_aid: app.gift_aid ? 'true' : 'false', monthly_donation_opted: app.monthly_donation_opted ? 'true' : 'false', monthly_donation_amount: app.monthly_donation_opted ? String(app.monthly_donation_amount || '0') : '0', resumed: 'admin_bulk_resend' },
        success_url: `${siteUrl}${initiativePath}?payment=success`,
        cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&applicationId=${app.id}`
      })

      await supabase.from('camp_applications').update({
        stripe_checkout_session_id: session.id, stripe_checkout_url: session.url,
        stripe_checkout_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        stripe_checkout_amount_pence: donationAmountPence,
        payment_reminder_sent_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }).eq('id', app.id)

      const resumeUrl = buildResumeUrl(siteUrl, String(app.id))
      await sendApplicationPaymentReminderEmail({ to: app.email, firstName: app.first_name || 'Applicant', resumeUrl, amountGbp: Math.round(donationAmountPence) / 100 })

      await supabase.from('activity_log').insert({ admin_id: user.id, action: `Bulk send: payment link sent to ${app.first_name} ${app.last_name} <${app.email}>`, entity_type: 'camp_application', entity_id: app.id })
      sent_to.push(`${app.first_name} ${app.last_name} <${app.email}>`)
      sent++
    } catch (err) {
      errors.push(`${app.first_name} ${app.last_name} <${app.email}>: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  revalidatePath('/dashboard/submissions')
  return { sent, failed: errors.length, errors, sent_to, skipped_already_contacted }
}

export type StripeManualContact = {
  kind: 'invoice' | 'session'
  identifier: string
  status: string
  amount_gbp: number
  created_iso: string
}

export type SendableApplicant = {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  status: string
  stripe_checkout_amount_pence: number | null
  payment_reminder_sent_at: string | null
  initiative_id: number | null
  /**
   * Populated by getSendableApplicants() when a manual Stripe outreach
   * (invoice or non-app checkout session) exists for this applicant's email
   * within the last 30 days. The UI uses this to flag duplicates and the
   * bulk-send action uses it as a hard guard (unless force=true is passed).
   */
  stripe_manual_contact: StripeManualContact | null
}

/**
 * Build email -> most-recent-manual-contact map by scanning recent Stripe
 * invoices and checkout sessions that were NOT created by the app
 * (i.e. they lack metadata.camp_application_id). Used to dedupe bulk-resend
 * vs invoices that admins issued by hand in the Stripe dashboard.
 */
async function fetchStripeManualContactMap(stripe: Stripe): Promise<Map<string, StripeManualContact>> {
  const map = new Map<string, StripeManualContact>()
  const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600

  try {
    let startingAfter: string | undefined
    for (let i = 0; i < 5; i++) {
      const pg = await stripe.invoices.list({ limit: 100, created: { gte: since }, ...(startingAfter ? { starting_after: startingAfter } : {}) })
      for (const inv of pg.data) {
        if (inv.status === 'void') continue
        const email = (inv.customer_email || '').toLowerCase().trim()
        if (!email) continue
        const created_iso = new Date(inv.created * 1000).toISOString()
        const existing = map.get(email)
        if (existing && existing.created_iso > created_iso) continue
        map.set(email, {
          kind: 'invoice',
          identifier: inv.number || inv.id,
          status: inv.status || 'unknown',
          amount_gbp: (inv.amount_due || 0) / 100,
          created_iso,
        })
      }
      if (!pg.has_more) break
      startingAfter = pg.data[pg.data.length - 1].id
    }
  } catch (e) {
    console.warn('[fetchStripeManualContactMap] invoice scan failed:', (e as Error).message)
  }

  try {
    let startingAfter: string | undefined
    for (let i = 0; i < 5; i++) {
      const pg = await stripe.checkout.sessions.list({ limit: 100, created: { gte: since }, ...(startingAfter ? { starting_after: startingAfter } : {}) })
      for (const s of pg.data) {
        if (s.metadata && s.metadata.camp_application_id) continue
        const email = (s.customer_email || s.customer_details?.email || '').toLowerCase().trim()
        if (!email) continue
        const created_iso = new Date(s.created * 1000).toISOString()
        const existing = map.get(email)
        if (existing && existing.created_iso > created_iso) continue
        map.set(email, {
          kind: 'session',
          identifier: s.id,
          status: s.status || 'unknown',
          amount_gbp: (s.amount_total || 0) / 100,
          created_iso,
        })
      }
      if (!pg.has_more) break
      startingAfter = pg.data[pg.data.length - 1].id
    }
  } catch (e) {
    console.warn('[fetchStripeManualContactMap] session scan failed:', (e as Error).message)
  }

  return map
}

export async function getSendableApplicants(): Promise<SendableApplicant[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('camp_applications')
    .select('id, first_name, last_name, email, status, stripe_checkout_amount_pence, payment_reminder_sent_at, initiative_id')
    .or('status.eq.payment_pending,and(status.eq.approved,stripe_payment_intent_id.is.null)')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as Omit<SendableApplicant, 'stripe_manual_contact'>[]

  let contactMap = new Map<string, StripeManualContact>()
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey)
      contactMap = await fetchStripeManualContactMap(stripe)
    } catch (e) {
      console.warn('[getSendableApplicants] Stripe dedupe lookup failed:', (e as Error).message)
    }
  }

  return rows.map(r => ({
    ...r,
    stripe_manual_contact: contactMap.get((r.email || '').toLowerCase().trim()) ?? null,
  }))
}

export type ActivityLogEntry = {
  id: number
  created_at: string
  admin_id: string | null
  action: string
  entity_type: string | null
  entity_id: number | null
  metadata: Record<string, unknown> | null
}

export async function getRecentCampActivity(limit = 60): Promise<ActivityLogEntry[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .or("entity_type.eq.camp_application,action.ilike.%camp%,action.ilike.%payment%,action.ilike.%bulk%")
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as ActivityLogEntry[]
}

export async function captureAllPayments(): Promise<{ captured: number; failed: number; errors: string[]; debug?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY')
  const stripe = new Stripe(stripeKey)

  // The UI's AUTHORISED bucket is built from Stripe live data, NOT from the
  // Supabase stripe_payment_intent_id column (many records have NULL there but
  // the PI is matched at render time via checkout session, metadata, or email).
  // To capture every record the UI shows as AUTHORISED, we scan all Stripe PIs
  // in requires_capture state and resolve each back to a camp_application via
  // direct PI id -> checkout session -> metadata.camp_application_id -> email.

  const { data: apps, error: qErr } = await supabase
    .from('camp_applications')
    .select('id, first_name, last_name, email, status, stripe_payment_intent_id, stripe_checkout_session_id')
  if (qErr) return { captured: 0, failed: 0, errors: [], debug: `query error: ${qErr.message}` }
  if (!apps || apps.length === 0) return { captured: 0, failed: 0, errors: [], debug: 'no camp_applications found' }

  type App = typeof apps[number]
  const appByPiId = new Map<string, App>()
  const appBySessionId = new Map<string, App>()
  const appByEmail = new Map<string, App[]>()
  for (const a of apps) {
    if (a.stripe_payment_intent_id) appByPiId.set(a.stripe_payment_intent_id, a)
    if (a.stripe_checkout_session_id) appBySessionId.set(a.stripe_checkout_session_id, a)
    const e = (a.email || '').toLowerCase().trim()
    if (e) {
      const arr = appByEmail.get(e) ?? []
      arr.push(a)
      appByEmail.set(e, arr)
    }
  }

  const onHold: Stripe.PaymentIntent[] = []
  let startingAfter: string | undefined
  // Hard caps: max 10 pages (1000 PIs) and only PIs from last 18 months.
  const eighteenMonthsAgoSec = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30 * 18
  for (let pageNum = 0; pageNum < 10; pageNum++) {
    const pg: Stripe.ApiList<Stripe.PaymentIntent> = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: eighteenMonthsAgoSec },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const pi of pg.data) {
      if (pi.status === 'requires_capture') onHold.push(pi)
    }
    if (!pg.has_more) break
    startingAfter = pg.data[pg.data.length - 1].id
  }

  if (onHold.length === 0) {
    return { captured: 0, failed: 0, errors: [], debug: `scanned ${apps.length} apps; no Stripe PIs in requires_capture` }
  }

  let captured = 0
  const errors: string[] = []
  const unmatched: string[] = []

  for (const pi of onHold) {
    let app: App | undefined = appByPiId.get(pi.id)
    if (!app) {
      const sessionId = pi.metadata?.checkout_session_id as string | undefined
      if (sessionId) app = appBySessionId.get(sessionId)
    }
    if (!app) {
      const metaAppId = pi.metadata?.camp_application_id
      if (metaAppId) app = apps.find(a => String(a.id) === String(metaAppId))
    }
    if (!app) {
      const email = (pi.receipt_email || pi.metadata?.email || '').toLowerCase().trim()
      if (email) {
        const candidates = appByEmail.get(email) ?? []
        app = candidates[0]
      }
    }
    if (!app) { unmatched.push(`${pi.id}/${pi.receipt_email ?? '?'}`); continue }

    try {
      await stripe.paymentIntents.capture(pi.id)
      await supabase.from('camp_applications').update({
        status: 'approved', updated_at: new Date().toISOString(),
        ...(app.stripe_payment_intent_id ? {} : { stripe_payment_intent_id: pi.id }),
      }).eq('id', app.id)
      sendApplicationApprovedEmail({ to: app.email, firstName: app.first_name || 'Applicant' })
        .catch(err => console.error('[Capture All] Approval email failed:', err))
      await supabase.from('activity_log').insert({
        admin_id: user.id,
        action: `Bulk capture: payment approved for ${app.first_name} ${app.last_name} <${app.email}> (PI ${pi.id})`,
        entity_type: 'camp_application', entity_id: app.id
      })
      captured++
    } catch (err) {
      errors.push(`${app.first_name} ${app.last_name} <${app.email}> [${pi.id}]: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  revalidatePath('/dashboard/submissions')
  const debug = `scanned ${apps.length} apps, ${onHold.length} PIs on hold, captured ${captured}, unmatched ${unmatched.length}${unmatched.length ? `: ${unmatched.slice(0,3).join(', ')}` : ''}`
  return { captured, failed: errors.length, errors, debug }
}

export async function approveVidyalaApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app } = await supabase
    .from('vidyala_applications')
    .select('id, first_name, last_name, email, status')
    .eq('id', applicationId)
    .single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'approved') throw new Error('Already approved')

  const { error } = await supabase
    .from('vidyala_applications')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', applicationId)
  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: "Approved Vidyala application: " + (app.first_name || '') + ' ' + (app.last_name || ''),
    entity_type: 'vidyala_application',
    entity_id: String(applicationId),
  })

  if (app.email) {
    sendVidyalaApprovalEmail({ to: app.email, firstName: app.first_name || 'Applicant' })
      .catch(err => console.error('[Vidyala] Approval email failed (non-blocking):', err))
  }

  revalidatePath('/dashboard/submissions')
}

export async function declineVidyalaApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app } = await supabase
    .from('vidyala_applications')
    .select('id, first_name, last_name, email, status')
    .eq('id', applicationId)
    .single()
  if (!app) throw new Error('Application not found')
  if (app.status === 'declined') throw new Error('Already declined')

  const { error } = await supabase
    .from('vidyala_applications')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', applicationId)
  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: "Declined Vidyala application: " + (app.first_name || '') + ' ' + (app.last_name || ''),
    entity_type: 'vidyala_application',
    entity_id: String(applicationId),
  })

  if (app.email) {
    sendVidyalaDeclineEmail({ to: app.email, firstName: app.first_name || 'Applicant' })
      .catch(err => console.error('[Vidyala] Decline email failed (non-blocking):', err))
  }

  revalidatePath('/dashboard/submissions')
}

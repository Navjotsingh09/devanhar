import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { canAutoConfirmPadelRegistration } from '@/lib/padel-payment'
import { sendPadelRegistrationApprovedEmail } from '@/lib/padel-registration-emails'

const WEBHOOK_SECRET = process.env.DONATIONMANAGER_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function collectPayloadValues(payload: unknown, keys: string[]): string[] {
  if (payload === null) return []
  if (typeof payload === 'string' || typeof payload === 'number' || typeof payload === 'boolean') return []
  const values: string[] = []
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (keys.includes(key.toLowerCase()) && (typeof value === 'string' || typeof value === 'number')) {
      values.push(String(value).trim())
    }
    if (value && typeof value === 'object') values.push(...collectPayloadValues(value, keys))
  }
  return values
}

function getReference(payload: any): string {
  const raw =
    payload?.reference ??
    payload?.custom ??
    payload?.data?.reference ??
    payload?.data?.custom ??
    payload?.data?.donation?.reference ??
    payload?.data?.donation?.custom ??
    payload?.donation?.reference ??
    payload?.donation?.custom ??
    ''
  return typeof raw === 'string' && raw.trim() ? raw.trim() : collectPayloadValues(payload, ['reference', 'custom'])[0] || ''
}

function getDonorEmail(payload: any): string {
  const raw =
    payload?.donation?.donor_email ??
    payload?.donation?.email ??
    payload?.data?.donation?.donor_email ??
    payload?.data?.donation?.email ??
    payload?.donor_email ??
    payload?.email ??
    payload?.data?.donor_email ??
    payload?.data?.email ??
    ''
  return normalize(raw || collectPayloadValues(payload, ['email', 'donor_email'])[0])
}

function isWolfRunDonation(payload: any): boolean {
  const values = collectPayloadValues(payload, ['checkout', 'checkout_id', 'appeal', 'appeal_id'])

  return values.includes('16919') || values.includes('12903')
}

function getDonationEventType(payload: any): string {
  return normalize(payload?.event || payload?.type)
}

function getDonationObject(payload: any): string {
  return normalize(payload?.object)
}

function isCancelledDonation(payload: any): boolean {
  const donationCancelled = payload?.donation?.cancelled
  if (typeof donationCancelled === 'boolean') return donationCancelled
  const eventType = getDonationEventType(payload)
  return eventType === 'donation.refunded' || eventType === 'order.refunded'
}

function isCompletedDonation(payload: any): boolean {
  const eventType = getDonationEventType(payload)
  const statusValues = collectPayloadValues(payload, ['status', 'payment_status', 'state']).map(normalize)
  if (
    eventType === 'donation.completed' ||
    eventType === 'donation.received' ||
    eventType === 'donation.recurring' ||
    /(?:completed|received|paid|success|succeeded)/.test(eventType) ||
    statusValues.some((status) => ['completed', 'received', 'paid', 'success', 'succeeded'].includes(status))
  ) {
    return true
  }

  if (getDonationObject(payload) === 'donation') {
    return !isCancelledDonation(payload)
  }

  return false
}

function extractIdFromReference(reference: string, prefix: string): string | null {
  if (!reference.startsWith(prefix)) return null
  const id = reference.slice(prefix.length).trim()
  return id || null
}

async function recalcFundraiserTotalRaised(supabase: ReturnType<typeof getSupabaseAdmin>, fundraiserId: string) {
  const { data: completedRows, error: sumError } = await supabase
    .from('wolfrun_donations')
    .select('amount')
    .eq('fundraiser_id', fundraiserId)
    .eq('status', 'completed')

  if (sumError) {
    console.error('[DonationManager Webhook] Failed to recalc fundraiser total:', sumError)
    return
  }

  const totalRaised = (completedRows || []).reduce((sum, row) => sum + (row.amount || 0), 0)

  const { error: updateError } = await supabase
    .from('wolfrun_fundraisers')
    .update({ total_raised: totalRaised })
    .eq('id', fundraiserId)

  if (updateError) {
    console.error('[DonationManager Webhook] Failed to update fundraiser total:', updateError)
  }
}


function getFamilyRetreatReference(payload: unknown): string | null {
  // The applicant may write their SFR reference in the donation message
  // rather than in the provider's top-level reference field.
  const fields = collectPayloadValues(payload, [
    'reference', 'custom', 'message', 'donation_message', 'donormessage',
    'donor_message', 'notes', 'comment', 'description', 'payment_reference',
  ])
  const matches = [...new Set(fields.flatMap(text => text.match(/\\bSFR[-\\s#]*0*[0-9]{1,10}\\b/gi) || []).map(text => text.replace(/[^0-9]/g, '')).filter(Boolean))]
  return matches.length === 1 ? 'SFR-' + matches[0].padStart(4, '0') : null
}

function getVerifiedFamilyAmountPence(payload: any): number | null {
  const item = payload?.donation ?? payload?.data?.donation ?? payload?.data ?? payload
  const currency = normalize(item?.currency ?? payload?.currency ?? 'gbp')
  if (currency !== 'gbp') return null
  const pennies = item?.amount_pence ?? item?.amount_in_pence ?? item?.amount_in_cents
  const pounds = item?.amount ?? item?.donation_amount
  const result = pennies !== undefined && pennies !== null
    ? Number(pennies)
    : pounds !== undefined && pounds !== null
      ? Math.round(Number(pounds) * 100)
      : NaN
  return Number.isSafeInteger(result) && result > 0 && result <= 10000000 ? result : null
}

async function reconcileSfrDonation(
  supabase: ReturnType<typeof getSupabaseAdmin>, payload: any,
): Promise<{ handled: boolean; error?: string }> {
  const reference = getFamilyRetreatReference(payload)
  if (!reference) return { handled: false }

  // A donation message is untrusted and must never establish that payment succeeded.
  // Only authenticated provider completion callbacks can be reconciled.
  if (!WEBHOOK_SECRET) return { handled: true, error: 'Webhook secret is not configured' }
  const eventType = getDonationEventType(payload)
  const explicitStatus = collectPayloadValues(payload, ['payment_status', 'status', 'state']).map(normalize)
  if (isCancelledDonation(payload)) return { handled: true }
  if (!['donation.completed', 'donation.received'].includes(eventType) &&
      !explicitStatus.some(status => ['paid', 'completed', 'succeeded', 'success'].includes(status))) {
    return { handled: true }
  }
  const amountPence = getVerifiedFamilyAmountPence(payload)
  if (amountPence === null) return { handled: true, error: 'Missing confirmed GBP payment amount' }

  const transactionId = String(payload?.donation?.id ?? payload?.data?.donation?.id ??
    payload?.donation_id ?? payload?.data?.donation_id ?? payload?.transaction_id ?? payload?.id ?? '').trim()
  if (!transactionId || transactionId.length > 150) return { handled: true, error: 'Missing provider transaction ID' }
  const number = Number(reference.slice(4))
  const { data: rows, error: findError } = await supabase.from('family_retreat_bookings')
    .select('id,booking_number,status,amount_due,amount_paid,payment_status')
    .eq('booking_number', number).limit(2)
  if (findError) return { handled: true, error: findError.message }
  if (!rows || rows.length !== 1 || rows[0].status === 'archived' || rows[0].status === 'declined') {
    return { handled: true, error: 'No single active SFR booking matches the reference' }
  }
  const booking = rows[0]
  const { data: existing, error: previousError } = await supabase.from('recovery_payment_ledger')
    .select('id').eq('source', 'donation_manager').eq('source_record_id', transactionId).maybeSingle()
  if (previousError) return { handled: true, error: previousError.message }
  if (existing) return { handled: true }

  const { error: insertError } = await supabase.from('recovery_payment_ledger').insert({
    source: 'donation_manager', source_record_id: transactionId,
    occurred_at: new Date().toISOString(), amount: amountPence / 100,
    currency: 'GBP', payment_status: 'paid',
    description: 'Sikh Family Retreat – authenticated donation',
    customer_email: getDonorEmail(payload) || null,
    payment_reference: reference, linked_record_type: 'family_retreat_booking',
    linked_record_id: booking.id, metadata: { webhook_event: eventType },
  })
  if (insertError) {
    if (insertError.code === '23505') return { handled: true }
    return { handled: true, error: insertError.message }
  }
  const { data: receipts, error: receiptsError } = await supabase.from('recovery_payment_ledger')
    .select('amount').eq('source', 'donation_manager')
    .eq('linked_record_type', 'family_retreat_booking').eq('linked_record_id', booking.id)
    .eq('payment_status', 'paid')
  if (receiptsError) return { handled: true, error: receiptsError.message }
  const total = (receipts || []).reduce((sum, row) => sum + Math.round(Number(row.amount || 0) * 100), 0)
  const due = Math.round(Number(booking.amount_due || 0) * 100)
  const { error: updateError } = await supabase.from('family_retreat_bookings')
    .update({
      amount_paid: total / 100,
      payment_status: due > 0 && total >= due ? 'paid' : 'unpaid',
      ...(due > 0 && total >= due ? { paid_at: new Date().toISOString() } : {}),
    }).eq('id', booking.id)
  if (updateError) return { handled: true, error: updateError.message }
  await supabase.from('activity_log').insert({
    action: 'family_retreat_donation_manager_payment_reconciled',
    entity_type: 'family_retreat_booking', entity_id: booking.id,
    metadata: { reference, provider_transaction_id: transactionId, amount_pence: amountPence },
  })
  return { handled: true }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-dm-signature')
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = await request.json()
    const eventType = payload.event || payload.type
    const supabase = getSupabaseAdmin()
    const reference = getReference(payload)

    // SFR donations can identify the booking from the donor's message.
    // Never trust an unsigned SFR callback, even if other legacy integrations
    // have historically accepted unsigned notifications.
    if (getFamilyRetreatReference(payload) && !WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Donation Manager verification is not configured' }, { status: 503 })
    }
    const familyResult = await reconcileSfrDonation(supabase, payload)
    if (familyResult.handled) {
      if (familyResult.error) {
        console.error('[DonationManager Webhook] SFR reconciliation failed:', familyResult.error)
        return NextResponse.json({ error: 'Could not reconcile retreat payment' }, { status: 422 })
      }
      return NextResponse.json({ received: true, matched: 'sfr' })
    }

    // Payment-first: create runner row only after DonationManager confirms payment
    const wolfrunEntryRef = extractIdFromReference(reference, 'wolfrun_entry:')
    if (wolfrunEntryRef && isCompletedDonation(payload)) {
      try {
        const d = JSON.parse(Buffer.from(wolfrunEntryRef, 'base64url').toString())
        const email = typeof d.e === 'string' ? d.e.trim().toLowerCase() : ''
        if (email) {
          const { data: existing } = await supabase
            .from('wolfrun_runners')
            .select('id')
            .eq('email', email)
            .eq('status', 'confirmed')
            .maybeSingle()
          if (!existing) {
            const paymentRef = payload?.donation?.id || payload?.donation_id || payload?.id || reference
            const { error: runnerError } = await supabase.from('wolfrun_runners').insert({
              first_name: String(d.f || '').trim(),
              last_name: String(d.l || '').trim(),
              email,
              phone: String(d.p || '').trim(),
              age: Number(d.a) || 0,
              city: String(d.c || '').trim(),
              pack: String(d.k || ''),
              agree_whatsapp_group: Boolean(d.w),
              status: 'confirmed',
              stripe_session_id: paymentRef,
            })
            if (runnerError) {
              console.error('[DonationManager Webhook] Failed to create confirmed runner:', runnerError)
            }
          }
        }
      } catch (err) {
        console.error('[DonationManager Webhook] Failed to parse wolfrun_entry payload:', err)
      }
    }

    // Legacy: update a pre-created runner row (old flow, kept for any in-flight sessions)
    const runnerId = extractIdFromReference(reference, 'wolfrun_runner:')
    const runnerStatus = isCompletedDonation(payload) ? 'confirmed' : isCancelledDonation(payload) ? 'failed' : null
    if (runnerStatus) {
      const paymentReference = payload?.donation?.id || payload?.donation_id || payload?.id || reference
      const runnerUpdate = { status: runnerStatus, stripe_session_id: paymentReference }
      let runnerUpdateError: unknown = null
      if (runnerId) {
        const result = await supabase.from('wolfrun_runners').update(runnerUpdate).eq('id', runnerId)
        runnerUpdateError = result.error
      } else if (isWolfRunDonation(payload) && getDonorEmail(payload)) {
        const result = await supabase.from('wolfrun_runners').update(runnerUpdate).eq('email', getDonorEmail(payload))
        runnerUpdateError = result.error
      }
      if (runnerUpdateError) {
        console.error('[DonationManager Webhook] Failed to reconcile Wolf Run runner:', runnerUpdateError)
      }
    }

    // Legacy reference-based payment confirmation. A payment must never reverse
    // a staff decline/archive, or be inferred from visiting the payment page.
    const padelRegistrationId = extractIdFromReference(reference, 'padel_registration:')
    if (padelRegistrationId && isCompletedDonation(payload)) {
      if (!WEBHOOK_SECRET) return NextResponse.json({ error: 'Payment verification is not configured' }, { status: 503 })
      const { data: reg, error: fetchError } = await supabase.from('padel_registrations')
        .select('*').eq('id', padelRegistrationId).maybeSingle()
      if (fetchError) throw fetchError
      // TotalGiving appeal payments are verified through receipt records until
      // a provider-specific confirmation integration is actually configured.
      if (reg && reg.payment_provider !== 'totalgiving' && reg.payment_status !== 'paid' && canAutoConfirmPadelRegistration(reg.status)) {
        const { data: updated, error: updateError } = await supabase.from('padel_registrations')
          .update({ status: 'approved', payment_status: 'paid', payment_provider: reg.payment_provider || 'nowdonate',
            payment_reference: reference, payment_verified_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', reg.id).eq('status', reg.status).eq('payment_status', reg.payment_status).select('id').maybeSingle()
        if (updateError) throw updateError
        if (updated) {
          await supabase.from('padel_activity_log').insert({ registration_id: reg.id, action: 'legacy_payment_confirmed' })
          if (reg.captain_email) await sendPadelRegistrationApprovedEmail({
            to: reg.captain_email, firstName: reg.captain_first_name || 'Player',
            teamName: `${reg.captain_first_name || 'Player'} & ${reg.player2_first_name || 'Partner'}`, paymentVerified: true,
          })
        }
      }
    }

    // Wolf Run sponsorship donation reconciliation
    const wolfrunDonationId = extractIdFromReference(reference, 'wolfrun_donation:')
    if (wolfrunDonationId) {
      let fundraiserId: string | null = null

      if (isCompletedDonation(payload) || isCancelledDonation(payload)) {
        const nextStatus = isCompletedDonation(payload) ? 'completed' : 'failed'
        const { data: updatedDonation, error: donationUpdateError } = await supabase
          .from('wolfrun_donations')
          .update({ status: nextStatus })
          .eq('id', wolfrunDonationId)
          .select('fundraiser_id')
          .maybeSingle()

        if (donationUpdateError) {
          console.error('[DonationManager Webhook] Failed to update Wolf Run donation status:', donationUpdateError)
        } else {
          fundraiserId = updatedDonation?.fundraiser_id || null
        }
      }

      if (fundraiserId) {
        await recalcFundraiserTotalRaised(supabase, fundraiserId)
      }
    }

    switch (eventType) {
      case 'donation.completed':
      case 'donation.received': {
        await supabase.from('activity_log').insert({
          action: 'Donation received via DonationManager',
          entity_type: 'donation_webhook',
          entity_id: payload.data?.reference || payload.id || reference || null,
        })
        break
      }
      case 'donation.recurring': {
        await supabase.from('activity_log').insert({
          action: 'Recurring donation via DonationManager',
          entity_type: 'donation_webhook',
          entity_id: payload.data?.reference || payload.id || reference || null,
        })
        break
      }
      case 'order.completed':
      case 'shop.order': {
        await supabase.from('activity_log').insert({
          action: 'Shop order completed via DonationManager',
          entity_type: 'shop_webhook',
          entity_id: payload.data?.order_id || payload.id || null,
        })
        break
      }
      case 'order.refunded':
      case 'donation.refunded': {
        await supabase.from('activity_log').insert({
          action: 'Refund processed via DonationManager',
          entity_type: 'refund_webhook',
          entity_id: payload.data?.reference || payload.id || reference || null,
        })
        break
      }
      default: {
        await supabase.from('activity_log').insert({
          action: 'DonationManager webhook: ' + (eventType || 'unknown'),
          entity_type: 'webhook',
          entity_id: payload.id || null,
        })
      }
    }

    return NextResponse.json({ received: true, event: eventType })
  } catch (error) {
    console.error('[DonationManager Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/donationmanager',
    provider: 'donationmanager.co.uk',
    events: [
      'donation.completed',
      'donation.received',
      'donation.recurring',
      'donation.refunded',
      'order.completed',
      'shop.order',
      'order.refunded',
    ],
  })
}

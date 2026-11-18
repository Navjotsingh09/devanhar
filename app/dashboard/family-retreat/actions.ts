"use server"

import { retreatReference } from "@/lib/family-retreat-booking-details"
import { familyRetreatSignatureHtml, familyRetreatSignatureLines } from "@/lib/family-retreat-email-signature"
import { requireProgramme } from '@/lib/staff-programme-server'
import { revalidatePath } from "next/cache"

type RetreatStatus = "pending" | "confirmed" | "waitlisted" | "declined" | "archived"

type Booking = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  booking_details?: object | null
  payment_status: string | null
  amount_due: number | null
  amount_paid: number | null
  nowdonate_payment_url: string | null
  stripe_payment_link_id: string | null
  adults_attending: Array<Record<string, unknown>> | null
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devanhaar.com"
const FAMILY_RETREAT_PAYMENT_LINK =
  process.env.FAMILY_RETREAT_PAYMENT_LINK || "https://buy.stripe.com/7sY14pddk8qWdyB1EVbEA02"
const FAMILY_RETREAT_STRIPE_PRODUCT = process.env.FAMILY_RETREAT_STRIPE_PRODUCT || "prod_UliRJAIaHaHO9e"
const NOWDONATE_API_KEY = process.env.NOWDONATE_API_KEY || ""

function extractNowDonateCheckoutId(value: string | undefined): string {
  if (!value) return ""
  const trimmed = value.trim()
  const directId = /^[a-zA-Z0-9]+$/.test(trimmed)
  if (directId) return trimmed

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split("/").filter(Boolean)
    const checkoutIndex = parts.findIndex((segment) => segment === "checkout")
    if (checkoutIndex >= 0 && parts[checkoutIndex + 1]) {
      return parts[checkoutIndex + 1]
    }
  } catch {
    return ""
  }

  return ""
}

const NOWDONATE_CONFIRM_CHECKOUT_ID =
  extractNowDonateCheckoutId(process.env.FAMILY_RETREAT_NOWDONATE_CONFIRM_CHECKOUT_ID) ||
  extractNowDonateCheckoutId(process.env.FAMILY_RETREAT_NOWDONATE_CHECKOUT_ID) ||
  extractNowDonateCheckoutId(process.env.FAMILY_RETREAT_NOWDONATE_CONFIRM_CHECKOUT_URL) ||
  extractNowDonateCheckoutId(process.env.FAMILY_RETREAT_NOWDONATE_CHECKOUT_URL) ||
  extractNowDonateCheckoutId(process.env.NOWDONATE_CHECKOUT_ID)

const NOWDONATE_ADDITIONAL_CHECKOUT_ID =
  extractNowDonateCheckoutId(process.env.FAMILY_RETREAT_NOWDONATE_ADDITIONAL_CHECKOUT_ID) ||
  extractNowDonateCheckoutId(process.env.FAMILY_RETREAT_NOWDONATE_ADDITIONAL_CHECKOUT_URL) ||
  NOWDONATE_CONFIRM_CHECKOUT_ID

async function getSupabaseAdmin() {
  return await requireProgramme('family')
}

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatGbp(amount: number): string {
  return `£${amount.toFixed(2)}`
}

function buildLinkWithParams(base: string, params: Record<string, string>) {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url.toString()
}

function buildNowDonateCheckoutUrl(checkoutId: string, params: Record<string, string>) {
  return buildLinkWithParams(`https://www.nowdonate.com/checkout/${checkoutId}`, params)
}

async function sendEmail(params: { to: string; subject: string; text: string; html: string }) {
  if (!process.env.RESEND_API_KEY) throw new Error("Email service is unavailable")
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({
    from: "Sikh Family Retreat <noreply@devanhaar.com>",
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  })
  if (result.error || !result.data?.id) throw new Error("Email was not accepted by the provider")
}

async function getBooking(id: string): Promise<Booking> {
  const supabase = (await getSupabaseAdmin())
  const { data, error } = await supabase
    .from("family_retreat_bookings")
    .select("id, first_name, last_name, email, payment_status, amount_due, amount_paid, booking_details, nowdonate_payment_url, stripe_payment_link_id, adults_attending")
    .eq("id", id)
    .single()

  if (error || !data) {
    throw new Error("Booking not found")
  }

  return data as Booking
}

async function createExactAmountPaymentLink(
  amountPence: number,
  bookingId: string,
  email: string,
  mode: "confirm" | "additional" = "confirm",
) {
  const checkoutId = mode === "additional" ? NOWDONATE_ADDITIONAL_CHECKOUT_ID : NOWDONATE_CONFIRM_CHECKOUT_ID

  if (NOWDONATE_API_KEY && checkoutId) {
    const amountGbp = Math.round(amountPence) / 100
    return {
      url: buildNowDonateCheckoutUrl(checkoutId, {
        amount: String(amountGbp),
        reference: bookingId,
        custom: bookingId,
        prefilled_email: email,
        success_url: `${SITE_URL}/initiatives/sikh-family-retreat?paid=1`,
        cancel_url: `${SITE_URL}/initiatives/sikh-family-retreat#booking-form`,
      }),
      id: null,
      provider: "nowdonate" as const,
    }
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      url: buildLinkWithParams(FAMILY_RETREAT_PAYMENT_LINK, {
        client_reference_id: bookingId,
        prefilled_email: email,
      }),
      id: null,
      provider: "stripe" as const,
    }
  }

  const { default: Stripe } = await import("stripe")
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let priceId: string
  try {
    const price = await stripe.prices.create({
      currency: "gbp",
      unit_amount: amountPence,
      product: FAMILY_RETREAT_STRIPE_PRODUCT,
    })
    priceId = price.id
  } catch {
    const fallbackPrice = await stripe.prices.create({
      currency: "gbp",
      unit_amount: amountPence,
      product_data: { name: "Sikh Family Retreat" },
    })
    priceId = fallbackPrice.id
  }

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    restrictions: { completed_sessions: { limit: 1 } },
    after_completion: {
      type: "redirect",
      redirect: {
        url: `${SITE_URL}/initiatives/sikh-family-retreat?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      },
    },
    metadata: { family_retreat_booking_id: bookingId },
  })

  return {
    url: buildLinkWithParams(link.url, {
      client_reference_id: bookingId,
      prefilled_email: email,
    }),
    id: link.id,
    provider: "stripe" as const,
  }
}

async function sendConfirmationEmail(
  email: string,
  firstName: string,
  amount: number,
  paymentLink: string,
  adultsCount: number,
) {
  const subject = "Booking confirmed - Sikh Family Retreat"
  const text = [
    `Dear ${firstName},`,
    "",
    "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.",
    "",
    "Thank you for your booking application for The Sikh Family Initiative: Sikh Family Retreat.",
    "",
    "We are pleased to confirm your family's place on the retreat.",
    "",
    `Adults noted for your booking: ${adultsCount}.`,
    `Amount due: ${formatGbp(amount)}.`,
    "",
    "To complete your booking, please use the payment link below:",
    paymentLink,
    "",
    "Once payment is completed, we will send a final confirmation.",
    "",
    ...familyRetreatSignatureLines,
  ].join("\n")

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
    `<p>Dear ${escapeHtml(firstName)},</p>`,
    "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
    "<p>Thank you for your booking application for The Sikh Family Initiative: Sikh Family Retreat.</p>",
    "<p>We are pleased to confirm your family&rsquo;s place on the retreat.</p>",
    `<p>Adults noted for your booking: <strong>${adultsCount}</strong><br>Amount due: <strong>${escapeHtml(formatGbp(amount))}</strong></p>`,
    `<p style="text-align:center;margin:24px 0"><a href="${escapeHtml(paymentLink)}" style="display:inline-block;background:#166534;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Pay now</a></p>`,
    "<p>Once payment is completed, we will send a final confirmation.</p>",
    familyRetreatSignatureHtml,
    "</div>",
  ].join("")

  await sendEmail({ to: email, subject, text, html })
}

async function sendDeclineEmail(email: string, firstName: string) {
  const subject = "Update on your Sikh Family Retreat application"
  const text = [
    `Dear ${firstName},`,
    "",
    "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.",
    "",
    "Thank you for your booking application for The Sikh Family Initiative: Sikh Family Retreat.",
    "",
    "After careful review, we are unable to offer a place at this time.",
    "",
    "Please keep in touch for future opportunities.",
    "",
    ...familyRetreatSignatureLines,
  ].join("\n")

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
    `<p>Dear ${escapeHtml(firstName)},</p>`,
    "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
    "<p>Thank you for your booking application for The Sikh Family Initiative: Sikh Family Retreat.</p>",
    "<p>After careful review, we are unable to offer a place at this time.</p>",
    "<p>Please keep in touch for future opportunities.</p>",
    familyRetreatSignatureHtml,
    "</div>",
  ].join("")

  await sendEmail({ to: email, subject, text, html })
}

async function sendAdditionalChargeEmail(args: {
  email: string
  firstName: string
  amountNow: number
  alreadyPaid: number
  referenceNote: string
  paymentLink: string
}) {
  const subject = "Additional payment request - Sikh Family Retreat"
  const text = [
    `Dear ${args.firstName},`,
    "",
    "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.",
    "",
    "Thank you again for your booking.",
    "",
    "Additional services have now been requested for your application.",
    "",
    `Reference note: ${args.referenceNote}`,
    `Already paid: ${formatGbp(args.alreadyPaid)}.`,
    `Additional amount due now: ${formatGbp(args.amountNow)}.`,
    "",
    "Please use this payment link for the additional amount:",
    args.paymentLink,
    "",
    ...familyRetreatSignatureLines,
  ].join("\n")

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
    `<p>Dear ${escapeHtml(args.firstName)},</p>`,
    "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
    "<p>Thank you again for your booking.</p>",
    "<p>Additional services have now been requested for your application.</p>",
    `<p><strong>Reference note:</strong> ${escapeHtml(args.referenceNote)}</p>`,
    `<p><strong>Already paid:</strong> ${escapeHtml(formatGbp(args.alreadyPaid))}<br><strong>Additional amount due now:</strong> ${escapeHtml(formatGbp(args.amountNow))}</p>`,
    `<p style="text-align:center;margin:24px 0"><a href="${escapeHtml(args.paymentLink)}" style="display:inline-block;background:#166534;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Pay additional amount</a></p>`,
    familyRetreatSignatureHtml,
    "</div>",
  ].join("")

  await sendEmail({
    to: args.email,
    subject,
    text,
    html,
  })
}

export async function updateFamilyRetreatStatus(
  id: string,
  status: RetreatStatus,
  details?: { adults?: number; amount?: number },
) {
  const supabase = (await getSupabaseAdmin())
  const booking = await getBooking(id)

  let notify: (() => Promise<void>) | undefined
  let emailStatus: "sent" | "failed" | "not_requested" = "not_requested"
  // Online SFR bookings must have a provider-verified receipt before staff can
  // confirm a place. A note saying "link sent" is not payment evidence.
  if (status === "confirmed" && booking.booking_details) {
    const bookingRecord = await supabase.from("family_retreat_bookings")
      .select("booking_number").eq("id", id).single()
    const reference = retreatReference(bookingRecord.data?.booking_number)
    if (!reference) throw new Error("Booking reference unavailable; cannot verify payment.")
    const verifiedReceipts = await verifiedFamilyDonationReceipts(supabase, id, reference)
    const verifiedPence = verifiedReceipts.reduce(
      (total, receipt) => total + Math.round(Number(receipt.amount || 0) * 100), 0)
    const duePence = await familyRetreatExpectedAmountPence(supabase, id, booking.amount_due)
    if (duePence <= 0 || verifiedPence < duePence) {
      throw new Error("Payment not verified in Devanhaar. Confirm the Donation Manager receipt is recorded and covers the agreed amount before confirming this booking.")
    }
    // Do not generate a second payment request for an already-paid booking.
    if (details?.amount && details.amount > 0) {
      throw new Error("Payment is already verified. Use Confirm booking instead of generating another payment link.")
    }
  }

  const updatePayload: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
  }

  if (status === "confirmed" && details?.amount && details.amount > 0) {
    if (!booking.email) throw new Error("Booking email is missing")
    if (booking.booking_details && !booking.nowdonate_payment_url && !booking.stripe_payment_link_id)
      throw new Error('Send the payment link separately and log it in the booking tracker.')
    const { url, id: linkId, provider } = await createExactAmountPaymentLink(
      Math.round(details.amount * 100),
      id,
      booking.email,
      "confirm",
    )

    updatePayload.amount_due = details.amount
    updatePayload.payment_status = "unpaid"
    if (provider === "nowdonate") {
      updatePayload.nowdonate_payment_url = url
      updatePayload.stripe_payment_link = null
      updatePayload.stripe_payment_link_id = null
    } else {
      updatePayload.stripe_payment_link = url
      updatePayload.stripe_payment_link_id = linkId
    }
    updatePayload.paid_at = null

    notify = () => sendConfirmationEmail(
      booking.email!,
      booking.first_name || "there",
      details.amount!,
      url,
      details.adults ?? (Array.isArray(booking.adults_attending) ? booking.adults_attending.length : 0),
    )
  }

  if (status === "declined") {
    if (booking.email) notify = () => sendDeclineEmail(booking.email!, booking.first_name || "there")
    else emailStatus = "failed"
  }

  const { error } = await supabase
    .from("family_retreat_bookings")
    .update(updatePayload)
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  if (notify) {
    try {
      await notify()
      emailStatus = "sent"
    } catch {
      emailStatus = "failed"
    }
  }

  await supabase.from("activity_log").insert({
    admin_id: (await supabase.auth.getUser()).data.user?.id,
    action: `family_retreat_${status}`,
    entity_type: "family_retreat_booking",
    entity_id: id,
    metadata: {
      email_status: emailStatus,
      adults: details?.adults ?? null,
      amount: details?.amount ?? null,
    },
  })

  revalidatePath("/dashboard/family-initiative/retreat")
  return { emailStatus }
}

export async function syncFamilyRetreatPayment(id: string): Promise<{ paid: boolean }> {
  const booking = await getBooking(id)
  if (booking.payment_status === "paid") {
    revalidatePath("/dashboard/family-initiative/retreat")
    return { paid: true }
  }

  if (booking.nowdonate_payment_url && !booking.stripe_payment_link_id) {
    return { paid: false }
  }

  if (!booking.stripe_payment_link_id || !process.env.STRIPE_SECRET_KEY) {
    return { paid: false }
  }

  const supabase = (await getSupabaseAdmin())
  const { default: Stripe } = await import("stripe")
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_link: booking.stripe_payment_link_id,
      limit: 10,
    })

    const paidSession = sessions.data.find(
      (session) => session.payment_status === "paid" && session.status === "complete",
    )

    if (!paidSession) return { paid: false }

    const amountPaid = (paidSession.amount_total ?? 0) / 100
    const { error } = await supabase
      .from("family_retreat_bookings")
      .update({
        payment_status: "paid",
        amount_paid: amountPaid,
        paid_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await supabase.from("activity_log").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id,      action: "family_retreat_payment_synced",
      entity_type: "family_retreat_booking",
      entity_id: id,
      metadata: { stripe_session_id: paidSession.id, amount_paid: amountPaid },
    })

    revalidatePath("/dashboard/family-initiative/retreat")
    return { paid: true }
  } catch (error) {
    console.error("[family-retreat] sync payment failed", error)
    throw new Error("Stripe payment could not be checked. Try again.")
  }
}

export async function sendFamilyRetreatAdditionalCharge(
  id: string,
  payload: { amount: number; referenceNote: string },
) {
  const amount = Number(payload.amount)
  const referenceNote = (payload.referenceNote || "").trim()
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Please enter a valid additional amount")
  }
  if (referenceNote.length < 10) {
    throw new Error("Please provide a clear reference note for the additional charges")
  }

  const booking = await getBooking(id)
  if (booking.booking_details && !booking.nowdonate_payment_url && !booking.stripe_payment_link_id)
    throw new Error('Send the payment link separately and log it in the booking tracker.')

  if (!booking.email) {
    throw new Error("Booking email is missing")
  }

  const supabase = (await getSupabaseAdmin())
  const { url, id: linkId, provider } = await createExactAmountPaymentLink(
    Math.round(amount * 100),
    id,
    booking.email,
    "additional",
  )

  const { error } = await supabase
    .from("family_retreat_bookings")
    .update({
      nowdonate_payment_url: provider === "nowdonate" ? url : null,
      stripe_payment_link: provider === "stripe" ? url : null,
      stripe_payment_link_id: provider === "stripe" ? linkId : null,
      payment_status: "unpaid",
      amount_due: amount,
      internal_notes: referenceNote,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  let emailStatus: "sent" | "failed" = "sent"
  try {
    await sendAdditionalChargeEmail({
      email: booking.email,
      firstName: booking.first_name || "there",
      amountNow: amount,
      alreadyPaid: booking.amount_paid || 0,
      referenceNote,
      paymentLink: url,
    })
  } catch (emailError) {
    emailStatus = "failed"
    console.error("[family-retreat] additional charge email failed", emailError)
  }

  await supabase.from("activity_log").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id,    action: "family_retreat_additional_charge_created",
    entity_type: "family_retreat_booking",
    entity_id: id,
    metadata: { amount, reference_note: referenceNote, payment_link_id: linkId, email_status: emailStatus },
  })

  revalidatePath("/dashboard/family-initiative/retreat")
  return { emailStatus }
}

export async function removeFamilyRetreatBooking(id: string, mode: "archive" | "delete") {
  const supabase = (await getSupabaseAdmin())

  if (mode === "archive") {
    const { error } = await supabase
      .from("family_retreat_bookings")
      .update({ status: "archived" })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await supabase.from("activity_log").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id,      action: "family_retreat_archived",
      entity_type: "family_retreat_booking",
      entity_id: id,
    })
  } else {
    const { error } = await supabase
      .from("family_retreat_bookings")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)

    await supabase.from("activity_log").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id,      action: "family_retreat_deleted",
      entity_type: "family_retreat_booking",
      entity_id: id,
    })
  }

  revalidatePath("/dashboard/family-initiative/retreat")
}

export async function updateFamilyRetreatNotes(id: string, notes: string) {
  const supabase = (await getSupabaseAdmin())
  const { error } = await supabase
    .from("family_retreat_bookings")
    .update({ internal_notes: notes })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/family-initiative/retreat")
}

export async function logFamilyRetreatReminder(id: string) {
 const supabase = await requireProgramme('family')
 const {data:booking,error:lookupError}=await supabase.from('family_retreat_bookings').select('id,payment_status').eq('id',id).single()
 if(lookupError || !booking) throw new Error('Booking not found')
 if(booking.payment_status==='paid') throw new Error('Payment is already verified')
 const {error}=await supabase.from('family_retreat_bookings').update({payment_reminder_sent_at:new Date().toISOString()}).eq('id',id)
 if(error) throw new Error('Unable to log the reminder')
 revalidatePath('/dashboard/family-initiative/retreat')
}

/**
 * Sends a genuine payment request from the organiser dashboard.
 * Unlike the tracker "link_sent" event, this invokes Resend and only marks the
 * email sent after the provider accepts it. The reference visible to the family
 * matches the SFR number printed in the dashboard.
 */
/**
 * Create a booking-specific NowDonate checkout using Devanhaar's existing
 * Donation Manager checkout API, as used by Wolf Run.
 * Never send an unverified or generic link when the API fails.
 */
async function createFamilyRetreatProviderCheckout(input: {
  id: string; reference: string; email: string; amountPence: number
}): Promise<string> {
  if (!NOWDONATE_CONFIRM_CHECKOUT_ID) {
    throw new Error("The retreat checkout ID is not configured.")
  }
  // Restore the existing working NowDonate checkout URL used before the
  // Checkout API refactor. Checkout API creation is NOT needed to send email.
  // Use only a configured provider checkout ID and server-calculated amount.
  return buildNowDonateCheckoutUrl(NOWDONATE_CONFIRM_CHECKOUT_ID, {
    amount: (input.amountPence / 100).toFixed(2),
    reference: input.reference,
    custom: input.reference,
    prefilled_email: input.email,
    success_url: SITE_URL + "/sfr?paid=1",
    cancel_url: SITE_URL + "/sfr",
  })
}

export async function sendFamilyRetreatPaymentRequest(
  id: string,
  options: { restoreDeclined?: boolean } = {},
): Promise<{ emailStatus: "sent" | "failed"; detail: string; reference?: string }> {
  const supabase = await getSupabaseAdmin()
  const { data: booking, error: lookupError } = await supabase.from("family_retreat_bookings")
    .select("id, booking_number, status, first_name, email, amount_due, payment_status, nowdonate_payment_url")
    .eq("id", id).single()
  if (lookupError || !booking) return { emailStatus: "failed" as const, detail: "Booking not found. Refresh and try again." }
  if (booking.status === "archived") return { emailStatus: "failed" as const, detail: "Archived bookings cannot receive payment requests." }
  if (booking.status === "declined" && options.restoreDeclined !== true) {
    return { emailStatus: "failed" as const, detail: "This booking is declined. Check the status before restoring and sending a payment request." }
  }
  if (!booking.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())) {
    return { emailStatus: "failed" as const, detail: "A valid booking email is required." }
  }
  if (booking.payment_status === "paid") return { emailStatus: "failed" as const, detail: "This booking is marked paid. Check the payment tracker before requesting more money." }

  // The latest manually agreed quote is the source of truth; do not trust a
  // browser-supplied amount, and account for payments/refunds already recorded.
  const [{ data: quotes, error: quotesError }, { data: ledger, error: ledgerError }] = await Promise.all([
    supabase.from("family_retreat_tracker").select("amount_pence")
      .eq("booking_id", id).eq("action", "link_sent").order("id", { ascending: false }).limit(1),
    supabase.from("family_retreat_tracker").select("action, amount_pence")
      .eq("booking_id", id).in("action", ["payment", "refund_recorded"]),
  ])
  if (quotesError || ledgerError) return { emailStatus: "failed" as const, detail: "Unable to verify the agreed amount and payment history." }
  const agreedPence = Number(quotes?.[0]?.amount_pence ?? Math.round(Number(booking.amount_due || 0) * 100))
  const receivedPence = (ledger || []).reduce((sum, row) => sum + (row.action === "payment" ? Number(row.amount_pence || 0) : -Number(row.amount_pence || 0)), 0)
  const outstandingPence = agreedPence - receivedPence
  if (!Number.isSafeInteger(outstandingPence) || outstandingPence <= 0 || outstandingPence > 10000000) {
    return { emailStatus: "failed" as const, detail: "No valid outstanding payment amount was found. Review the booking tracker first." }
  }
  if (!NOWDONATE_CONFIRM_CHECKOUT_ID) {
    return { emailStatus: "failed" as const, detail: "The Donation Manager checkout is not configured. Set the retreat NowDonate checkout ID before sending." }
  }
  if (!process.env.RESEND_API_KEY) return { emailStatus: "failed" as const, detail: "Email sending is not configured. Check RESEND_API_KEY." }

  const reference = retreatReference(booking.booking_number)
  if (!reference) return { emailStatus: "failed" as const, detail: "The booking has no SFR reference. Refresh the booking details first." }
  let paymentUrl: string
  try {
    paymentUrl = await createFamilyRetreatProviderCheckout({
      id, reference, email: booking.email, amountPence: outstandingPence,
    })
  } catch (error) {
    return {
      emailStatus: "failed",
      detail: error instanceof Error ? error.message : "Could not create a verified payment checkout. No email was sent.",
      reference,
    }
  }
  const name = booking.first_name || "there"
  const money = formatGbp(outstandingPence / 100)
  const instructions = `Important: On the donation page, find “Would you like to add a Message?” and click “Yes”. A message box will appear. Type your booking reference exactly as shown: ${reference}. Then complete your payment and keep your receipt. This helps the Sikh Family Retreat team match your payment to your booking.`
  const subject = `Payment request – Sikh Family Retreat (${reference})`
  const text = [
    `Dear ${name},`, "", "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.", "",
    "The Sikh Family Retreat team has prepared a payment request for your booking.",
    `Booking reference: ${reference}`, `Amount outstanding: ${money}`, "",
    "Pay securely using the link below:", paymentUrl, "", instructions, "",
    "Once the payment is verified, the team will update your booking status.",
    "", ...familyRetreatSignatureLines,
  ].join("\n")
  const html = [
    '<div style="font:15px/1.6 Arial,Helvetica,sans-serif;color:#152d46">',
    `<p>Dear ${escapeHtml(name)},</p><p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>`,
    "<p>The Sikh Family Retreat team has prepared a payment request for your booking.</p>",
    `<p><strong>Booking reference:</strong> ${escapeHtml(reference)}<br><strong>Amount outstanding:</strong> ${escapeHtml(money)}</p>`,
    `<p><a href="${escapeHtml(paymentUrl)}" style="display:inline-block;background:#152d46;color:#fff;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:bold">Pay securely · ${escapeHtml(money)}</a></p>`,
    `<p>${escapeHtml(instructions)}</p>`,
    "<p>Once payment is verified, the team will update your booking status.</p>",
    familyRetreatSignatureHtml, "</div>",
  ].join("")

  // Deliberate recovery for a previously declined booking. The button requires
  // a separate explicit confirmation; other declined bookings remain protected.
  if (booking.status === "declined" && options.restoreDeclined) {
    const { error: restoreError } = await supabase.from("family_retreat_bookings")
      .update({ status: "pending" }).eq("id", id).eq("status", "declined")
    if (restoreError) return { emailStatus: "failed" as const, detail: "Could not restore the booking. No email was sent." }
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: "Sikh Family Retreat <noreply@devanhaar.com>",
      to: booking.email,
      subject, text, html,
    })
    if (result.error || !result.data?.id) {
      throw new Error(result.error?.message || "Email was not accepted by the provider")
    }
    const { error: saveError } = await supabase.from("family_retreat_bookings").update({
      nowdonate_payment_url: paymentUrl,
      payment_reminder_sent_at: new Date().toISOString(),
      amount_due: agreedPence / 100,
    }).eq("id", id)
    await supabase.from("activity_log").insert({
      action: "family_retreat_payment_request_email_accepted",
      entity_type: "family_retreat_booking", entity_id: id,
      metadata: { reference, amount_pence: outstandingPence, provider: "nowdonate", email_id: result.data.id, tracking_saved: !saveError },
    })
    revalidatePath("/dashboard/family-initiative/retreat")
    return {
      emailStatus: "sent",
      detail: saveError
        ? `Email accepted by the mail provider for ${booking.email} (ID ${result.data.id}), but the dashboard tracking update failed. Please check the booking before resending.`
        : `Payment email accepted for ${booking.email}. Reference ${reference}, amount ${money}. Mail ID: ${result.data.id}. Inbox delivery is not yet confirmed.`,
      reference,
    }
  } catch (error) {
    console.error("[family-retreat] payment request email failed", { bookingId: id, error })
    await supabase.from("activity_log").insert({
      action: "family_retreat_payment_request_email_failed",
      entity_type: "family_retreat_booking", entity_id: id,
      metadata: { reference, amount_pence: outstandingPence, reason: error instanceof Error ? error.message.slice(0, 180) : "unknown" },
    })
    revalidatePath("/dashboard/family-initiative/retreat")
    return {
      emailStatus: "failed",
      detail: `Email failed: ${error instanceof Error ? error.message : "Unknown mail error"}. ${booking.status === "declined" ? "The booking was restored to pending, but no payment email was accepted." : "No successful email has been recorded."}`,
      reference,
    }
  }
}

/**
 * Finds verified Donation Manager receipts already ingested via the signed
 * webhook or a verified import. This does not query provider servers.
 */

type DonationEvidence = {
  source_record_id: string
  amount: number | null
  currency: string | null
  payment_status: string | null
  linked_record_id: string | null
  payment_reference: string | null
  occurred_at: string | null
}

async function familyRetreatExpectedAmountPence(
  supabase: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  id: string,
  fallbackAmount: number | null,
): Promise<number> {
  const { data: latest, error } = await supabase
    .from("family_retreat_tracker")
    .select("amount_pence").eq("booking_id", id).eq("action", "link_sent")
    .order("id", { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error("Unable to read the agreed retreat payment amount.")
  const requested = Number(latest?.amount_pence)
  if (latest && Number.isSafeInteger(requested) && requested > 0) return requested
  return Math.round(Number(fallbackAmount || 0) * 100)
}

async function verifiedFamilyDonationReceipts(
  supabase: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  id: string,
  reference: string,
): Promise<DonationEvidence[]> {
  // Check both provider receipts linked to this booking AND receipts that only
  // carry the human-readable SFR number. Do not count the same transaction twice.
  const select = "source_record_id, amount, currency, payment_status, linked_record_id, payment_reference, occurred_at"
  const [linked, referenced] = await Promise.all([
    supabase.from("recovery_payment_ledger").select(select)
      .eq("source", "donation_manager").eq("linked_record_type", "family_retreat_booking")
      .eq("linked_record_id", id),
    supabase.from("recovery_payment_ledger").select(select)
      .eq("source", "donation_manager").ilike("payment_reference", reference),
  ])
  if (linked.error || referenced.error)
    throw new Error("Could not read Donation Manager receipts from Devanhaar.")
  const unique = new Map<string, DonationEvidence>()
  for (const raw of [...(linked.data || []), ...(referenced.data || [])]) {
    const receipt = raw as DonationEvidence
    const providerId = String(receipt.source_record_id || "").trim()
    if (!providerId) continue
    const belongsHere = receipt.linked_record_id === id
      || (!receipt.linked_record_id && receipt.payment_reference?.toUpperCase() === reference.toUpperCase())
    if (!belongsHere) continue
    if (String(receipt.currency || "").toUpperCase() !== "GBP") continue
    if (!["paid", "completed", "received", "succeeded"].includes(String(receipt.payment_status || "").toLowerCase())) continue
    if (!(Number(receipt.amount) > 0)) continue
    unique.set(providerId, receipt)
  }
  return Array.from(unique.values())
}

/**
 * Read-only lookup against provider records that have actually reached the
 * Devanhaar database. It is NOT a live Donation Manager transaction API call.
 */
export async function checkFamilyRetreatProviderPayment(id: string): Promise<{
  verified: boolean; amountPaid: number; outstanding: number; detail: string
}> {
  const supabase = await getSupabaseAdmin()
  const { data: booking, error: lookupError } = await supabase
    .from("family_retreat_bookings")
    .select("id, booking_number, amount_due, amount_paid, payment_status")
    .eq("id", id).single()
  if (lookupError || !booking) throw new Error("Booking not found.")
  const reference = retreatReference(booking.booking_number)
  if (!reference) throw new Error("The booking reference is missing.")
  const receipts = await verifiedFamilyDonationReceipts(supabase, id, reference)
  const paidPence = receipts.reduce((sum, r) => sum + Math.round(Number(r.amount) * 100), 0)
  const duePence = await familyRetreatExpectedAmountPence(supabase, id, booking.amount_due)
  const outstandingPence = Math.max(0, duePence - paidPence)
  const verified = receipts.length > 0 && duePence > 0 && outstandingPence === 0

  if (receipts.length > 0 && (Math.round(Number(booking.amount_paid || 0) * 100) !== paidPence
    || booking.payment_status !== (verified ? "paid" : "unpaid"))) {
    const { error: updateError } = await supabase.from("family_retreat_bookings")
      .update({
        amount_paid: paidPence / 100,
        payment_status: verified ? "paid" : "unpaid",
        ...(verified ? { paid_at: receipts
          .map(r => r.occurred_at).filter((v): v is string => Boolean(v)).sort().at(-1) || new Date().toISOString() } : {}),
      }).eq("id", id)
    if (updateError) throw new Error("Payment record matched, but booking status could not be updated.")
    revalidatePath("/dashboard/family-initiative/retreat")
  }

  return {
    verified, amountPaid: paidPence / 100, outstanding: outstandingPence / 100,
    detail: receipts.length === 0
      ? `No completed provider transaction is currently recorded in Devanhaar for ${reference}. The payment has not been disproved; this check cannot query Donation Manager directly. Provider notification or historical receipt import is required.`
      : verified
        ? `Matched ${receipts.length} Donation Manager transaction(s) for ${reference}. ${formatGbp(paidPence / 100)} received; no balance outstanding. You can now review and confirm the booking.`
        : `Found ${receipts.length} completed provider transaction(s) for ${reference}: ${formatGbp(paidPence / 100)} received, ${formatGbp(outstandingPence / 100)} still outstanding.`,
  }
}

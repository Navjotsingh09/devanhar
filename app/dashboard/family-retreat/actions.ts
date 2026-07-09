"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

type RetreatStatus = "pending" | "confirmed" | "waitlisted" | "declined" | "archived"

type Booking = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  payment_status: string | null
  amount_due: number | null
  amount_paid: number | null
  stripe_payment_link_id: string | null
  adults_attending: Array<Record<string, unknown>> | null
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devanhaar.com"
const FAMILY_RETREAT_PAYMENT_LINK =
  process.env.FAMILY_RETREAT_PAYMENT_LINK || "https://buy.stripe.com/7sY14pddk8qWdyB1EVbEA02"
const FAMILY_RETREAT_STRIPE_PRODUCT = process.env.FAMILY_RETREAT_STRIPE_PRODUCT || "prod_UliRJAIaHaHO9e"

const SIGNATURE_LINES = [
  "Best wishes,",
  "",
  "Daljit Kaur",
  "Specialist Lead",
  "Mob: 07780 334 940",
  "Email: Daljit.Kaur@devanhaar.com",
  "LinkedIn: daljitkaurstem",
  "",
  "Follow The Sikh Family Initiative on Instagram:",
  "https://www.instagram.com/thesikhfamilyinitiative",
]

const SIGNATURE_HTML =
  '<p style="margin-top:24px">Best wishes,<br><br><strong>Daljit Kaur</strong><br>Specialist Lead<br>Mob: 07780 334 940<br>Email: <a href="mailto:Daljit.Kaur@devanhaar.com">Daljit.Kaur@devanhaar.com</a><br>LinkedIn: daljitkaurstem</p>' +
  '<p>Follow The Sikh Family Initiative on Instagram:<br><a href="https://www.instagram.com/thesikhfamilyinitiative">https://www.instagram.com/thesikhfamilyinitiative</a></p>'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!url || !key) {
    throw new Error("Supabase service role configuration is missing")
  }
  return createClient(url, key)
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

async function sendEmail(params: { to: string; subject: string; text: string; html: string }) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: "Sikh Family Retreat <noreply@devanhaar.com>",
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  })
}

async function getBooking(id: string): Promise<Booking> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("family_retreat_bookings")
    .select("id, first_name, last_name, email, payment_status, amount_due, amount_paid, stripe_payment_link_id, adults_attending")
    .eq("id", id)
    .single()

  if (error || !data) {
    throw new Error("Booking not found")
  }

  return data as Booking
}

async function createExactAmountPaymentLink(amountPence: number, bookingId: string, email: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      url: buildLinkWithParams(FAMILY_RETREAT_PAYMENT_LINK, {
        client_reference_id: bookingId,
        prefilled_email: email,
      }),
      id: null,
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
    ...SIGNATURE_LINES,
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
    SIGNATURE_HTML,
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
    ...SIGNATURE_LINES,
  ].join("\n")

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
    `<p>Dear ${escapeHtml(firstName)},</p>`,
    "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
    "<p>Thank you for your booking application for The Sikh Family Initiative: Sikh Family Retreat.</p>",
    "<p>After careful review, we are unable to offer a place at this time.</p>",
    "<p>Please keep in touch for future opportunities.</p>",
    SIGNATURE_HTML,
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
    ...SIGNATURE_LINES,
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
    SIGNATURE_HTML,
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
  const supabase = getSupabaseAdmin()
  const booking = await getBooking(id)

  const updatePayload: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
  }

  if (status === "confirmed" && details?.amount && details.amount > 0 && booking.email) {
    const { url, id: linkId } = await createExactAmountPaymentLink(
      Math.round(details.amount * 100),
      id,
      booking.email,
    )

    updatePayload.amount_due = details.amount
    updatePayload.payment_status = "unpaid"
    updatePayload.stripe_payment_link = url
    updatePayload.stripe_payment_link_id = linkId
    updatePayload.paid_at = null

    try {
      await sendConfirmationEmail(
        booking.email,
        booking.first_name || "there",
        details.amount,
        url,
        details.adults ?? (Array.isArray(booking.adults_attending) ? booking.adults_attending.length : 0),
      )
    } catch (error) {
      console.error("[family-retreat] confirmation email failed", error)
    }
  }

  if (status === "declined" && booking.email) {
    try {
      await sendDeclineEmail(booking.email, booking.first_name || "there")
    } catch (error) {
      console.error("[family-retreat] decline email failed", error)
    }
  }

  const { error } = await supabase
    .from("family_retreat_bookings")
    .update(updatePayload)
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  await supabase.from("activity_log").insert({
    action: `family_retreat_${status}`,
    entity_type: "family_retreat_booking",
    entity_id: id,
    metadata: {
      adults: details?.adults ?? null,
      amount: details?.amount ?? null,
    },
  })

  revalidatePath("/dashboard/family-retreat")
}

export async function syncFamilyRetreatPayment(id: string): Promise<{ paid: boolean }> {
  const booking = await getBooking(id)
  if (!booking.stripe_payment_link_id || !process.env.STRIPE_SECRET_KEY) {
    return { paid: false }
  }

  const supabase = getSupabaseAdmin()
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
      action: "family_retreat_payment_synced",
      entity_type: "family_retreat_booking",
      entity_id: id,
      metadata: { stripe_session_id: paidSession.id, amount_paid: amountPaid },
    })

    revalidatePath("/dashboard/family-retreat")
    return { paid: true }
  } catch (error) {
    console.error("[family-retreat] sync payment failed", error)
    return { paid: false }
  }
}

export async function sendFamilyRetreatAdditionalCharge(
  id: string,
  payload: { amount: number; referenceNote: string },
) {
  const amount = Number(payload.amount)
  const referenceNote = (payload.referenceNote || "").trim()
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Please enter a valid amendment amount")
  }
  if (referenceNote.length < 10) {
    throw new Error("Please provide a clear amendment note")
  }

  const booking = await getBooking(id)
  if (!booking.email) {
    throw new Error("Booking email is missing")
  }

  const supabase = getSupabaseAdmin()
  const { url, id: linkId } = await createExactAmountPaymentLink(Math.round(amount * 100), id, booking.email)

  const { error } = await supabase
    .from("family_retreat_bookings")
    .update({
      stripe_payment_link: url,
      stripe_payment_link_id: linkId,
      payment_status: "unpaid",
      amount_due: amount,
      internal_notes: referenceNote,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

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
    console.error("[family-retreat] amendment email failed", emailError)
  }

  await supabase.from("activity_log").insert({
    action: "family_retreat_additional_charge_sent",
    entity_type: "family_retreat_booking",
    entity_id: id,
    metadata: { amount, reference_note: referenceNote, payment_link_id: linkId },
  })

  revalidatePath("/dashboard/family-retreat")
}

export async function removeFamilyRetreatBooking(id: string, mode: "archive" | "delete") {
  const supabase = getSupabaseAdmin()

  if (mode === "archive") {
    const { error } = await supabase
      .from("family_retreat_bookings")
      .update({ status: "archived" })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await supabase.from("activity_log").insert({
      action: "family_retreat_archived",
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
      action: "family_retreat_deleted",
      entity_type: "family_retreat_booking",
      entity_id: id,
    })
  }

  revalidatePath("/dashboard/family-retreat")
}

export async function updateFamilyRetreatNotes(id: string, notes: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("family_retreat_bookings")
    .update({ internal_notes: notes })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/family-retreat")
}

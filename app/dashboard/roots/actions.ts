"use server"

import { createClient } from "@supabase/supabase-js"
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { revalidatePath } from "next/cache"
import { rootsFee, rootsCheckout, sendRootsDecisionEmail } from '@/lib/roots-forms/decision-email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

async function getSupabase() {
  await requireRootsStaff()
  return createClient(supabaseUrl, supabaseServiceKey)
}

function escHtml(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

const FROM = "Roots Residential <noreply@devanhaar.com>"
const SIG = `<p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh,</p><p><strong>Roots Residential Team</strong><br/>Devanhaar<br/><a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a> &bull; +44 7735 048882<br/><a href="https://www.instagram.com/rootsuk13">@rootsuk13</a> on Instagram</p>`
const SIG_TEXT = "\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh,\nRoots Residential Team\nDevanhaar\nRoots@Devanhaar.com | +44 7735 048882"

async function getBooking(id: string) {
  const supabase = (await getSupabase())
  const { data, error } = await supabase
    .from("roots_bookings")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw new Error("The Roots booking could not be loaded. Please retry.")
  return data
}

async function addActivityLog(id: string, entry: object) {
  const supabase = (await getSupabase())
  const { data, error } = await supabase
    .from("roots_bookings")
    .select("activity_log")
    .eq("id", id)
    .single()
  if (error) throw new Error("The booking changed, but its activity history could not be loaded. Reload before retrying.")
  const log = Array.isArray(data?.activity_log) ? data.activity_log : []
  const { error: logError } = await supabase
    .from("roots_bookings")
    .update({ activity_log: [...log, { ...entry, at: new Date().toISOString() }] })
    .eq("id", id)
  if (logError) throw new Error("The action completed, but its activity log could not be saved. Reload before retrying.")
}

// ------- CONFIRM -------
export async function confirmRootsBooking(
  id: string,
  amount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = (await getSupabase())
  const booking = await getBooking(id)
  if (!booking) return { ok: false, error: "Booking not found" }

  if (!process.env.RESEND_API_KEY) return { ok: false, error: "Email is not configured. No acceptance email was sent or booking changed." }
  if (booking.payment_status === "paid") return { ok: false, error: "This booking is already paid. Its payment status has not been changed." }
  if (amount !== rootsFee) return { ok: false, error: "The Roots residential fee is £50." }

  const paymentLink = rootsCheckout

  // Update booking
  const { data: updated, error: updateError } = await supabase
    .from("roots_bookings")
    .update({
      status: "confirmed",
      amount_due: amount,
      nowdonate_payment_url: paymentLink,
    })
    .eq("id", id).eq("status", booking.status).eq("payment_status", booking.payment_status)
    .select("id").maybeSingle()

  if (updateError || !updated) return { ok: false, error: "The acceptance could not be saved or the booking changed. Reload before retrying. No email was sent." }

  // Send confirmation email to parent
  if (process.env.RESEND_API_KEY) {
    try {
      await sendRootsDecisionEmail({reference: id, revision: 0, to: booking.parent_email,
        parentName: `${booking.parent_first_name} ${booking.parent_last_name}`,
        childName: `${booking.camper_first_name} ${booking.camper_last_name}`, decision: 'accepted'})
    } catch {
      console.error("[roots/confirm] Acceptance saved, but notification delivery failed")
      revalidatePath("/dashboard/roots")
      return { ok: false, error: "Acceptance saved, but the payment email was not sent. Retry acceptance to resend it; do not ask the family to reapply." }
    }
  }

  await addActivityLog(id, { action: "confirmed_email_sent", amount, by: "admin", payment_provider: "nowdonate" })
  revalidatePath("/dashboard/roots")
  return { ok: true }
}

// ------- DECLINE -------
export async function declineRootsBooking(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = (await getSupabase())
  const booking = await getBooking(id)
  if (!booking) return { ok: false, error: "Booking not found" }
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "Email is not configured. No decline email was sent or booking changed." }
  if (booking.payment_status === "paid") return { ok: false, error: "This booking is paid. Contact the family and review its payment before declining." }

  const { data: updated, error: updateError } = await supabase
    .from("roots_bookings")
    .update({ status: "declined" })
    .eq("id", id).eq("status", booking.status).eq("payment_status", booking.payment_status)
    .select("id").maybeSingle()

  if (updateError || !updated) return { ok: false, error: "The decline could not be saved or the booking changed. Reload before retrying. No email was sent." }

  if (process.env.RESEND_API_KEY) {
    try {
      await sendRootsDecisionEmail({reference: id, revision: 0, to: booking.parent_email,
        parentName: `${booking.parent_first_name} ${booking.parent_last_name}`,
        childName: `${booking.camper_first_name} ${booking.camper_last_name}`, decision: 'declined'})
    } catch {
      console.error("[roots/decline] Decline saved, but notification delivery failed")
      revalidatePath("/dashboard/roots")
      return { ok: false, error: "Decline saved, but the email was not sent. Retry decline to resend it." }
    }
  }

  await addActivityLog(id, { action: "declined_email_sent", by: "admin" })
  revalidatePath("/dashboard/roots")
  return { ok: true }
}

// ------- SYNC PAYMENT -------
export async function syncRootsPayment(id: string): Promise<{ paid: boolean; error?: string }> {
  const booking = await getBooking(id)
  if (!booking) return { paid: false, error: "Booking not found" }
  if (booking.payment_status === "paid") {
    revalidatePath("/dashboard/roots")
    return { paid: true }
  }

  const apiKey = (process.env.NOWDONATE_API_KEY || "").trim()
  if (!apiKey) return { paid: false, error: "Missing NOWDONATE_API_KEY" }

  // DonationManager donations query endpoint TBD — checked locally for now
  return { paid: false }
}

// ------- PAYMENT REMINDER -------
export async function sendRootsPaymentReminder(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const booking = await getBooking(id)
  if (!booking) return { ok: false, error: "Booking not found" }
  if (booking.payment_status === "paid") return { ok: false, error: "Already paid" }
  if (!booking.nowdonate_payment_url) return { ok: false, error: "No payment link" }
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "Email not configured" }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    const parentName = `${escHtml(booking.parent_first_name)} ${escHtml(booking.parent_last_name)}`
    const camperName = `${escHtml(booking.camper_first_name)} ${escHtml(booking.camper_last_name)}`
    const amount = booking.amount_due ?? ""

    const btnLabel = amount ? `Complete payment &mdash; &pound;${amount}` : "Complete payment"
    const paymentButton = `<p style="text-align:center;margin:28px 0;"><a href="${booking.nowdonate_payment_url}" style="display:inline-block;background:#8a6200;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">${btnLabel}</a></p><p style="font-size:13px;color:#666;text-align:center;">This link is personal to ${escHtml(booking.camper_first_name)}. Please do not share it.</p>`

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">Friendly reminder &mdash; Roots Residential payment</h2><p>Dear ${parentName},</p><p>This is a friendly reminder that payment is still outstanding to secure <strong>${camperName}</strong>&#39;s place on Roots Residential.</p><p>Places are allocated on a first-come, first-served basis once payment is received. Please complete your payment as soon as possible using the button below:</p>${paymentButton}<p>If you have any questions or need to discuss payment, please contact us at <a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a> or <a href="https://wa.me/447735048882">+44 7735 048882</a>.</p><p>If you have already made your payment, please ignore this message.</p>${SIG}</div>`

    const text = [
      "Friendly reminder -- Roots Residential payment",
      "",
      `Dear ${booking.parent_first_name} ${booking.parent_last_name},`,
      "",
      `This is a friendly reminder that payment is still outstanding for ${booking.camper_first_name} ${booking.camper_last_name}'s place on Roots Residential.`,
      "",
      "Please complete your payment:",
      booking.nowdonate_payment_url,
      "",
      "Contact us at Roots@Devanhaar.com or +44 7735 048882.",
      SIG_TEXT,
    ].join("\n")

    await resend.emails.send({
      from: FROM,
      to: booking.parent_email,
      subject: `Reminder: payment outstanding for ${booking.camper_first_name} -- Roots Residential`,
      html,
      text,
    })

    await addActivityLog(id, { action: "payment_reminder_sent", by: "admin" })
    revalidatePath("/dashboard/roots")
    return { ok: true }
  } catch (err) {
    console.error("[roots/reminder] Error:", err)
    return { ok: false, error: "Failed to send email" }
  }
}

// ------- ARCHIVE / UNARCHIVE -------
export async function archiveRootsBooking(id: string, archive: boolean): Promise<void> {
  const supabase = (await getSupabase())
  await supabase
    .from("roots_bookings")
    .update({ archived: archive, archived_at: archive ? new Date().toISOString() : null })
    .eq("id", id)
  await addActivityLog(id, { action: archive ? "archived" : "unarchived", by: "admin" })
  revalidatePath("/dashboard/roots")
}

// ------- MARK AS PAID (manual admin override) -------
export async function markRootsBookingAsPaid(
  id: string,
  amountPaid: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = (await getSupabase())
  const booking = await getBooking(id)
  if (!booking) return { ok: false, error: "Booking not found" }
  if (booking.payment_status === "paid") return { ok: false, error: "Already marked as paid" }

  const { error } = await supabase
    .from("roots_bookings")
    .update({
      payment_status: "paid",
      amount_paid: amountPaid,
      paid_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  await addActivityLog(id, { action: "marked_paid_manually", amount: amountPaid, by: "admin" })
  revalidatePath("/dashboard/roots")
  return { ok: true }
}

// ------- DELETE -------
export async function deleteRootsBooking(id: string): Promise<void> {
  const supabase = (await getSupabase())
  await supabase.from("roots_bookings").delete().eq("id", id)
  revalidatePath("/dashboard/roots")
}

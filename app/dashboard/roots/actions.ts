"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function escHtml(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

const FROM = "Roots Residential <noreply@devanhaar.com>"
const SIG = `<p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh,</p><p><strong>Roots Residential Team</strong><br/>Devanhaar<br/><a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a> &bull; +44 7735 048882<br/><a href="https://www.instagram.com/rootsuk13">@rootsuk13</a> on Instagram</p>`
const SIG_TEXT = "\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh,\nRoots Residential Team\nDevanhaar\nRoots@Devanhaar.com | +44 7735 048882"

async function getBooking(id: string) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from("roots_bookings")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

async function addActivityLog(id: string, entry: object) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from("roots_bookings")
    .select("activity_log")
    .eq("id", id)
    .single()
  const log = Array.isArray(data?.activity_log) ? data.activity_log : []
  await supabase
    .from("roots_bookings")
    .update({ activity_log: [...log, { ...entry, at: new Date().toISOString() }] })
    .eq("id", id)
}

// ------- CONFIRM -------
export async function confirmRootsBooking(id: string, amount: number): Promise<void> {
  const supabase = getSupabase()
  const booking = await getBooking(id)
  if (!booking) throw new Error("Booking not found")

  const nowDonateApiKey = process.env.NOWDONATE_API_KEY || ""
  const checkoutId = process.env.NOWDONATE_CHECKOUT_ID || ""

  if (!nowDonateApiKey) throw new Error("Missing NOWDONATE_API_KEY")
  if (!checkoutId) throw new Error("Missing NOWDONATE_CHECKOUT_ID")
  if (!(amount > 0)) throw new Error("Payment amount must be greater than 0")

  let paymentLink: string | null = null

  try {
    const response = await fetch("https://api.nowdonate.com/v2/checkouts/links", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${nowDonateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_id: Number(checkoutId),
        amount: Math.round(amount * 100),
        currency: "GBP",
        custom: id,
        redirect_uri: "https://devanhaar.com/initiatives/roots-residential?paid=1",
        cancel_uri: "https://devanhaar.com/initiatives/roots-residential#booking-form",
        supporter: {
          email: booking.parent_email,
          first_name: booking.parent_first_name,
          last_name: booking.parent_last_name,
        },
      }),
    })

    const data = await response.json().catch(() => null)
    paymentLink = data?.url || data?.checkout_url || data?.payment_url || null

    if (!response.ok || !paymentLink) {
      console.error("[roots/confirm] NowDonate link error:", data)
      throw new Error("Failed to create NowDonate payment link")
    }
  } catch (err) {
    console.error("[roots/confirm] NowDonate link error:", err)
    throw new Error("Could not create payment link")
  }

  // Update booking
  await supabase
    .from("roots_bookings")
    .update({
      status: "confirmed",
      amount_due: amount,
      payment_status: "unpaid",
      nowdonate_payment_url: paymentLink,
    })
    .eq("id", id)

  await addActivityLog(id, { action: "confirmed", amount, by: "admin", payment_provider: "nowdonate" })

  // Send confirmation email to parent
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)

      const parentName = `${escHtml(booking.parent_first_name)} ${escHtml(booking.parent_last_name)}`
      const camperName = `${escHtml(booking.camper_first_name)} ${escHtml(booking.camper_last_name)}`

      const paymentButton = paymentLink
        ? `<p style="text-align:center;margin:28px 0;"><a href="${paymentLink}" style="display:inline-block;background:#8a6200;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Pay &pound;${amount} now</a></p><p style="font-size:13px;color:#666;text-align:center;">This link is personal to ${escHtml(booking.camper_first_name)}. Please do not share it.</p>`
        : `<p>Our team will be in touch with payment details shortly.</p>`

      const paymentText = paymentLink
        ? `\nTo secure the place, please complete your payment of £${amount}:\n${paymentLink}\n`
        : `\nOur team will be in touch with payment details shortly.\n`

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">Place confirmed — Roots Residential</h2><p>Dear ${parentName},</p><p>We are delighted to confirm that <strong>${camperName}</strong> has been offered a place on Roots Residential.</p><p>To secure the place, please complete your payment of <strong>&pound;${amount}</strong> using the button below:</p>${paymentButton}<p>If you have any questions, please contact us at <a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a> or <a href="https://wa.me/447735048882">+44 7735 048882</a>.</p><p>We look forward to welcoming ${escHtml(booking.camper_first_name)} to the Roots family.</p>${SIG}</div>`

      const text = `Place confirmed — Roots Residential

Dear ${booking.parent_first_name} ${booking.parent_last_name},

We are delighted to confirm that ${booking.camper_first_name} ${booking.camper_last_name} has been offered a place on Roots Residential.

To secure the place, please complete your payment of £${amount}.${paymentText}
If you have any questions, contact us at Roots@Devanhaar.com or +44 7735 048882.

We look forward to welcoming ${booking.camper_first_name} to the Roots family.${SIG_TEXT}`

      await resend.emails.send({
        from: FROM,
        to: booking.parent_email,
        subject: `Place confirmed — Roots Residential (${booking.camper_first_name} ${booking.camper_last_name})`,
        html,
        text,
      })
    } catch (emailErr) {
      console.error("[roots/confirm] Email error:", emailErr)
    }
  }

  revalidatePath("/dashboard/roots")
}

// ------- DECLINE -------
export async function declineRootsBooking(id: string): Promise<void> {
  const supabase = getSupabase()
  const booking = await getBooking(id)
  if (!booking) throw new Error("Booking not found")

  await supabase
    .from("roots_bookings")
    .update({ status: "declined" })
    .eq("id", id)

  await addActivityLog(id, { action: "declined", by: "admin" })

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)

      const parentName = `${escHtml(booking.parent_first_name)} ${escHtml(booking.parent_last_name)}`
      const camperName = `${escHtml(booking.camper_first_name)} ${escHtml(booking.camper_last_name)}`

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">Roots Residential — booking update</h2><p>Dear ${parentName},</p><p>Thank you for your interest in Roots Residential for <strong>${camperName}</strong>.</p><p>Unfortunately, we are unable to offer a place at this time. Places for this residential are limited and we have been unable to accommodate your booking request on this occasion.</p><p>We would love to stay in touch and share future opportunities with you. Please follow us on Instagram <a href="https://www.instagram.com/rootsuk13">@rootsuk13</a> for updates on upcoming programmes.</p><p>If you have any questions, please do not hesitate to contact us at <a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a>.${SIG}</div>`

      const text = `Roots Residential — booking update

Dear ${booking.parent_first_name} ${booking.parent_last_name},

Thank you for your interest in Roots Residential for ${booking.camper_first_name} ${booking.camper_last_name}.

Unfortunately, we are unable to offer a place at this time. Places are limited and we have been unable to accommodate your booking request on this occasion.

We would love to stay in touch — please follow us on Instagram @rootsuk13 for updates on upcoming programmes.

If you have any questions, contact us at Roots@Devanhaar.com.${SIG_TEXT}`

      await resend.emails.send({
        from: FROM,
        to: booking.parent_email,
        subject: `Roots Residential — update on your booking for ${booking.camper_first_name}`,
        html,
        text,
      })
    } catch (emailErr) {
      console.error("[roots/decline] Email error:", emailErr)
    }
  }

  revalidatePath("/dashboard/roots")
}

// ------- SYNC PAYMENT -------
export async function syncRootsPayment(id: string): Promise<{ paid: boolean }> {
  const booking = await getBooking(id)
  const paid = booking?.payment_status === "paid"
  if (paid) revalidatePath("/dashboard/roots")
  return { paid }
}

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
const SIG = `<p style="margin-top:24px;font-style:italic;">Adventure. Friendship. Identity.</p><p>Kind regards,<br/><strong>The Roots Team</strong></p>`
const SIG_TEXT = "\n\nAdventure. Friendship. Identity.\n\nKind regards,\nThe Roots Team"

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

  // Use the static payment link — fixed price, no per-booking Stripe price needed
  const staticLink = process.env.ROOTS_PAYMENT_LINK || null
  const paymentLink = staticLink
    ? `${staticLink}?client_reference_id=${id}&prefilled_email=${encodeURIComponent(booking.parent_email)}`
    : null

  await supabase
    .from("roots_bookings")
    .update({
      status: "confirmed",
      amount_due: amount,
      payment_status: "unpaid",
      stripe_payment_link: paymentLink,
      stripe_payment_link_id: null,
    })
    .eq("id", id)

  await addActivityLog(id, { action: "confirmed", amount, by: "admin" })

  // Send confirmation email to parent
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)

      const parentName = `${escHtml(booking.parent_first_name)} ${escHtml(booking.parent_last_name)}`

      const paymentButton = paymentLink
        ? `<p style="text-align:center;margin:28px 0;"><a href="${paymentLink}" style="display:inline-block;background:#8a6200;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Pay &pound;${amount} now</a></p><p style="font-size:13px;color:#666;text-align:center;">Secure your place today.</p>`
        : `<p>Our team will be in touch with payment details shortly.</p>`

      const paymentText = paymentLink
        ? `\nTo complete your booking, please pay £${amount} here:\n${paymentLink}\n`
        : `\nOur team will be in touch with payment details shortly.\n`

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><p>Hi,</p><p>We&rsquo;re delighted to let you know that your application for <strong>Roots</strong> has been approved.</p><p>We can&rsquo;t wait to welcome you to what promises to be an unforgettable experience filled with adventure, new friendships, exciting challenges and opportunities for personal growth.</p><p>To secure your place, please follow the payment instructions provided below. Once payment has been received, your booking will be confirmed.</p>${paymentButton}<p>Over the coming weeks, we&rsquo;ll send you everything you need to know, including:</p><ul style="padding-left:20px;"><li>Camp information</li><li>Kit list</li><li>Arrival and departure details</li><li>Accommodation information</li><li>Important parent information</li></ul><p>If you have any questions before the programme begins, please don&rsquo;t hesitate to get in touch.</p><p>We&rsquo;re looking forward to welcoming you to the Roots community.</p>${SIG}</div>`

      const text = `Hi,\n\nWe're delighted to let you know that your application for Roots has been approved.\n\nWe can't wait to welcome you to what promises to be an unforgettable experience filled with adventure, new friendships, exciting challenges and opportunities for personal growth.\n\nTo secure your place, please follow the payment instructions provided below. Once payment has been received, your booking will be confirmed.${paymentText}\nOver the coming weeks, we'll send you everything you need to know, including:\n- Camp information\n- Kit list\n- Arrival and departure details\n- Accommodation information\n- Important parent information\n\nIf you have any questions before the programme begins, please don't hesitate to get in touch.\n\nWe're looking forward to welcoming you to the Roots community.${SIG_TEXT}`

      await resend.emails.send({
        from: FROM,
        to: booking.parent_email,
        subject: "Welcome to Roots! Your Place Has Been Confirmed",
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

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><p>Hi,</p><p>Thank you for taking the time to apply for <strong>Roots</strong>.</p><p>Unfortunately, on this occasion we are unable to offer a place.</p><p>This decision may be due to limited availability or other considerations during the application process, and is not a reflection of the individual applicant.</p><p>We truly appreciate your interest in joining Roots and hope to welcome you at a future programme.</p><p>If spaces become available, or if future Roots programmes are announced, we would be delighted to invite you to apply again.</p><p>Thank you once again for your interest, and we wish you all the very best.</p><p>Follow us on Instagram: <a href="https://www.instagram.com/rootsresidentials?igsh=MWtxMTgyZ210NnllNw%3D%3D">https://www.instagram.com/rootsresidentials?igsh=MWtxMTgyZ210NnllNw%3D%3D</a></p>${SIG}</div>`

      const text = `Hi,

Thank you for taking the time to apply for Roots.

Unfortunately, on this occasion we are unable to offer a place.

This decision may be due to limited availability or other considerations during the application process, and is not a reflection of the individual applicant.

We truly appreciate your interest in joining Roots and hope to welcome you at a future programme.

If spaces become available, or if future Roots programmes are announced, we would be delighted to invite you to apply again.

Thank you once again for your interest, and we wish you all the very best.${SIG_TEXT}

Instagram: https://www.instagram.com/rootsresidentials?igsh=MWtxMTgyZ210NnllNw%3D%3D`

      await resend.emails.send({
        from: FROM,
        to: booking.parent_email,
        subject: "Your Roots Application",
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
  if (!process.env.STRIPE_SECRET_KEY) return { paid: false }

  const supabase = getSupabase()
  const booking = await getBooking(id)
  if (!booking?.stripe_payment_link_id) return { paid: false }

  try {
    const { default: Stripe } = await import("stripe")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const sessions = await stripe.checkout.sessions.list({
      payment_link: booking.stripe_payment_link_id,
      limit: 5,
    })

    const paid = sessions.data.find(
      (s) => s.payment_status === "paid" && s.status === "complete"
    )
    if (!paid) return { paid: false }

    const amountPaid = paid.amount_total ? paid.amount_total / 100 : booking.amount_due

    await supabase
      .from("roots_bookings")
      .update({
        payment_status: "paid",
        amount_paid: amountPaid,
        paid_at: new Date().toISOString(),
      })
      .eq("id", id)

    await addActivityLog(id, { action: "payment_synced", amount: amountPaid, session_id: paid.id })

    // Send payment received email
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)

      const parentName = `${escHtml(booking.parent_first_name)} ${escHtml(booking.parent_last_name)}`
      const camperName = `${escHtml(booking.camper_first_name)} ${escHtml(booking.camper_last_name)}`

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">Payment received — Roots Residential</h2><p>Dear ${parentName},</p><p>We have received your payment of <strong>&pound;${amountPaid}</strong> for <strong>${camperName}</strong>.</p><p>Your camper&apos;s place on Roots Residential is now fully confirmed. We will be in touch with further information about arrival, what to bring and the full programme timetable.</p><p>We cannot wait to welcome ${escHtml(booking.camper_first_name)} to Roots.</p>${SIG}</div>`

      const text = `Payment received — Roots Residential

Dear ${booking.parent_first_name} ${booking.parent_last_name},

We have received your payment of £${amountPaid} for ${booking.camper_first_name} ${booking.camper_last_name}.

Your camper's place on Roots Residential is now fully confirmed. We will be in touch with further information about arrival, what to bring and the full programme timetable.

We cannot wait to welcome ${booking.camper_first_name} to Roots.${SIG_TEXT}`

      await resend.emails.send({
        from: FROM,
        to: booking.parent_email,
        subject: `Payment received — Roots Residential (${booking.camper_first_name} ${booking.camper_last_name})`,
        html,
        text,
      })
    }

    revalidatePath("/dashboard/roots")
    return { paid: true }
  } catch (err) {
    console.error("[roots/sync] Error:", err)
    return { paid: false }
  }
}

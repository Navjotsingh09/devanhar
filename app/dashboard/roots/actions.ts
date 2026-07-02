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

export async function confirmRootsBooking(id: string, amount: number): Promise<{ok: boolean; error?: string}> {
  try {
    const supabase = getSupabase()
    const booking = await getBooking(id)
    if (\!booking) return { ok: false, error: "Booking not found id=" + id }
    const staticLink = process.env.ROOTS_PAYMENT_LINK || null
    const paymentLink = staticLink
      ? `${staticLink}?client_reference_id=${id}&prefilled_email=${encodeURIComponent(booking.parent_email)}`
      : null
    const { error: dbErr } = await supabase
      .from("roots_bookings")
      .update({ status: "confirmed", amount_due: 125, payment_status: "unpaid", stripe_payment_link: paymentLink, stripe_payment_link_id: null })
      .eq("id", id)
    if (dbErr) return { ok: false, error: "DB error: " + dbErr.message }
    await addActivityLog(id, { action: "confirmed", amount, by: "admin" })
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)
        const paymentButton = paymentLink
          ? `<p style="text-align:center;margin:28px 0;"><a href="${paymentLink}" style="display:inline-block;background:#8a6200;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Pay &pound;125 now</a></p>`
          : `<p>Our team will be in touch with payment details shortly.</p>`
        const paymentText = paymentLink ? `\nPay £125 here: ${paymentLink}\n` : "\nOur team will be in touch with payment details.\n"
        const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><p>Hi,</p><p>We&rsquo;re delighted to let you know that your application for <strong>Roots</strong> has been approved.</p><p>To secure your place, please complete payment below.</p>${paymentButton}<p>We&rsquo;re looking forward to welcoming you to the Roots community.</p>${SIG}</div>`
        const text = `Hi,\n\nYour Roots application has been approved.${paymentText}\nKind regards,\nThe Roots Team`
        await resend.emails.send({ from: FROM, to: booking.parent_email, subject: "Welcome to Roots\! Your Place Has Been Confirmed", html, text })
      } catch (e) { console.error("[roots/confirm] email error:", e) }
    }
    revalidatePath("/dashboard/roots")
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: "Threw: " + (err?.message || String(err)) }
  }
}

export async function declineRootsBooking(id: string): Promise<void> {
  const supabase = getSupabase()
  const booking = await getBooking(id)
  if (\!booking) throw new Error("Booking not found")
  await supabase.from("roots_bookings").update({ status: "declined" }).eq("id", id)
  await addActivityLog(id, { action: "declined", by: "admin" })
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      const ig = "https://www.instagram.com/rootsprojectuk"
      const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><p>Hi,</p><p>Thank you for taking the time to apply for <strong>Roots</strong>.</p><p>Unfortunately, on this occasion we are unable to offer a place.</p><p>We truly appreciate your interest and hope to welcome you at a future programme.</p><p>Follow us: <a href="${ig}">${ig}</a></p>${SIG}</div>`
      const text = `Hi,\n\nThank you for applying for Roots. Unfortunately we are unable to offer a place on this occasion.\n\nWe hope to welcome you at a future programme.\n\nInstagram: ${ig}${SIG_TEXT}`
      await resend.emails.send({ from: FROM, to: booking.parent_email, subject: "Your Roots Application", html, text })
    } catch (e) { console.error("[roots/decline] email error:", e) }
  }
  revalidatePath("/dashboard/roots")
}

export async function syncRootsPayment(id: string): Promise<{ paid: boolean }> {
  return { paid: false }
}

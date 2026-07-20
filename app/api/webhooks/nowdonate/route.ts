import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function isDonationCompletedEvent(payload: any): boolean {
  const type = normalize(payload?.type)
  const event = normalize(payload?.event)
  const object = normalize(payload?.object)

  if (type === "donation.completed" || type === "donation_complete") {
    return true
  }

  return object === "donation" && (event === "completed" || event === "complete")
}

function getBookingId(payload: any): string | null {
  return (
    payload?.reference ||
    payload?.custom ||
    payload?.custom_data?.booking_id ||
    payload?.metadata?.booking_id ||
    payload?.data?.reference ||
    payload?.data?.custom ||
    payload?.data?.custom_data?.booking_id ||
    payload?.data?.metadata?.booking_id ||
    null
  )
}

function getReferenceId(payload: any): string | null {
  return (
    payload?.donation_id ||
    payload?.reference_id ||
    payload?.id ||
    payload?.data?.donation_id ||
    payload?.data?.reference_id ||
    payload?.data?.id ||
    null
  )
}

function getAmountPounds(payload: any): number {
  const rawAmount =
    payload?.amount_in_cents ??
    payload?.amount ??
    payload?.data?.amount_in_cents ??
    payload?.data?.amount ??
    0

  const numericAmount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0

  return numericAmount >= 1000 ? numericAmount / 100 : numericAmount
}

export async function GET() {
  return json({ ok: true, endpoint: "nowdonate-webhook" })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}

async function sendRootsPaymentEmail(booking: any, amountPounds: number) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)

  const parentName = `${booking.parent_first_name || ""} ${booking.parent_last_name || ""}`.trim()
  const camperName = `${booking.camper_first_name || ""} ${booking.camper_last_name || ""}`.trim()

  const SIG = `<p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh,</p><p><strong>Roots Residential Team</strong><br/>Devanhaar<br/><a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a> &bull; +44 7735 048882<br/><a href="https://www.instagram.com/rootsuk13">@rootsuk13</a> on Instagram</p>`
  const SIG_TEXT = "\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh,\nRoots Residential Team\nDevanhaar\nRoots@Devanhaar.com | +44 7735 048882"

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">Payment received — Roots Residential</h2><p>Dear ${parentName},</p><p>We have received your payment of <strong>&pound;${amountPounds}</strong> for <strong>${camperName}</strong>.</p><p>Your camper's place on Roots Residential is now fully confirmed. We will be in touch with further information about arrival, what to bring and the full programme timetable.</p><p>We cannot wait to welcome ${camperName} to Roots.</p>${SIG}</div>`

  const text = `Payment received — Roots Residential

Dear ${parentName},

We have received your payment of £${amountPounds} for ${camperName}.

Your camper's place on Roots Residential is now fully confirmed. We will be in touch with further information about arrival, what to bring and the full programme timetable.

We cannot wait to welcome ${camperName} to Roots.${SIG_TEXT}`

  await resend.emails.send({
    from: "Roots Residential <noreply@devanhaar.com>",
    to: booking.parent_email,
    subject: `Payment received — Roots Residential (${camperName})`,
    html,
    text,
  })
}

async function sendFamilyRetreatPaymentEmail(booking: any, amountPounds: number) {
  if (!process.env.RESEND_API_KEY || !booking?.email) return
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)

  const firstName = booking.first_name || "there"
  const text = [
    `Dear ${firstName},`,
    "",
    "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.",
    "",
    `Thank you — we are pleased to confirm that we have received your payment of £${amountPounds.toFixed(2)} for the Sikh Family Retreat. Your family's place is now fully secured.`,
    "",
    "We will be in touch closer to the event with further information, including arrival times, what to bring, accommodation guidance and the retreat programme.",
    "",
    "Warm regards,",
    "The Sikh Family Initiative Team",
  ].join("\n")

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
    `<p>Dear ${firstName},</p>`,
    "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
    `<p>Thank you &mdash; we are pleased to confirm that we have received your payment of <strong>£${amountPounds.toFixed(2)}</strong> for the Sikh Family Retreat. Your family&rsquo;s place is now fully secured.</p>`,
    "<p>We will be in touch closer to the event with further information, including arrival times, what to bring, accommodation guidance and the retreat programme.</p>",
    "<p>Warm regards,<br>The Sikh Family Initiative Team</p>",
    "</div>",
  ].join("")

  await resend.emails.send({
    from: "Sikh Family Retreat <noreply@devanhaar.com>",
    to: booking.email,
    subject: "Payment received — your Sikh Family Retreat place is secured",
    html,
    text,
  })
}

// NowDonate webhook handler for Roots and Sikh Family Retreat payment confirmations
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const payload = JSON.parse(rawBody)

    console.log("[webhooks/nowdonate] Received webhook:", {
      type: payload.type,
      event: payload.event,
      object: payload.object,
      donation_id: payload.donation_id,
      custom: payload.custom,
    })

    const webhookSecret = process.env.NOWDONATE_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get("x-nowdonate-signature") || ""
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      if (signature !== expectedSig) {
        console.warn("[webhooks/nowdonate] Invalid signature")
        return json({ error: "Invalid signature" }, 401)
      }
    }

    if (!isDonationCompletedEvent(payload)) {
      console.log("[webhooks/nowdonate] Ignoring event", {
        type: payload.type,
        event: payload.event,
        object: payload.object,
      })
      return json({ status: "ignored" })
    }

    const bookingId = getBookingId(payload)
    if (!bookingId) {
      console.warn("[webhooks/nowdonate] No booking ID in webhook payload")
      return json({ error: "No booking ID" }, 400)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      console.error("[webhooks/nowdonate] Missing Supabase config")
      return json({ error: "Server error" }, 500)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: rootsBooking, error: rootsFetchError } = await supabase
      .from("roots_bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle()

    const { data: familyBooking, error: familyFetchError } = rootsBooking
      ? { data: null, error: null }
      : await supabase
          .from("family_retreat_bookings")
          .select("id, first_name, last_name, email")
          .eq("id", bookingId)
          .maybeSingle()

    if (!rootsBooking && !familyBooking) {
      console.error(`[webhooks/nowdonate] Booking not found: ${bookingId}`, {
        rootsFetchError,
        familyFetchError,
      })
      return json({ error: "Booking not found" }, 404)
    }

    const amountPounds = getAmountPounds(payload)

    console.log(
      `[webhooks/nowdonate] Processing payment for ${rootsBooking ? "roots" : "family_retreat"} booking ${bookingId}: £${amountPounds}`,
    )

    const updatePayload: Record<string, unknown> = {
      payment_status: "paid",
      amount_paid: amountPounds,
      paid_at: new Date().toISOString(),
    }
    if (rootsBooking) {
      updatePayload.nowdonate_reference_id = getReferenceId(payload)
    }

    const { error: updateError } = await supabase
      .from(rootsBooking ? "roots_bookings" : "family_retreat_bookings")
      .update(updatePayload)
      .eq("id", bookingId)

    if (updateError) {
      console.error(`[webhooks/nowdonate] Failed to update booking ${bookingId}:`, updateError)
      return json({ error: "Update failed" }, 500)
    }

    if (process.env.RESEND_API_KEY) {
      try {
        if (rootsBooking) {
          await sendRootsPaymentEmail(rootsBooking, amountPounds)
          console.log(`[webhooks/nowdonate] Roots confirmation email sent to ${rootsBooking.parent_email}`)
        } else if (familyBooking) {
          await sendFamilyRetreatPaymentEmail(familyBooking, amountPounds)
          console.log(`[webhooks/nowdonate] Family Retreat confirmation email sent to ${familyBooking.email}`)
        }
      } catch (emailErr) {
        console.error("[webhooks/nowdonate] Email send error:", emailErr)
      }
    }

    return json({
      status: "success",
      booking_id: bookingId,
      booking_type: rootsBooking ? "roots" : "family_retreat",
    })
  } catch (error) {
    console.error("[webhooks/nowdonate] Error:", error)
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500)
  }
}

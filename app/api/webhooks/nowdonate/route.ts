import { familyRetreatSignatureHtml, familyRetreatSignatureLines } from '@/lib/family-retreat-email-signature'
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
function getDonorEmail(payload: any): string | null {
  const raw =
    payload?.donor_email ||
    payload?.email ||
    payload?.donor?.email ||
    payload?.data?.donor_email ||
    payload?.data?.email ||
    payload?.data?.donor?.email ||
    null
  return typeof raw === "string" && raw.includes("@") ? raw.trim().toLowerCase() : null
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

// NowDonate webhook handler for Roots Residential payment confirmations
export async function POST(request: Request) {
  try {
    // Parse webhook payload
    const rawBody = await request.text()
    const payload = JSON.parse(rawBody)

    console.log("[webhooks/nowdonate] Received webhook:", {
      type: payload.type,
      event: payload.event,
      object: payload.object,
      donation_id: payload.donation_id,
      custom: payload.custom,
    })

    // Verify webhook signature if secret is provided
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

    // Only process donation completion events.
    if (!isDonationCompletedEvent(payload)) {
      console.log("[webhooks/nowdonate] Ignoring event", {
        type: payload.type,
        event: payload.event,
        object: payload.object,
      })
      return json({ status: "ignored" })
    }

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      console.error("[webhooks/nowdonate] Missing Supabase config")
      return json({ error: "Server error" }, 500)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Sikh Family Retreat shares this exact handler with Roots Residential.
    // Match a verified provider completion by the internal UUID supplied in
    // the checkout or the visible SFR reference in the donor's message.
    const customId = [
      payload?.custom, payload?.reference, payload?.custom_data?.booking_id,
      payload?.metadata?.booking_id, payload?.data?.custom,
      payload?.data?.reference, payload?.data?.custom_data?.booking_id,
      payload?.data?.metadata?.booking_id, payload?.donation?.custom,
      payload?.data?.donation?.custom,
    ].find((value): value is string =>
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim())
    )
    const fields = [
      payload?.reference, payload?.custom, payload?.message,
      payload?.donation_message, payload?.donor_message, payload?.comment,
      payload?.donation?.message, payload?.donation?.reference,
      payload?.data?.message, payload?.data?.reference,
      payload?.data?.donation?.message, payload?.data?.donation?.reference,
    ].filter((value): value is string => typeof value === 'string')
    const sfrNumbers = [...new Set(fields.flatMap(value =>
      (value.match(/\bSFR[-\s#]*0*[0-9]{1,10}\b/gi) || [])
        .map(match => Number(match.replace(/[^0-9]/g, '')))
    ))].filter(number => Number.isSafeInteger(number) && number > 0)

    // Never mistake a Roots UUID for a Family Retreat UUID; check the table.
    const [{ data: sfrById, error: idError }, { data: sfrByNumber, error: numberError }] = await Promise.all([
      customId
        ? supabase.from('family_retreat_bookings').select('id, booking_number, status, amount_due')
            .eq('id', customId.trim()).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      sfrNumbers.length === 1
        ? supabase.from('family_retreat_bookings').select('id, booking_number, status, amount_due')
            .eq('booking_number', sfrNumbers[0]).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])
    if (idError || numberError) return json({ error: "Could not identify SFR booking" }, 500)
    const sfrBooking = sfrById || sfrByNumber
    if (sfrBooking) {
      // An applicant-controlled message alone is not proof of payment.
      // Do not unlock booking confirmation without a verified provider callback.
      if (!webhookSecret) return json({ error: "SFR webhook verification is not configured" }, 503)
      if (sfrById && sfrByNumber && sfrById.id !== sfrByNumber.id)
        return json({ error: "Payment booking references conflict" }, 422)
      if (['declined', 'archived'].includes(sfrBooking.status))
        return json({ error: "SFR booking is inactive" }, 422)
      const transactionId = getReferenceId(payload)
      const amountPounds = getAmountPounds(payload)
      if (!transactionId || !(amountPounds > 0))
        return json({ error: "Missing provider transaction ID or completed GBP amount" }, 422)
      const humanReference = 'SFR-' + String(sfrBooking.booking_number).padStart(4, '0')
      const { data: previous, error: previousError } = await supabase
        .from('recovery_payment_ledger')
        .select('id, linked_record_id')
        .eq('source', 'donation_manager')
        .eq('source_record_id', String(transactionId)).maybeSingle()
      if (previousError) return json({ error: "Receipt lookup failed" }, 500)
      if (previous && previous.linked_record_id !== sfrBooking.id)
        return json({ error: "Provider transaction already belongs to another booking" }, 409)
      if (!previous) {
        const { error: ledgerError } = await supabase.from('recovery_payment_ledger').insert({
          source: 'donation_manager', source_record_id: String(transactionId),
          occurred_at: new Date().toISOString(), amount: amountPounds,
          currency: 'GBP', payment_status: 'paid',
          payment_reference: humanReference,
          description: 'Sikh Family Retreat — verified NowDonate payment',
          linked_record_type: 'family_retreat_booking', linked_record_id: sfrBooking.id,
        })
        if (ledgerError) {
          if (ledgerError.code !== '23505') return json({ error: "Could not record verified receipt" }, 500)
          return json({ status: "duplicate_receipt" })
        }
      }
      const [{ data: receipts, error: receiptsError }, { data: request, error: requestError }] = await Promise.all([
        supabase.from('recovery_payment_ledger').select('amount')
          .eq('source', 'donation_manager')
          .eq('linked_record_type', 'family_retreat_booking')
          .eq('linked_record_id', sfrBooking.id).eq('payment_status', 'paid'),
        supabase.from('family_retreat_tracker').select('amount_pence')
          .eq('booking_id', sfrBooking.id).eq('action', 'link_sent')
          .order('id', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (receiptsError || requestError) return json({ error: "Could not calculate SFR balance" }, 500)
      const totalPence = (receipts || []).reduce((sum, row) => sum + Math.round(Number(row.amount || 0) * 100), 0)
      const duePence = Number(request?.amount_pence) || Math.round(Number(sfrBooking.amount_due || 0) * 100)
      const paid = duePence > 0 && totalPence >= duePence
      const { error: updateError } = await supabase.from('family_retreat_bookings')
        .update({ amount_paid: totalPence / 100, payment_status: paid ? 'paid' : 'unpaid',
          ...(paid ? { paid_at: new Date().toISOString() } : {}) })
        .eq('id', sfrBooking.id)
      if (updateError) return json({ error: "Could not update SFR booking" }, 500)
      console.log("[webhooks/nowdonate] Verified SFR receipt", {
        booking_id: sfrBooking.id, reference: humanReference, amount_pence: totalPence, paid,
      })
      return json({ status: "reconciled", reference: humanReference, paid })
    }
    if (sfrNumbers.length > 1) return json({ error: "Ambiguous SFR payment reference" }, 422)

    // Extract booking ID from custom field; fall back to email lookup for direct appeal payments
    const bookingId = getBookingId(payload)

    // Wolf Run entries are a separate table, keyed by their own custom reference prefix.
    if (typeof bookingId === "string" && bookingId.startsWith("wolfrun_runner:")) {
      const runnerId = bookingId.slice("wolfrun_runner:".length)
      const { data: runner, error: runnerError } = await supabase
        .from("wolfrun_runners")
        .select("id, status")
        .eq("id", runnerId)
        .maybeSingle()

      if (runnerError || !runner) {
        console.error(`[webhooks/nowdonate] Wolf Run runner not found: ${runnerId}`, runnerError)
        return json({ error: "Runner not found" }, 404)
      }

      if (runner.status !== "confirmed") {
        const { error: confirmError } = await supabase
          .from("wolfrun_runners")
          .update({ status: "confirmed", stripe_payment_intent_id: getReferenceId(payload) })
          .eq("id", runnerId)

        if (confirmError) {
          console.error(`[webhooks/nowdonate] Failed to confirm Wolf Run runner ${runnerId}:`, confirmError)
          return json({ error: "Update failed" }, 500)
        }
      }

      console.log(`[webhooks/nowdonate] Wolf Run runner confirmed: ${runnerId}`)
      return json({ status: "ok", runner_id: runnerId })
    }

    let rootsBooking: any = null
    let familyBooking: any = null

    if (bookingId) {
      const [rb, fb] = await Promise.all([
        supabase.from("roots_bookings").select("*").eq("id", bookingId).maybeSingle(),
        supabase.from("family_retreat_bookings").select("*").eq("id", bookingId).maybeSingle(),
      ])
      rootsBooking = rb.data
      familyBooking = fb.data?.nowdonate_payment_url ? fb.data : null
    } else {
      // No booking ID — payment made via direct appeal link; match by donor email
      const donorEmail = getDonorEmail(payload)
      console.log("[webhooks/nowdonate] No booking ID; attempting email fallback", { donorEmail })

      if (donorEmail) {
        const { data: matches } = await supabase
          .from("roots_bookings")
          .select("*")
          .eq("parent_email", donorEmail)
          .neq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)

        rootsBooking = matches?.[0] ?? null

        if (!rootsBooking) {
          const { data: fMatches } = await supabase
            .from("family_retreat_bookings")
            .select("*")
            .eq("email", donorEmail)
            .not("nowdonate_payment_url", "is", null)
            .neq("payment_status", "paid")
            .order("created_at", { ascending: false })
            .limit(1)

          familyBooking = fMatches?.[0] ?? null
        }
      }

      if (!rootsBooking && !familyBooking) {
        console.warn("[webhooks/nowdonate] No booking found via email fallback")
        return json({ status: "no_match", note: "Payment received but no unpaid booking matched" })
      }
    }

    if (!rootsBooking && !familyBooking) {
      console.error(`[webhooks/nowdonate] Booking not found: ${bookingId}`)
      return json({ error: "Booking not found" }, 404)
    }

    const amountPounds = getAmountPounds(payload)
    const matchedId = rootsBooking?.id ?? familyBooking?.id

    console.log(`[webhooks/nowdonate] Processing payment for booking ${matchedId}: £${amountPounds}`)

    const paidUpdateBase = {
      payment_status: "paid",
      amount_paid: amountPounds,
      paid_at: new Date().toISOString(),
    }

    const { error: updateError } = rootsBooking
      ? await supabase
          .from("roots_bookings")
          .update({
            ...paidUpdateBase,
            nowdonate_reference_id: getReferenceId(payload),
          })
          .eq("id", matchedId)
      : await supabase
          .from("family_retreat_bookings")
          .update(paidUpdateBase)
          .eq("id", matchedId)

    if (updateError) {
      console.error(`[webhooks/nowdonate] Failed to update booking ${matchedId}:`, updateError)
      return json({ error: "Update failed" }, 500)
    }

    // Send payment confirmation email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        if (rootsBooking) {
          const parentName = `${rootsBooking.parent_first_name || ""} ${rootsBooking.parent_last_name || ""}`.trim()
          const camperName = `${rootsBooking.camper_first_name || ""} ${rootsBooking.camper_last_name || ""}`.trim()

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
            to: rootsBooking.parent_email,
            subject: `Payment received — Roots Residential (${camperName})`,
            html,
            text,
          })

          console.log(`[webhooks/nowdonate] Roots confirmation email sent to ${rootsBooking.parent_email}`)
        }

        if (familyBooking?.email) {
          const fullName = `${familyBooking.first_name || ""} ${familyBooking.last_name || ""}`.trim()
          const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">Payment received — Sikh Family Retreat</h2><p>Dear ${fullName || "there"},</p><p>We have received your payment of <strong>&pound;${amountPounds}</strong> for your Sikh Family Retreat booking.</p><p>Your booking is now marked as paid. We will follow up with any next steps if needed.</p>${familyRetreatSignatureHtml}</div>`
          const text = `Payment received — Sikh Family Retreat

Dear ${fullName || "there"},

We have received your payment of £${amountPounds} for your Sikh Family Retreat booking.

Your booking is now marked as paid. We will follow up with any next steps if needed.

${familyRetreatSignatureLines.join("\n")}`

          await resend.emails.send({
            from: "Sikh Family Retreat <noreply@devanhaar.com>",
            to: familyBooking.email,
            subject: "Payment received — Sikh Family Retreat",
            html,
            text,
          })

          console.log(`[webhooks/nowdonate] Family retreat confirmation email sent to ${familyBooking.email}`)
        }
      } catch (emailErr) {
        console.error("[webhooks/nowdonate] Email send error:", emailErr)
        // Don't fail the webhook if email fails
      }
    }

    return json({ status: "success", booking_id: matchedId })
  } catch (error) {
    console.error("[webhooks/nowdonate] Error:", error)
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500)
  }
}

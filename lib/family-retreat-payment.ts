import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

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

async function sendPaymentReceivedEmail(email: string, firstName: string, amountPaid: number) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: "Sikh Family Retreat <noreply@devanhaar.com>",
    to: email,
    subject: "Payment received \u2014 your Sikh Family Retreat place is secured",
    text: [
      `Dear ${firstName},`,
      "",
      "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.",
      "",
      `Thank you \u2014 we are pleased to confirm that we have received your payment of \u00a3${amountPaid.toFixed(2)} for the Sikh Family Retreat. Your family's place is now fully secured.`,
      "",
      "We will be in touch closer to the event with further information, including arrival times, what to bring, accommodation guidance and the retreat programme.",
      "",
      "We are really looking forward to welcoming your family.",
      "",
      "Warm regards,",
      "The Sikh Family Initiative Team",
      "",
      "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.",
      "",
      ...SIGNATURE_LINES,
    ].join("\n"),
    html: [
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
      `<p>Dear ${firstName},</p>`,
      "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
      `<p>Thank you &mdash; we are pleased to confirm that we have received your payment of <strong>\u00a3${amountPaid.toFixed(2)}</strong> for the Sikh Family Retreat. Your family&rsquo;s place is now fully secured.</p>`,
      "<p>We will be in touch closer to the event with further information, including arrival times, what to bring, accommodation guidance and the retreat programme.</p>",
      "<p>We are really looking forward to welcoming your family.</p>",
      "<p>Warm regards,<br>The Sikh Family Initiative Team</p>",
      "<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>",
      SIGNATURE_HTML,
      "</div>",
    ].join(""),
  })
}

export async function reconcileFamilyRetreatBySession(sessionId: string): Promise<{ paid: boolean; firstName?: string; amount?: number }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!stripeKey || !url || !key) return { paid: false }
  try {
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid" && session.status !== "complete") return { paid: false }

    const supabase = createClient(url, key)
    const bookingId = session.client_reference_id || session.metadata?.family_retreat_booking_id || null

    let booking: { id: string; email: string | null; first_name: string | null; payment_status: string | null } | null = null
    if (bookingId) {
      const { data } = await supabase
        .from("family_retreat_bookings")
        .select("id, email, first_name, payment_status")
        .eq("id", bookingId)
        .maybeSingle()
      booking = data as typeof booking
    }
    if (!booking && session.payment_link) {
      const plinkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link.id
      const { data } = await supabase
        .from("family_retreat_bookings")
        .select("id, email, first_name, payment_status")
        .eq("stripe_payment_link_id", plinkId)
        .maybeSingle()
      booking = data as typeof booking
    }

    const amount = (session.amount_total ?? 0) / 100
    if (booking && booking.payment_status !== "paid") {
      await supabase
        .from("family_retreat_bookings")
        .update({ payment_status: "paid", amount_paid: amount, paid_at: new Date().toISOString() })
        .eq("id", booking.id)
      if (booking.email) {
        try {
          await sendPaymentReceivedEmail(booking.email, booking.first_name || "there", amount)
        } catch (e) {
          console.error("[family-retreat] payment-received email failed:", e)
        }
      }
    }
    return { paid: true, firstName: booking?.first_name || undefined, amount }
  } catch (e) {
    console.error("[family-retreat] reconcileBySession failed:", e)
    return { paid: false }
  }
}

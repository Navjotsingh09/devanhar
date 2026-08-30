import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const notificationEmails = [process.env.FAMILY_INITIATIVE_NOTIFICATION_EMAIL || "TheSikhFI@devanhaar.com", "SikhFI@devanhaar.com"]
const rates = { child: { door: 8, transport: 10 }, adult: { door: 15, transport: 20 } }
const paymentUrl = process.env.FAMILY_INITIATIVE_NOWDONATE_URL || "https://www.nowdonate.com/checkout/8si3xc94i520d3ex5bf0"
function adminClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) throw new Error("Missing Supabase service role credentials"); return createClient(url, key) }
export async function GET() { return NextResponse.json({ ok: true, route: "family-initiative-bookings", methods: ["POST"] }) }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); const contact = body.contact || {}; const children = Array.isArray(body.children) ? body.children : []; const adults = Array.isArray(body.adults) ? body.adults : []; const travel = "door" as const
    if (body.travel === "transport") return NextResponse.json({ error: "Organised transport is fully booked. Please choose door entry and make your own way to Hilston Park." }, { status: 409 })
    if (!contact.name?.trim() || !emailPattern.test(contact.email || "") || !contact.phone?.trim()) return NextResponse.json({ error: "Please complete the main contact details." }, { status: 400 })
    if (!children.length || !adults.length) return NextResponse.json({ error: "Please add at least one child and one adult." }, { status: 400 })
    if ([...children, ...adults].some((attendee) => !attendee.name?.trim() || !/^\d{1,3}$/.test(String(attendee.age)) || Number(attendee.age) > 120)) return NextResponse.json({ error: "Please complete every attendee's name and age." }, { status: 400 })
    if (!contact.consent) return NextResponse.json({ error: "Please accept the privacy policy to continue." }, { status: 400 })
    const total = children.length * rates.child[travel] + adults.length * rates.adult[travel]
    const payload = { event_name: "Family Fun Day - Summer Extravaganza", event_date: "2026-08-31", contact_name: contact.name.trim(), email: contact.email.trim().toLowerCase(), phone: contact.phone.trim(), children_attending: children, adults_attending: adults, travel_option: travel, pickup_details: null, medical_allergy_information: contact.medical?.trim() || null, estimated_total_pence: total * 100, consent_privacy: true, page_url: body.page_url?.slice(0, 2048) || null, status: "pending" }
    const { data, error } = await adminClient().from("family_initiative_bookings").insert(payload).select("id").single()
    if (error) { console.error("[family-initiative-bookings] DB error:", error); return NextResponse.json({ error: "Failed to save booking. Please try again." }, { status: 500 }) }
    if (process.env.RESEND_API_KEY) { try { const { Resend } = await import("resend"); const resend = new Resend(process.env.RESEND_API_KEY); const summary = [`New Sikh Family Initiative booking request`, `Submission ID: ${data.id}`, `Event: ${payload.event_name} (${payload.event_date})`, `Contact: ${payload.contact_name}`, `Email: ${payload.email}`, `Phone: ${payload.phone}`, `Children: ${JSON.stringify(children)}`, `Adults: ${JSON.stringify(adults)}`, `Travel: ${travel}`, `Pickup: ${payload.pickup_details || "Not required"}`, `Medical/allergy information: ${payload.medical_allergy_information || "None stated"}`, `Estimated total: £${total}`].join("\n"); await resend.emails.send({ from: "Devanhaar <noreply@devanhaar.com>", to: notificationEmails, subject: `Family Fun Day booking - ${payload.contact_name}`, text: summary }); const paymentText = `Dear ${payload.contact_name},

Thank you for your Family Fun Day - Summer Extravaganza booking request for 31 August 2026. Please complete payment of £${total} using NowDonate:

${paymentUrl}

The Sikh Family Initiative team will review your details and contact you to confirm the booking.

Warm regards,
The Sikh Family Initiative Team`; const paymentHtml = `<p>Dear ${payload.contact_name},</p><p>Thank you for your Family Fun Day - Summer Extravaganza booking request for 31 August 2026.</p><p>Please complete payment of <strong>£${total}</strong> using the secure NowDonate checkout:</p><p><a href="${paymentUrl}" style="display:inline-block;padding:12px 20px;background:#166534;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600">Complete payment securely</a></p><p>The Sikh Family Initiative team will review your details and contact you to confirm the booking.</p><p>Warm regards,<br>The Sikh Family Initiative Team</p>`; await resend.emails.send({ from: "Sikh Family Initiative <noreply@devanhaar.com>", to: payload.email, subject: "Complete your Family Fun Day booking payment", text: paymentText, html: paymentHtml }) } catch (emailError) { console.warn("[family-initiative-bookings] Email failed:", emailError) } }
    return NextResponse.json({ success: true, id: data.id, total, payment_url: paymentUrl })
  } catch (error) { console.error("[family-initiative-bookings] Unexpected error:", error); return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 }) }
}

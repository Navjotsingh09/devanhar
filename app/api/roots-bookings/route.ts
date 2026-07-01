import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function escHtml(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const required = [
      "camper_first_name", "camper_last_name", "camper_dob",
      "parent_first_name", "parent_last_name", "parent_relationship",
      "parent_email", "parent_phone",
      "emergency_name", "emergency_relationship", "emergency_phone",
      "how_did_you_hear",
    ]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.parent_email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("roots_bookings")
      .insert({
        camper_first_name: body.camper_first_name,
        camper_last_name: body.camper_last_name,
        camper_dob: body.camper_dob,
        camper_gender: body.camper_gender || null,
        parent_first_name: body.parent_first_name,
        parent_last_name: body.parent_last_name,
        parent_relationship: body.parent_relationship,
        parent_email: body.parent_email,
        parent_phone: body.parent_phone,
        accommodation_preference: body.accommodation_preference || null,
        dietary_requirements: body.dietary_requirements || null,
        medical_info: body.medical_info || null,
        emergency_name: body.emergency_name,
        emergency_relationship: body.emergency_relationship,
        emergency_phone: body.emergency_phone,
        how_did_you_hear: body.how_did_you_hear || null,
        additional_info: body.additional_info || null,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      console.error("[roots-bookings] Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to save booking. Please try again." }, { status: 500 })
    }

    // Send emails (best-effort — don't fail the request if email fails)
    try {
      await sendEmails({
        bookingId: data.id,
        camperFirst: body.camper_first_name,
        camperLast: body.camper_last_name,
        camperDob: body.camper_dob,
        parentFirst: body.parent_first_name,
        parentLast: body.parent_last_name,
        parentEmail: body.parent_email,
        parentPhone: body.parent_phone,
        parentRelationship: body.parent_relationship,
        accommodation: body.accommodation_preference,
        dietary: body.dietary_requirements,
        medical: body.medical_info,
        emergencyName: body.emergency_name,
        emergencyPhone: body.emergency_phone,
        howHeard: body.how_did_you_hear,
        additional: body.additional_info,
      })
    } catch (emailErr) {
      console.error("[roots-bookings] Email error (non-fatal):", emailErr)
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error("[roots-bookings] Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}

async function sendEmails(p: {
  bookingId: string
  camperFirst: string; camperLast: string; camperDob: string
  parentFirst: string; parentLast: string; parentEmail: string
  parentPhone: string; parentRelationship: string
  accommodation: string | null; dietary: string | null; medical: string | null
  emergencyName: string; emergencyPhone: string
  howHeard: string | null; additional: string | null
}) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)

  const FROM = "Roots Residential <noreply@devanhaar.com>"
  const TEAM = "Roots@Devanhaar.com"
  const dashUrl = `https://devanhaar.com/dashboard/roots`

  const camperName = `${escHtml(p.camperFirst)} ${escHtml(p.camperLast)}`
  const parentName = `${escHtml(p.parentFirst)} ${escHtml(p.parentLast)}`

  const sig = `<p style="margin-top:24px;font-style:italic;">Adventure. Friendship. Identity.</p><p>Kind regards,<br/><strong>The Roots Team</strong></p>`

  // Email to parent/guardian
  const parentHtml = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><p>Hi,</p><p>Thank you for submitting your application for <strong>Roots</strong>.</p><p>We&rsquo;re excited that you&rsquo;re interested in joining us for an unforgettable residential adventure.</p><p>Your application has been received successfully and is now being reviewed by the Roots team.</p><p>Over the coming days, we will review your submission and be in touch to confirm the next steps, including availability, booking details and payment information.</p><p>If we require any additional information, a member of our team will contact you directly.</p><p>Thank you once again for your interest in Roots. We look forward to speaking with you soon.</p>${sig}</div>`

  const parentText = `Hi,

Thank you for submitting your application for Roots.

We're excited that you're interested in joining us for an unforgettable residential adventure.

Your application has been received successfully and is now being reviewed by the Roots team.

Over the coming days, we will review your submission and be in touch to confirm the next steps, including availability, booking details and payment information.

If we require any additional information, a member of our team will contact you directly.

Thank you once again for your interest in Roots. We look forward to speaking with you soon.

Adventure. Friendship. Identity.

Kind regards,
The Roots Team`

  // Team notification
  const rows = [
    ["Booking ID", p.bookingId],
    ["Camper", `${p.camperFirst} ${p.camperLast}`],
    ["Date of birth", p.camperDob],
    ["Parent/guardian", `${p.parentFirst} ${p.parentLast} (${p.parentRelationship})`],
    ["Parent email", p.parentEmail],
    ["Parent phone", p.parentPhone],
    ["Accommodation pref", p.accommodation || "None"],
    ["Dietary", p.dietary || "None"],
    ["Medical", p.medical || "None"],
    ["Emergency contact", `${p.emergencyName} — ${p.emergencyPhone}`],
    ["How heard", p.howHeard || "Not specified"],
    ["Additional info", p.additional || "None"],
  ]
  const tableRows = rows.map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;white-space:nowrap">${escHtml(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escHtml(v ?? "")}</td></tr>`).join("")
  const teamHtml = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;"><h2 style="margin:0 0 16px;">New Roots booking submission</h2><table style="border-collapse:collapse;width:100%;font-size:14px">${tableRows}</table><p style="margin-top:20px;"><a href="${dashUrl}" style="display:inline-block;background:#8a6200;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">View in dashboard</a></p></div>`

  const teamText = `New Roots booking submission\n\nCamper: ${p.camperFirst} ${p.camperLast}\nDOB: ${p.camperDob}\nParent: ${p.parentFirst} ${p.parentLast} (${p.parentRelationship})\nEmail: ${p.parentEmail}\nPhone: ${p.parentPhone}\nAccommodation: ${p.accommodation || "None"}\nDietary: ${p.dietary || "None"}\nMedical: ${p.medical || "None"}\nEmergency: ${p.emergencyName} - ${p.emergencyPhone}\nHow heard: ${p.howHeard || "Not specified"}\nAdditional: ${p.additional || "None"}\n\nView in dashboard: ${dashUrl}`

  await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: p.parentEmail,
      subject: "Thank You for Applying to Roots\!",
      html: parentHtml,
      text: parentText,
    }),
    resend.emails.send({
      from: FROM,
      to: TEAM,
      subject: `New Roots booking: ${p.camperFirst} ${p.camperLast}`,
      html: teamHtml,
      text: teamText,
    }),
  ])
}

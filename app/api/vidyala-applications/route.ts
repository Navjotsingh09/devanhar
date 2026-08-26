import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendVidyalaConfirmationEmail, sendVidyalaInternalNotification } from "@/lib/vidyala-emails"

const APPLICATION_DEADLINE = new Date('2026-08-01T00:00:00Z')

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role credentials')
  return createClient(url, key)
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    // Hard close after 31 July 2026
    if (new Date() >= APPLICATION_DEADLINE) {
      return NextResponse.json(
        { error: 'Applications for Sikhi Vidyala are now closed. Thank you for your interest.' },
        { status: 410 }
      )
    }

    const body = await req.json()

    const required = [
      "first_name", "last_name", "date_of_birth", "email", "phone", "address",
      "emergency_contact_1_name", "emergency_contact_1_relationship", "emergency_contact_1_phone",
    ]
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    if (!EMAIL_REGEX.test(String(body.email).trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Look up initiative ID for sikhi-vidyala
    const { data: initiative } = await supabase
      .from("initiatives")
      .select("id")
      .eq("slug", "sikhi-vidyala")
      .single()

    // Check for duplicate email
    const { data: existing } = await supabase
      .from("vidyala_applications")
      .select("id")
      .eq("email", String(body.email).trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "An application with this email address already exists." },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from("vidyala_applications")
      .insert({
        initiative_id: initiative?.id ?? null,
        first_name: String(body.first_name).trim(),
        middle_name: body.middle_name ? String(body.middle_name).trim() : null,
        last_name: String(body.last_name).trim(),
        date_of_birth: String(body.date_of_birth).trim(),
        email: String(body.email).trim().toLowerCase(),
        phone: String(body.phone).trim(),
        address: String(body.address).trim(),
        id_document_url: body.id_document_url ?? null,
        has_dbs_check: body.has_dbs_check ?? false,
        dbs_certificate_url: body.dbs_certificate_url ?? null,
        emergency_contact_1_name: String(body.emergency_contact_1_name).trim(),
        emergency_contact_1_relationship: String(body.emergency_contact_1_relationship).trim(),
        emergency_contact_1_phone: String(body.emergency_contact_1_phone).trim(),
        emergency_contact_2_name: body.emergency_contact_2_name ? String(body.emergency_contact_2_name).trim() : null,
        emergency_contact_2_relationship: body.emergency_contact_2_relationship ? String(body.emergency_contact_2_relationship).trim() : null,
        emergency_contact_2_phone: body.emergency_contact_2_phone ? String(body.emergency_contact_2_phone).trim() : null,
        is_amritdhari: body.is_amritdhari ?? null,
        sikhi_journey: body.sikhi_journey ?? null,
        english_ability: body.english_ability ?? null,
        panjabi_ability: body.panjabi_ability ?? null,
        can_commit: body.can_commit ?? null,
        funding_option: body.funding_option ?? null,
        accommodation_option: body.accommodation_option ?? null,
        requires_visa: body.requires_visa ?? false,
        requires_visa_support: body.requires_visa_support ?? false,
        motivation: body.motivation ?? null,
        current_seva: body.current_seva ?? null,
        what_to_learn: body.what_to_learn ?? null,
        continue_parchaar: body.continue_parchaar ?? null,
        how_heard: body.how_heard ?? null,
        page_url: body.page_url ?? null,
        source: body.source ?? null,
        medium: body.medium ?? null,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      console.error("[vidyala-applications] insert error:", error)
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    // Log to activity_log
    try {
      await supabase.from("activity_log").insert({
        entity_type: "vidyala_application",
        entity_id: String(data.id),
        action: `New Vidyala application from ${String(body.first_name).trim()} ${String(body.last_name).trim()} <${String(body.email).trim()}>`,
      })
    } catch {}

    // Fire emails - await both before returning
    const firstName = String(body.first_name).trim()
    const email = String(body.email).trim().toLowerCase()
    await Promise.allSettled([
      sendVidyalaConfirmationEmail({ to: email, firstName }),
      sendVidyalaInternalNotification({ applicationId: data.id, data: body }),
    ])

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error("[vidyala-applications] unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

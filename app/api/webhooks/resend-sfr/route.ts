import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const deliveryStatuses: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.failed": "failed",
  "email.complained": "complained",
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret || !url || !key) return new NextResponse("Not configured", { status: 503 })
  let event: { type: string; data?: { email_id?: string; bounce?: { message?: string } } }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "re_not_configured")
    event = resend.webhooks.verify({
      payload: await request.text(),
      headers: {
        "svix-id": request.headers.get("svix-id") || "",
        "svix-timestamp": request.headers.get("svix-timestamp") || "",
        "svix-signature": request.headers.get("svix-signature") || "",
      },
      secret,
    }) as typeof event
  } catch {
    return new NextResponse("Invalid signature", { status: 400 })
  }
  const status = deliveryStatuses[event.type]
  const emailId = event.data?.email_id
  if (!status || !emailId) return new NextResponse("OK")
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await supabase.from("activity_log")
    .select("entity_id, metadata")
    .eq("action", "family_retreat_payment_request_email_accepted")
    .eq("entity_type", "family_retreat_booking")
    .contains("metadata", { email_id: emailId })
    .limit(1).maybeSingle()
  if (error) return new NextResponse("Database temporarily unavailable", { status: 503 })
  if (!data) return new NextResponse("OK") // Other Devanhaar emails are unaffected.
  const eventId = request.headers.get("svix-id") || ""
  if (!eventId) return new NextResponse("Missing event ID", { status: 400 })
  const { data: existing, error: duplicateError } = await supabase.from("activity_log")
    .select("id")
    .eq("action", "family_retreat_payment_email_delivery")
    .eq("entity_type", "family_retreat_booking")
    .eq("entity_id", data.entity_id)
    .contains("metadata", { event_id: eventId }).limit(1)
  if (duplicateError) return new NextResponse("Database temporarily unavailable", { status: 503 })
  if (existing?.length) return new NextResponse("OK")
  const accepted = data.metadata as Record<string, unknown> | null
  const { error: insertError } = await supabase.from("activity_log").insert({
    action: "family_retreat_payment_email_delivery",
    entity_type: "family_retreat_booking",
    entity_id: data.entity_id,
    metadata: {
      attempt_id: accepted?.attempt_id,
      provider_email_id: emailId,
      status,
      event_id: eventId,
      reason: event.data?.bounce?.message || null,
    },
  })
  if (insertError) return new NextResponse("Could not store event", { status: 503 })
  return new NextResponse("OK")
}

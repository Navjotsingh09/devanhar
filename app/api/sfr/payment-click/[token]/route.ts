import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  if (!/^[0-9a-f-]{36}[0-9a-f]{32}$/.test(token) || !BASE_URL || !SERVICE_KEY) {
    return new NextResponse("Link unavailable", { status: 404, headers: { "Cache-Control": "no-store" } })
  }
  const supabase = createClient(BASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  const { data, error } = await supabase.from("activity_log")
    .select("entity_id, metadata")
    .eq("action", "family_retreat_payment_email_attempt")
    .eq("entity_type", "family_retreat_booking")
    .contains("metadata", { click_token: token })
    .limit(1).maybeSingle()
  const metadata = data?.metadata as Record<string, unknown> | null
  const destination = metadata?.payment_url
  if (error || !data || typeof destination !== "string") {
    return new NextResponse("Link unavailable", { status: 404, headers: { "Cache-Control": "no-store" } })
  }
  let url: URL
  try { url = new URL(destination) } catch {
    return new NextResponse("Link unavailable", { status: 404 })
  }
  if (url.protocol !== "https:" || !["nowdonate.com", "www.nowdonate.com"].includes(url.hostname)) {
    return new NextResponse("Link unavailable", { status: 404 })
  }
  // Count observed visits; email link scanners may also visit the URL.
  const { error: logError } = await supabase.from("activity_log").insert({
    action: "family_retreat_payment_email_click",
    entity_type: "family_retreat_booking",
    entity_id: data.entity_id,
    metadata: { attempt_id: metadata.attempt_id, source: "tracked_payment_link" },
  })
  if (logError) console.error("[sfr-email] unable to log click")
  return NextResponse.redirect(url.toString(), { status: 302, headers: {
    "Cache-Control": "private, no-store, max-age=0",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
  } })
}

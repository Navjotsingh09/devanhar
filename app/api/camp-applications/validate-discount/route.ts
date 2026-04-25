import { NextRequest, NextResponse } from "next/server"
import { lookupPromoCode } from "@/lib/camp-discounts"

export const dynamic = "force-dynamic"

// Simple in-memory rate limit per IP to deter code-guessing
const ipHits = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const cur = ipHits.get(ip)
  if (!cur || cur.reset < now) {
    ipHits.set(ip, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  cur.count += 1
  if (cur.count > MAX_PER_WINDOW) return false
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    if (!rateLimit(ip)) {
      return NextResponse.json({ valid: false, error: "too_many_attempts" }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const code = typeof body?.code === "string" ? body.code : ""
    if (!code.trim()) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    const percent = lookupPromoCode(code)
    if (percent <= 0) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }
    return NextResponse.json({ valid: true, code: code.trim().toUpperCase(), percent })
  } catch (err) {
    console.error("[validate-discount] Error:", err)
    return NextResponse.json({ valid: false, error: "server_error" }, { status: 500 })
  }
}

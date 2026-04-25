import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ALLOWED_CAMPS = new Set(["singhs-camp-eu", "kaurs-camp-eu"])

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { camp, name, email, country, notes } = body as {
      camp?: string
      name?: string
      email?: string
      country?: string
      notes?: string
    }

    if (!camp || !ALLOWED_CAMPS.has(camp)) {
      return NextResponse.json({ error: "Invalid camp." }, { status: 400 })
    }
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      )
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server is not configured." },
        { status: 500 }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { error } = await supabase.from("register_interest").insert({
      camp,
      name: name.trim(),
      email: email.trim(),
      country: country?.trim() || null,
      notes: notes?.trim() || null,
    })

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true })
      }
      console.error("register-interest insert failed", error)
      return NextResponse.json(
        { error: "Could not save your details. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("register-interest error", err)
    return NextResponse.json({ error: "Bad request." }, { status: 400 })
  }
}

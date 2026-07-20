import { NextRequest, NextResponse } from "next/server"
import { sendWebinarRegistrationNotification } from "@/lib/vidyala-emails"
import { createClient } from "@supabase/supabase-js"

const ALLOWED_CAMPS = new Set(["singhs-camp-eu", "kaurs-camp-eu", "vidyala-webinar", "vidyala-interest"])

const VIDYALA_SCHEDULE_OPTIONS = new Set([
  "Monday \u2013 Evening",
  "Tuesday \u2013 Evening",
  "Wednesday \u2013 Evening",
  "Thursday \u2013 Evening",
  "Friday \u2013 Evening",
  "Saturday \u2013 Daytime",
  "Sunday \u2013 Daytime",
])

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { camp, name, email, country, notes, dob, occupation, schedule } = body as {
      camp?: string
      name?: string
      email?: string
      country?: string
      notes?: string
      dob?: string
      occupation?: string
      schedule?: string[]
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

    let cleanDob: string | null = null
    let cleanOccupation: string | null = null
    let cleanSchedule: string[] | null = null
    if (camp === "vidyala-interest") {
      if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(Date.parse(dob))) {
        return NextResponse.json({ error: "A valid date of birth is required." }, { status: 400 })
      }
      if (!occupation?.trim()) {
        return NextResponse.json({ error: "Occupation is required." }, { status: 400 })
      }
      const selected = Array.isArray(schedule)
        ? schedule.filter((s) => VIDYALA_SCHEDULE_OPTIONS.has(s))
        : []
      if (selected.length === 0) {
        return NextResponse.json(
          { error: "Please select at least one schedule option." },
          { status: 400 }
        )
      }
      cleanDob = dob
      cleanOccupation = occupation.trim().slice(0, 200)
      cleanSchedule = selected
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
      dob: cleanDob,
      occupation: cleanOccupation,
      schedule: cleanSchedule,
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

    if (camp === "vidyala-webinar") {
      await sendWebinarRegistrationNotification({
        name: name.trim(),
        email: email.trim(),
        country: country?.trim() || null,
        notes: notes?.trim() || null,
      }).catch(() => {})
    }

    if (camp === "vidyala-interest") {
      await sendWebinarRegistrationNotification({
        name: name.trim(),
        email: email.trim(),
        country: null,
        notes: [
          "Vidyala interest registration",
          `DOB: ${cleanDob}`,
          `Occupation: ${cleanOccupation}`,
          `Schedule: ${cleanSchedule?.join(", ")}`,
          notes?.trim() ? `Notes: ${notes.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("register-interest error", err)
    return NextResponse.json({ error: "Bad request." }, { status: 400 })
  }
}

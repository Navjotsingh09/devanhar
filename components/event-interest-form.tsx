"use client"

import { useState } from "react"
import { Loader2, Check } from "lucide-react"

interface EventInterestFormProps {
  eventTitle: string
  slug: string
}

export function EventInterestForm({ eventTitle, slug }: EventInterestFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const form = e.currentTarget
    const fd = new FormData(form)
    const name = fd.get("name") as string
    const email = fd.get("email") as string
    const age = fd.get("age") as string
    const phone = fd.get("phone") as string

    // Collect all extra fields
    const formFields: Record<string, string> = { Age: age, Phone: phone }
    const allEntries = Array.from(fd.entries())
    for (const [key, value] of allEntries) {
      if (!["name", "email", "age", "phone", "event"].includes(key)) {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        formFields[label] = value === "on" ? "Yes" : String(value)
      }
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: `Event Interest — ${eventTitle}`,
          source_page: `Events — ${eventTitle}`,
          form_fields: formFields,
        }),
      })

      if (!res.ok) throw new Error("Failed to send")

      setStatus("success")
      form.reset()
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err) {
      console.error("Event form error:", err)
      setErrorMsg("Something went wrong. Please try again.")
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Interest Submitted!</h3>
        <p className="text-sm text-muted-foreground">Thank you for your interest in {eventTitle}. We will be in touch soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
      <input aria-label="Event" name="event" defaultValue={eventTitle} className="hidden" />

      {status === "error" && (
        <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{errorMsg}</div>
      )}

      <input name="name" aria-label="Full name" placeholder="Name" required className="rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
      <input name="age" aria-label="Age" inputMode="numeric" pattern="[0-9]*" placeholder="Age" required className="rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
      <input name="phone" aria-label="Phone number" type="tel" placeholder="Phone No" required className="rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
      <input name="email" type="email" aria-label="Email address" placeholder="Email" required className="rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />

      {slug === "horse-riding" && (
        <div className="md:col-span-2 rounded-xl border border-border p-4">
          <input name="times_available" placeholder="Times available (morning/evening)" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
          <input name="cadence" placeholder="Weekly/Monthly" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
        </div>
      )}

      {slug === "shooting" && (
        <div className="md:col-span-2 rounded-xl border border-border p-4">
          <input name="weekly_commitment" placeholder="Weekly commitment" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
        </div>
      )}

      {slug === "yorkshire-3-peaks" && (
        <div className="md:col-span-2 rounded-xl border border-border p-4">
          <label className="flex items-center gap-3 text-sm min-h-[44px] py-1"><input type="checkbox" className="h-5 w-5 accent-primary" name="terms" required /> Agree to T&Cs *</label>
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-primary" name="fee_20" required /> GBP 20 per person, coach included *</label>
          <input name="hiked_before" placeholder="Hiked before?" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
          <input name="hiking_level" placeholder="What level?" className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-base md:text-sm" />
        </div>
      )}

      <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" required name="terms_global" /> Agree to T&Cs *</label>

      <button type="submit" disabled={status === "loading"} className="md:col-span-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span>
        ) : (
          "Submit Interest"
        )}
      </button>
    </form>
  )
}

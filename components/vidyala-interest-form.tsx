"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SCHEDULE_OPTIONS = [
  "Monday \u2013 Evening",
  "Tuesday \u2013 Evening",
  "Wednesday \u2013 Evening",
  "Thursday \u2013 Evening",
  "Friday \u2013 Evening",
  "Saturday \u2013 Daytime",
  "Sunday \u2013 Daytime",
]

type Status = "idle" | "submitting" | "success" | "error" | "duplicate"

export function VidyalaInterestForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [email, setEmail] = useState("")
  const [occupation, setOccupation] = useState("")
  const [schedule, setSchedule] = useState<string[]>([])

  const toggleSlot = (slot: string) =>
    setSchedule((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    )

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (schedule.length === 0) {
      setError("Please select at least one schedule option.")
      return
    }
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camp: "vidyala-interest",
          name,
          dob,
          email,
          occupation,
          schedule,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setError(data?.error || "Something went wrong. Please try again.")
        return
      }
      setStatus(data?.duplicate ? "duplicate" : "success")
    } catch {
      setStatus("error")
      setError("Network error. Please try again.")
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <div className="rounded-2xl border border-border bg-secondary/30 p-8 text-center">
        <h3 className="text-2xl font-semibold text-foreground mb-3">Thank you</h3>
        <p className="text-muted-foreground">
          {status === "duplicate"
            ? "You have already registered your interest \u2014 we will be in touch soon."
            : "Your interest has been registered. We will be in touch soon."}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-background p-7 md:p-8 space-y-5"
    >
      <div>
        <h3 className="text-2xl font-semibold text-foreground">
          Register your interest for Vidyala
        </h3>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Tell us a little about yourself and which schedule would suit you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vi-name">Name</Label>
          <Input
            id="vi-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vi-dob">Date of birth</Label>
          <Input
            id="vi-dob"
            type="date"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vi-email">Email</Label>
          <Input
            id="vi-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vi-occupation">Occupation</Label>
          <Input
            id="vi-occupation"
            required
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Student, Engineer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Which Vidyala schedule would suit you? (Select all that apply)</Label>
        <div className="flex flex-col gap-2 mt-1">
          {SCHEDULE_OPTIONS.map((slot) => (
            <label key={slot} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={schedule.includes(slot)}
                onChange={() => toggleSlot(slot)}
                className="accent-[#F5A623]"
              />
              <span className="text-sm text-foreground">{slot}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full font-semibold"
        style={{ backgroundColor: "#F5A623", color: "#1E3461" }}
      >
        {status === "submitting" ? "Submitting..." : "Register Interest"}
      </Button>
    </form>
  )
}

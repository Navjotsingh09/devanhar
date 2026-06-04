"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RegisterInterestFormProps {
  camp: "singhs-camp-eu" | "kaurs-camp-eu" | "vidyala-webinar"
  heading?: string
  description?: string
  successMessage?: string
  duplicateMessage?: string
  showCountry?: boolean
  notesLabel?: string
}

type Status = "idle" | "submitting" | "success" | "error" | "duplicate"

export function RegisterInterestForm({
  camp,
  heading = "Register your interest",
  description = "Drop your details below and we will let you know as soon as applications open.",
  successMessage = "You are on the list. We will be in touch as soon as applications open.",
  duplicateMessage = "You are already on the list — we will be in touch as soon as applications open.",
  showCountry = true,
  notesLabel = "Anything you would like us to know? (optional)",
}: RegisterInterestFormProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("")
  const [notes, setNotes] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camp, name, email, country, notes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setError(data?.error || "Something went wrong. Please try again.")
        return
      }
      setStatus(data?.duplicate ? "duplicate" : "success")
      setName("")
      setEmail("")
      setCountry("")
      setNotes("")
    } catch {
      setStatus("error")
      setError("Network error. Please try again.")
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <div className="rounded-2xl border border-border bg-secondary/30 p-8 text-center">
        <h3 className="text-2xl font-semibold text-foreground mb-3">
          Thank you
        </h3>
        <p className="text-muted-foreground">
          {status === "duplicate" ? duplicateMessage : successMessage}
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
        <h3 className="text-2xl font-semibold text-foreground">{heading}</h3>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ri-name">Name</Label>
          <Input
            id="ri-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ri-email">Email</Label>
          <Input
            id="ri-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      {showCountry && (
        <div className="space-y-2">
          <Label htmlFor="ri-country">Country (optional)</Label>
          <Input
            id="ri-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Where will you be travelling from?"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ri-notes">{notesLabel}</Label>
        <Textarea
          id="ri-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full px-7"
        >
          {status === "submitting" ? "Sending..." : "Register interest"}
        </Button>
      </div>
    </form>
  )
}

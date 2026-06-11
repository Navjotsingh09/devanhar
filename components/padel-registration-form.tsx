"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2, X } from "lucide-react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[a-zA-Z\s'\-]{2,50}$/
const PHONE_REGEX = /^[\d\s\+\-()]{7,20}$/

interface PadelRegistrationFormProps {
  initiativeSlug?: string
  onClose: () => void
}

export function PadelRegistrationForm({
  initiativeSlug = "sikh-padel-association",
  onClose,
}: PadelRegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successTitle, setSuccessTitle] = useState("Team registered")
  const [successMessage, setSuccessMessage] = useState(
    "Your team has been registered successfully."
  )
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    team_name: "",
    skill_level: "",
    captain_first_name: "",
    captain_last_name: "",
    captain_email: "",
    captain_phone: "",
    player2_first_name: "",
    player2_last_name: "",
    player2_email: "",
    player2_phone: "",
    consent_email: "yes",
    consent_phone: "yes",
    consent_sms: "yes",
    consent_whatsapp: "yes",
    gift_aid: "",
    page_url: "",
    source: "",
    medium: "",
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    setForm((prev) => ({
      ...prev,
      page_url: window.location.href.slice(0, 2048),
      source: params.get("utm_source") || params.get("source") || "",
      medium: params.get("utm_medium") || params.get("medium") || "",
    }))
  }, [])

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleConsent = (field: string) =>
    setForm((prev) => ({ ...prev, [field]: prev[field as keyof typeof prev] === "yes" ? "no" : "yes" }))

  const isValid = () => {
    if (form.team_name.trim().length < 2) return false
    if (!NAME_REGEX.test(form.captain_first_name.trim())) return false
    if (!NAME_REGEX.test(form.captain_last_name.trim())) return false
    if (!EMAIL_REGEX.test(form.captain_email.trim())) return false
    if (!PHONE_REGEX.test(form.captain_phone.trim())) return false
    if (!NAME_REGEX.test(form.player2_first_name.trim())) return false
    if (!NAME_REGEX.test(form.player2_last_name.trim())) return false
    if (form.player2_email.trim() && !EMAIL_REGEX.test(form.player2_email.trim())) return false
    return true
  }

  const handleSubmit = async () => {
    setError("")
    if (!isValid()) {
      setError("Please complete all required fields with valid details before submitting.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/padel-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, initiative_slug: initiativeSlug }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.")
      } else {
        if (data.checkout_url) {
          window.location.href = data.checkout_url
          return
        }
        setSuccessTitle(data.title || "Team registered")
        setSuccessMessage(
          data.message || "Your team has been registered successfully."
        )
        setSubmitted(true)
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[hsl(43,100%,29%)] mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{successTitle}</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{successMessage}</p>
          <div className="mt-8">
            <Button variant="secondary" className="rounded-full px-6" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-3">
              Team registration
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Register your team</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Padel is played in pairs — register both players below. The team entry fee is
              authorised securely and only taken once your place is confirmed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration form"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Team */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Team</h3>
            <div>
              <Label htmlFor="team_name">Team name *</Label>
              <Input id="team_name" value={form.team_name} onChange={(e) => update("team_name", e.target.value)} placeholder="e.g. Court Kings" />
            </div>
            <div>
              <Label htmlFor="skill_level">Skill level (optional)</Label>
              <Select value={form.skill_level} onValueChange={(v) => update("skill_level", v)}>
                <SelectTrigger id="skill_level">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Captain */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Captain (Player 1) — main contact</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="captain_first_name">First name *</Label>
                <Input id="captain_first_name" value={form.captain_first_name} onChange={(e) => update("captain_first_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="captain_last_name">Last name *</Label>
                <Input id="captain_last_name" value={form.captain_last_name} onChange={(e) => update("captain_last_name", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="captain_email">Email *</Label>
                <Input id="captain_email" type="email" value={form.captain_email} onChange={(e) => update("captain_email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="captain_phone">Phone *</Label>
                <Input id="captain_phone" type="tel" value={form.captain_phone} onChange={(e) => update("captain_phone", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Player 2</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_first_name">First name *</Label>
                <Input id="player2_first_name" value={form.player2_first_name} onChange={(e) => update("player2_first_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="player2_last_name">Last name *</Label>
                <Input id="player2_last_name" value={form.player2_last_name} onChange={(e) => update("player2_last_name", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_email">Email (optional)</Label>
                <Input id="player2_email" type="email" value={form.player2_email} onChange={(e) => update("player2_email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="player2_phone">Phone (optional)</Label>
                <Input id="player2_phone" type="tel" value={form.player2_phone} onChange={(e) => update("player2_phone", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact preferences</h3>
            <p className="text-sm text-muted-foreground">
              We will use these to send your team event details and updates. Untick any you do not want.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "consent_email", label: "Email" },
                { key: "consent_phone", label: "Phone call" },
                { key: "consent_sms", label: "SMS" },
                { key: "consent_whatsapp", label: "WhatsApp" },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form[c.key as keyof typeof form] === "yes"}
                    onChange={() => toggleConsent(c.key)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <label className="flex items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.gift_aid === "yes"}
                onChange={() => update("gift_aid", form.gift_aid === "yes" ? "no" : "yes")}
                className="mt-1 h-4 w-4 rounded border-border"
              />
              <span>
                Gift Aid — I am a UK taxpayer and want Devanhaar to claim Gift Aid on my entry fee.
              </span>
            </label>
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}

          <div className="flex items-center gap-4 pt-2">
            <Button onClick={handleSubmit} disabled={submitting || !isValid()} className="rounded-full px-6">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                "Register & pay entry fee"
              )}
            </Button>
            <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

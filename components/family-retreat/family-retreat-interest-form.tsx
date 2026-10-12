"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s+()\-]{7,20}$/
const NAME_REGEX = /^[\p{L}\p{M}\s'.\-]{1,60}$/u

export function FamilyRetreatInterestForm({
  interestFor = "Spring and Summer 2027",
  sourcePage = "Sikh Family Retreat",
  successMessage = "Thank you. The Sikh Family Initiative team has received your details and can contact you as information for the 2027 retreats is released.",
}: {
  interestFor?: string
  sourcePage?: string
  successMessage?: string
}) {
  const [form, setForm] = useState({ first_name: "", surname: "", email: "", phone: "", group_size: "1" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const update = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async () => {
    setError("")
    if (!NAME_REGEX.test(form.first_name.trim())) return setError("Please enter the lead contact's first name.")
    if (!NAME_REGEX.test(form.surname.trim())) return setError("Please enter the lead contact's surname.")
    if (!EMAIL_REGEX.test(form.email.trim())) return setError("Please enter a valid email address.")
    if (!PHONE_REGEX.test(form.phone.trim())) return setError("Please enter a valid phone number.")
    const groupSize = Number(form.group_size)
    if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 50) return setError("Please enter the number of people attending in your group.")

    setSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.first_name.trim()} ${form.surname.trim()}`,
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: `Sikh Family Retreat - ${interestFor} - Register interest`,
          message: `New Sikh Family Retreat register-interest submission for ${interestFor}.`,
          source_page: sourcePage,
          save_submission: true,
          form_fields: {
            project: "Sikh Family Retreat",
            interest_for: interestFor,
            first_name: form.first_name.trim(),
            surname: form.surname.trim(),
            lead_email: form.email.trim(),
            lead_phone: form.phone.trim(),
            number_of_people_in_group: String(groupSize),
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not submit your interest.")
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your interest.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-2xl font-bold text-foreground">Interest registered</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {successMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="retreat_first_name">First name *</Label><Input id="retreat_first_name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} /></div>
        <div><Label htmlFor="retreat_surname">Surname *</Label><Input id="retreat_surname" value={form.surname} onChange={(e) => update("surname", e.target.value)} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="retreat_email">Lead email *</Label><Input id="retreat_email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
        <div><Label htmlFor="retreat_phone">Lead phone number *</Label><Input id="retreat_phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
      </div>
      <div>
        <Label htmlFor="retreat_group_size">Number of people attending in group *</Label>
        <Input id="retreat_group_size" type="number" min="1" max="50" value={form.group_size} onChange={(e) => update("group_size", e.target.value)} className="max-w-[220px]" />
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <Button type="button" onClick={() => void submit()} disabled={submitting} className="rounded-full bg-[hsl(43,100%,29%)] px-7 text-white hover:bg-[hsl(43,100%,25%)]">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Register interest"}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">This registers interest only. It does not confirm a place or take payment.</p>
    </div>
  )
}

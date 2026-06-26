"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[\p{L}\p{M}\s'.\-]{1,60}$/u
const PHONE_REGEX = /^[\d\s\+\-()]{7,20}$/

interface ChildEntry {
  first_name: string
  last_name: string
  date_of_birth: string
}

const emptyChild = (): ChildEntry => ({ first_name: "", last_name: "", date_of_birth: "" })

const ACCOMMODATION_OPTIONS = [
  { value: "standard", label: "Standard accommodation" },
  { value: "ensuite", label: "Ensuite accommodation (if available)" },
  { value: "deluxe-pod", label: "Deluxe POD accommodation (if available)" },
  { value: "no_preference", label: "No preference" },
]

const HEARD_OPTIONS = [
  "Word of mouth / friend or family",
  "Instagram",
  "Facebook",
  "WhatsApp message",
  "Email",
  "Singhs Camp / Kaurs Camp",
  "Kids Camps",
  "Devanhaar website",
  "Other",
]

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "bg-[hsl(43,100%,29%)] border-[hsl(43,100%,29%)]" : "border-border bg-background"
      }`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

export function FamilyRetreatBookingForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const successRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const [error, setError] = useState("")
  const [children, setChildren] = useState<ChildEntry[]>([emptyChild()])
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    city: "", postcode: "", country: "",
    accommodation_preference: "",
    dietary_requirements: "", medical_requirements: "",
    emergency_contact_name: "", emergency_contact_relationship: "", emergency_contact_phone: "",
    heard_about_retreat: "", additional_notes: "",
    consent_email: "no" as "yes" | "no",
    consent_whatsapp: "no" as "yes" | "no",
    consent_privacy: false,
    page_url: "", source: "", medium: "",
  })

  useEffect(() => {
    if (submitted && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [submitted])

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

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const updateChild = (index: number, field: keyof ChildEntry, value: string) =>
    setChildren((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))

  const addChild = () => { if (children.length < 10) setChildren((prev) => [...prev, emptyChild()]) }
  const removeChild = (index: number) => { if (children.length > 1) setChildren((prev) => prev.filter((_, i) => i !== index)) }

  const getValidationError = (): string | null => {
    if (!NAME_REGEX.test(form.first_name.trim())) return "Please enter your first name."
    if (!NAME_REGEX.test(form.last_name.trim())) return "Please enter your last name."
    if (!EMAIL_REGEX.test(form.email.trim())) return "Please enter a valid email address."
    if (!PHONE_REGEX.test(form.phone.trim())) return "Please enter a valid phone number (e.g. 07700 900123)."
    if (form.city.trim().length < 2) return "Please enter your city or town."
    if (form.postcode.trim().length < 2) return "Please enter your postcode."
    if (form.country.trim().length < 2) return "Please enter your country."
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (!NAME_REGEX.test(child.first_name.trim())) return `Please enter a first name for child ${i + 1}.`
      if (!NAME_REGEX.test(child.last_name.trim())) return `Please enter a last name for child ${i + 1}.`
      if (!child.date_of_birth) return `Please enter the date of birth for child ${i + 1}.`
    }
    if (!NAME_REGEX.test(form.emergency_contact_name.trim())) return "Please enter the emergency contact's full name."
    if (form.emergency_contact_relationship.trim().length < 2) return "Please enter the emergency contact's relationship to you."
    if (!PHONE_REGEX.test(form.emergency_contact_phone.trim())) return "Please enter a valid emergency contact phone number."
    if (!form.heard_about_retreat) return "Please tell us how you heard about the Sikh Family Retreat."
    if (!form.consent_privacy) return "Please tick the box to agree to the Privacy Policy before submitting."
    return null
  }

  const handleSubmit = async () => {
    setError("")
    const validationError = getValidationError()
    if (validationError) {
      setError(validationError)
      if (typeof window !== "undefined") {
        requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }))
      }
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/family-retreat-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, children }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Something went wrong. Please try again."); return }
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again or contact the team directly.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} className="py-12 text-center scroll-mt-24">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[hsl(43,100%,29%)] mb-6" />
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Booking request received</h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Thank you. Your family booking request has been submitted. A sevadaar will review your details and contact you directly to discuss availability, costs and next steps.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* About you */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">About you</h3>
        <p className="text-sm text-muted-foreground">Please provide the details of the main adult contact for the booking. This person will receive all follow-up communication from the retreat team.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="first_name">First name *</Label><Input id="first_name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} /></div>
          <div><Label htmlFor="last_name">Last name *</Label><Input id="last_name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="email">Email address *</Label><Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
          <div><Label htmlFor="phone">Phone / WhatsApp *</Label><Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label htmlFor="city">City / Town *</Label><Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
          <div><Label htmlFor="postcode">Postcode *</Label><Input id="postcode" value={form.postcode} onChange={(e) => update("postcode", e.target.value)} /></div>
          <div><Label htmlFor="country">Country *</Label><Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. United Kingdom" /></div>
        </div>
      </div>

      {/* Children attending */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Children attending</h3>
        <p className="text-sm text-muted-foreground">Please add the details of all children attending with your family. This helps the team plan age-appropriate activities and support.</p>
        {children.map((child, i) => (
          <div key={i} className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Child {i + 1}</p>
              {children.length > 1 && (
                <button type="button" onClick={() => removeChild(i)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>First name *</Label><Input value={child.first_name} onChange={(e) => updateChild(i, "first_name", e.target.value)} /></div>
              <div><Label>Last name *</Label><Input value={child.last_name} onChange={(e) => updateChild(i, "last_name", e.target.value)} /></div>
              <div><Label>Date of birth *</Label><Input type="date" value={child.date_of_birth} onChange={(e) => updateChild(i, "date_of_birth", e.target.value)} /></div>
            </div>
          </div>
        ))}
        {children.length < 10 && (
          <Button type="button" variant="outline" onClick={addChild} className="rounded-full px-5 text-sm gap-2">
            <Plus className="h-4 w-4" /> Add another child
          </Button>
        )}
      </div>

      {/* Accommodation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Accommodation preference</h3>
        <p className="text-sm text-muted-foreground">The organising team will allocate accommodation based on availability, family size and suitability. Specific accommodation cannot be guaranteed unless confirmed directly.</p>
        <div>
          <Label htmlFor="accommodation_preference">Accommodation preference</Label>
          <Select value={form.accommodation_preference} onValueChange={(v) => update("accommodation_preference", v)}>
            <SelectTrigger id="accommodation_preference"><SelectValue placeholder="Select preference" /></SelectTrigger>
            <SelectContent>{ACCOMMODATION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Dietary & medical */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Dietary and medical needs</h3>
        <p className="text-sm text-muted-foreground">Please include information for all members of your family. Leave blank if none apply.</p>
        <div><Label htmlFor="dietary_requirements">Dietary requirements (for your whole family)</Label><Textarea id="dietary_requirements" value={form.dietary_requirements} onChange={(e) => update("dietary_requirements", e.target.value)} rows={3} placeholder="e.g. one child has a nut allergy, vegan diet..." /></div>
        <div><Label htmlFor="medical_requirements">Medical / health information</Label><Textarea id="medical_requirements" value={form.medical_requirements} onChange={(e) => update("medical_requirements", e.target.value)} rows={3} placeholder="Please include any health conditions, medications or needs the team should be aware of..." /></div>
      </div>

      {/* Emergency contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Emergency contact</h3>
        <p className="text-sm text-muted-foreground">Please provide someone we can contact in an emergency who will not be attending the retreat.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label htmlFor="emergency_contact_name">Full name *</Label><Input id="emergency_contact_name" value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} /></div>
          <div><Label htmlFor="emergency_contact_relationship">Relationship *</Label><Input id="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={(e) => update("emergency_contact_relationship", e.target.value)} placeholder="e.g. Sibling, Parent" /></div>
          <div><Label htmlFor="emergency_contact_phone">Phone number *</Label><Input id="emergency_contact_phone" type="tel" value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} /></div>
        </div>
      </div>

      {/* Additional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Additional information</h3>
        <div>
          <Label htmlFor="heard_about_retreat">How did you hear about the Sikh Family Retreat? *</Label>
          <Select value={form.heard_about_retreat} onValueChange={(v) => update("heard_about_retreat", v)}>
            <SelectTrigger id="heard_about_retreat"><SelectValue placeholder="Select one" /></SelectTrigger>
            <SelectContent>{HEARD_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="additional_notes">Anything else that will help us support your family</Label><Textarea id="additional_notes" value={form.additional_notes} onChange={(e) => update("additional_notes", e.target.value)} rows={4} placeholder="Accessibility needs, specific questions, anything else the retreat team should know..." /></div>
      </div>

      {/* Consent */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Contact preferences</h3>
        <p className="text-sm font-medium text-foreground">How would you like us to contact you?</p>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={form.consent_email === "yes"} onToggle={() => update("consent_email", form.consent_email === "yes" ? "no" : "yes")} />
            <span className="text-sm text-muted-foreground">Email</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={form.consent_whatsapp === "yes"} onToggle={() => update("consent_whatsapp", form.consent_whatsapp === "yes" ? "no" : "yes")} />
            <span className="text-sm text-muted-foreground">WhatsApp</span>
          </label>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.consent_privacy} onToggle={() => update("consent_privacy", !form.consent_privacy)} />
          <span className="text-sm text-muted-foreground">
            I have read and agree to the{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Privacy Policy</a>{" "}
            and acknowledge that personal information will be collected, processed and stored in accordance with that policy and applicable{" "}
            <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">UK data protection laws</a>. *
          </span>
        </label>
      </div>

      {error ? <p ref={errorRef} className="text-sm font-medium text-red-600 scroll-mt-24">{error}</p> : null}

      <div className="pt-2">
        <Button onClick={handleSubmit} disabled={submitting} className="rounded-full px-8 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white">
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Submit booking request"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">Submitting this form does not automatically confirm your place. A sevadaar will review your details and contact you directly.</p>
      </div>
    </div>
  )
}

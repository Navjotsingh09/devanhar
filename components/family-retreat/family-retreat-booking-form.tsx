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
import { RETREAT_ACCOMMODATION, retreatChildAge, type RetreatBookingEvent } from "@/lib/family-retreat-booking-details"
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[\p{L}\p{M}\s'.\-]{1,60}$/u
const PHONE_REGEX = /^[\d\s\+\-()]{7,20}$/

interface ChildEntry {
  first_name: string
  last_name: string
  date_of_birth: string
}

interface AdultEntry {
  first_name: string
  last_name: string
  age: string
}

const emptyChild = (): ChildEntry => ({ first_name: "", last_name: "", date_of_birth: "" })
const emptyAdult = (): AdultEntry => ({ first_name: "", last_name: "", age: "" })

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

export function FamilyRetreatBookingForm({ event }: { event: RetreatBookingEvent }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reference, setReference] = useState<string | null>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const [error, setError] = useState("")
  const [adults, setAdults] = useState<AdultEntry[]>([])
  const [children, setChildren] = useState<ChildEntry[]>([])
  const [hasChildren, setHasChildren] = useState("")
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    city: "", postcode: "", country: "",
    title: "", age: "", address: "", guardian: "", parent_consent: false, transport_required: "",
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

  const updateAdult = (index: number, field: keyof AdultEntry, value: string) =>
    setAdults((prev) => prev.map((adult, i) => (i === index ? { ...adult, [field]: value } : adult)))

  const addChild = () => { if (children.length < 10) setChildren((prev) => [...prev, emptyChild()]) }
  const removeChild = (index: number) => { if (children.length > 1) setChildren((prev) => prev.filter((_, i) => i !== index)) }

  const resetForm = () => {
    setSubmitted(false)
    setReference(null)
    setForm({ first_name:"",last_name:"",email:"",phone:"",city:"",postcode:"",country:"",title:"",age:"",address:"",guardian:"",parent_consent:false,transport_required:"",accommodation_preference:"",dietary_requirements:"",medical_requirements:"",emergency_contact_name:"",emergency_contact_relationship:"",emergency_contact_phone:"",heard_about_retreat:"",additional_notes:"",consent_email:"no",consent_whatsapp:"no",consent_privacy:false,page_url:"",source:"",medium:"" })
    setAdults([])
    setChildren([])
    setHasChildren("")
    setError("")
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getValidationError = (): string | null => {
    if (!NAME_REGEX.test(form.first_name.trim())) return "Please enter your first name."
    if (!NAME_REGEX.test(form.last_name.trim())) return "Please enter your last name."
    if (!EMAIL_REGEX.test(form.email.trim())) return "Please enter a valid email address."
    if (!PHONE_REGEX.test(form.phone.trim())) return "Please enter a valid phone number (e.g. 07700 900123)."
    if (form.city.trim().length < 2) return "Please enter your city or town."
    if (form.postcode.trim().length < 2) return "Please enter your postcode."
    if (form.country.trim().length < 2) return "Please enter your country."
    if (!form.address.trim()) return "Please enter your street address."
    if (!/^\d{1,3}$/.test(form.age) || Number(form.age) < 18 || Number(form.age) > 120) return "Please enter the lead adult’s age."
    for (let i = 0; i < adults.length; i++) {
      const adult = adults[i]
      if (!NAME_REGEX.test(adult.first_name.trim())) return `Please enter a first name for additional adult ${i + 1}.`
      if (!NAME_REGEX.test(adult.last_name.trim())) return `Please enter a last name for additional adult ${i + 1}.`
      if (!/^\d{1,3}$/.test(adult.age) || Number(adult.age) < 18 || Number(adult.age) > 120) return `Please enter a valid age for additional adult ${i + 1}.`
    }
    if (!hasChildren) return "Please tell us whether children or infants are attending."
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (!NAME_REGEX.test(child.first_name.trim())) return `Please enter a first name for child ${i + 1}.`
      if (!NAME_REGEX.test(child.last_name.trim())) return `Please enter a last name for child ${i + 1}.`
      const age = retreatChildAge(child.date_of_birth)
      if (age === null || age >= 18) return `Please enter a valid date of birth for child or infant ${i + 1} (under 18).`
    }
    if (children.length && !form.guardian) return "Please answer the parent or guardian question."
    if (children.length && !form.parent_consent) return "Please confirm parent or guardian consent before submitting."
    if (!form.accommodation_preference) return "Please choose an accommodation preference."
    if (!form.transport_required) return "Please tell us whether you require transport."
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
        body: JSON.stringify({ ...form, additional_adults: adults, children, event }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Something went wrong. Please try again."); return }
      setReference(json.reference || null)
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again or contact the team directly.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {submitted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-success-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={resetForm}
            aria-hidden="true"
          />
          {/* Modal card */}
          <div
            ref={successRef}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl p-8 md:p-10 text-center"
          >
            {/* Close button */}
            <button
              onClick={resetForm}
              aria-label="Close"
              className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <CheckCircle2 className="mx-auto h-14 w-14 text-[hsl(43,100%,29%)] mb-5" />
            <h3 id="booking-success-title" className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Booking request received
            </h3>
            {reference && <p className="mb-3 text-sm font-semibold">Booking reference: {reference}</p>}
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              Thank you. Your family booking request has been submitted. A sevadaar will review your details and contact you directly to discuss availability, costs and next steps.
            </p>
            <button
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-full px-8 py-2.5 text-sm font-medium bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="space-y-10">
      {/* About you */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Adult contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="title">Title (optional)</Label><Input id="title" value={form.title} maxLength={30} onChange={(e) => update("title", e.target.value)} /></div>
          <div><Label htmlFor="age">Age *</Label><Input id="age" type="number" min={18} max={120} value={form.age} onChange={(e) => update("age", e.target.value)} /></div>
        </div>
        <p className="text-sm text-muted-foreground">Please provide the details of the main adult contact for the booking. This person will receive all follow-up communication from the retreat team.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="first_name">First name *</Label><Input id="first_name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} /></div>
          <div><Label htmlFor="last_name">Last name *</Label><Input id="last_name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="email">Email address *</Label><Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
          <div><Label htmlFor="phone">Phone / WhatsApp *</Label><Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
        </div>
        <div><Label htmlFor="address">Street address *</Label><Input id="address" autoComplete="street-address" value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label htmlFor="city">City / Town *</Label><Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
          <div><Label htmlFor="postcode">Postcode *</Label><Input id="postcode" value={form.postcode} onChange={(e) => update("postcode", e.target.value)} /></div>
          <div><Label htmlFor="country">Country *</Label><Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. United Kingdom" /></div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Additional adults attending</h3>
        <p className="text-sm text-muted-foreground">The adult contact above is included. Add every other adult aged 18 or over.</p>
        {adults.map((adult, i) => (
          <div key={i} className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Additional adult {i + 1}</p>
              <button type="button" onClick={() => setAdults((prev) => prev.filter((_, index) => index !== i))} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label htmlFor={`adult-${i}-first`}>First name *</Label><Input id={`adult-${i}-first`} value={adult.first_name} onChange={(e) => updateAdult(i, "first_name", e.target.value)} /></div>
              <div><Label htmlFor={`adult-${i}-last`}>Last name *</Label><Input id={`adult-${i}-last`} value={adult.last_name} onChange={(e) => updateAdult(i, "last_name", e.target.value)} /></div>
              <div><Label htmlFor={`adult-${i}-age`}>Age *</Label><Input id={`adult-${i}-age`} type="number" min={18} max={120} value={adult.age} onChange={(e) => updateAdult(i, "age", e.target.value)} /></div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setAdults((prev) => [...prev, emptyAdult()])} className="rounded-full px-5 text-sm gap-2"><Plus className="h-4 w-4" /> Add an adult</Button>
      </div>

      {/* Children attending */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Children and infants attending</h3>
        <p className="text-sm text-muted-foreground">Add every attendee under 18, including infants under 2. Infants are counted separately based on their age when you submit.</p>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Are any children or infants attending? *</legend>
          <div className="flex gap-5">
            {["yes", "no"].map((answer) => <label key={answer} className="flex items-center gap-2 text-sm">
              <input type="radio" name="retreat-has-children" value={answer} checked={hasChildren === answer} onChange={() => { setHasChildren(answer); setChildren(answer === "yes" ? [emptyChild()] : []); update("guardian", ""); update("parent_consent", false) }} />
              {answer === "yes" ? "Yes" : "No"}
            </label>)}
          </div>
        </fieldset>
        {children.map((child, i) => (
          <div key={i} className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Child or infant {i + 1}</p>
              {children.length > 1 && (
                <button type="button" onClick={() => removeChild(i)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label htmlFor={`child-${i}-first`}>First name *</Label><Input id={`child-${i}-first`} value={child.first_name} onChange={(e) => updateChild(i, "first_name", e.target.value)} /></div>
              <div><Label htmlFor={`child-${i}-last`}>Last name *</Label><Input id={`child-${i}-last`} value={child.last_name} onChange={(e) => updateChild(i, "last_name", e.target.value)} /></div>
              <div><Label htmlFor={`child-${i}-dob`}>Date of birth *</Label><Input id={`child-${i}-dob`} type="date" value={child.date_of_birth} onChange={(e) => updateChild(i, "date_of_birth", e.target.value)} /></div>
            </div>
          </div>
        ))}
        {hasChildren === "yes" && children.length < 10 && (
          <Button type="button" variant="outline" onClick={addChild} className="rounded-full px-5 text-sm gap-2">
            <Plus className="h-4 w-4" /> Add another child or infant
          </Button>
        )}
        {children.length > 0 && <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Are you the parent or guardian of all the children listed? *</legend>
          <div className="flex gap-5">
            {["yes", "no"].map((answer) => <label key={answer} className="flex items-center gap-2 text-sm">
              <input type="radio" name="retreat-guardian" value={answer} checked={form.guardian === answer} onChange={() => { update("guardian", answer); update("parent_consent", false) }} />
              {answer === "yes" ? "Yes" : "No"}
            </label>)}
          </div>
          {form.guardian === "no" && <p className="text-sm text-muted-foreground">We will require written permission from each parent or guardian before confirming the booking.</p>}
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={form.parent_consent} onChange={(e) => update("parent_consent", e.target.checked)} className="mt-0.5 size-4 shrink-0" />
            {form.guardian === "no"
              ? "I confirm I have permission from the parent or guardian of each child to make this request and understand written permission is required. *"
              : "I give my consent for the children listed to attend the Sikh Family Retreat. *"}
          </label>
        </fieldset>}
      </div>

      {/* Accommodation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Accommodation preference</h3>
        <p className="text-sm text-muted-foreground">Your retreat price includes all meals, activities and accommodation. The total cost depends on the accommodation you choose, with Option 1 (an onsite family room with shared facilities) being the most affordable choice. All accommodation is subject to availability and confirmation by the SFI team.</p>
        <div>
          <Label htmlFor="accommodation_preference">Accommodation preference</Label>
          <Select value={form.accommodation_preference} onValueChange={(v) => update("accommodation_preference", v)}>
            <SelectTrigger id="accommodation_preference"><SelectValue placeholder="Select preference" /></SelectTrigger>
            <SelectContent>{RETREAT_ACCOMMODATION.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Dietary & medical */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">Dietary and medical needs</h3>
        <p className="text-sm text-muted-foreground">Please include information for all members of your family. Leave blank if none apply.</p>
        <div><Label htmlFor="dietary_requirements">Dietary requirements (for your whole family)</Label><Textarea id="dietary_requirements" value={form.dietary_requirements} onChange={(e) => update("dietary_requirements", e.target.value)} rows={3} placeholder="e.g. one child has a nut allergy, vegan diet..." /></div>
        <div><Label htmlFor="medical_requirements">Medical and accessibility needs</Label><Textarea id="medical_requirements" value={form.medical_requirements} onChange={(e) => update("medical_requirements", e.target.value)} rows={3} placeholder="Please include any health conditions, medications or accessibility needs in your group..." /></div>
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
        <div><Label htmlFor="additional_notes">Anything you’d like to share about your Sikhi journey or ways you’d like to do seva? (optional)</Label><Textarea id="additional_notes" value={form.additional_notes} onChange={(e) => update("additional_notes", e.target.value)} rows={4} placeholder="This helps us support your family and plan relevant discussions." /></div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Do you require transport? *</legend>
        <p className="text-sm text-muted-foreground">Transport support is very limited and only available from a few set locations.</p>
        <div className="flex gap-5">
          {["yes", "no"].map((answer) => <label key={answer} className="flex items-center gap-2 text-sm">
            <input type="radio" name="retreat-transport" value={answer} checked={form.transport_required === answer} onChange={() => update("transport_required", answer)} />
            {answer === "yes" ? "Yes" : "No"}
          </label>)}
        </div>
      </fieldset>

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
    </>
  )
}

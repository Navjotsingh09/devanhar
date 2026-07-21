"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"

type FormData = {
  camper_first_name: string
  camper_last_name: string
  camper_dob: string
  camper_gender: string
  parent_first_name: string
  parent_last_name: string
  parent_relationship: string
  parent_email: string
  parent_phone: string
  dietary_requirements: string
  medical_info: string
  emergency_name: string
  emergency_relationship: string
  emergency_phone: string
  how_did_you_hear: string
  additional_info: string
  privacy_agreed: boolean
}

const EMPTY: FormData = {
  camper_first_name: "", camper_last_name: "", camper_dob: "", camper_gender: "",
  parent_first_name: "", parent_last_name: "", parent_relationship: "",
  parent_email: "", parent_phone: "",
  dietary_requirements: "", medical_info: "",
  emergency_name: "", emergency_relationship: "", emergency_phone: "",
  how_did_you_hear: "", additional_info: "",
  privacy_agreed: false,
}

function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(43,100%,29%)] focus:border-transparent transition"

const selectCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(43,100%,29%)] focus:border-transparent transition"

const textareaCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(43,100%,29%)] focus:border-transparent transition resize-none"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-foreground border-b border-border pb-3 mb-5">
      {children}
    </h3>
  )
}

export function RootsBookingForm() {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const successRef = useRef<HTMLDivElement | null>(null)

  function resetForm() {
    setForm(EMPTY)
    setError(null)
    setSubmitted(false)
  }

  useEffect(() => {
    if (!submitted) return
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    successRef.current?.focus()
  }, [submitted])

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const setCheck = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.checked }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const required: (keyof FormData)[] = [
      "camper_first_name", "camper_last_name", "camper_dob",
      "parent_first_name", "parent_last_name", "parent_relationship",
      "parent_email", "parent_phone",
      "emergency_name", "emergency_relationship", "emergency_phone",
      "how_did_you_hear",
    ]
    for (const k of required) {
      if (!form[k]) {
        setError("Please fill in all required fields before submitting.")
        return
      }
    }
    if (!form.privacy_agreed) {
      setError("Please read and agree to the Privacy Policy to continue.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/roots-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Something went wrong. Please try again.")
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      {submitted ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            ref={successRef}
            tabIndex={-1}
            className="relative w-full max-w-2xl rounded-2xl border border-green-200 bg-[#eef9ef] px-6 py-14 text-center shadow-2xl sm:px-10"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={resetForm}
              className="absolute right-5 top-5 text-green-900/60 transition-colors hover:text-green-900"
              aria-label="Close confirmation"
            >
              <X className="h-5 w-5" />
            </button>
            <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
            <h3 className="text-xl font-bold text-green-950 sm:text-2xl">Booking request received</h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-green-900/90 sm:text-base">
              Thank you for submitting your booking request. A member of the Roots team will be in touch with you shortly to discuss availability, costs and next steps. Please check your inbox for a confirmation email.
            </p>
            <Button
              type="button"
              onClick={resetForm}
              className="mt-8 rounded-full bg-[#1f8f3d] px-8 py-6 text-sm font-semibold text-white hover:bg-[#187635]"
            >
              Submit another booking
            </Button>
          </div>
        </div>
      ) : (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      {/* Participant details */}
      <div>
        <SectionHeading>Participant details</SectionHeading>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" required>
            <input className={inputCls} value={form.camper_first_name} onChange={set("camper_first_name")} placeholder="First name" />
          </Field>
          <Field label="Last name" required>
            <input className={inputCls} value={form.camper_last_name} onChange={set("camper_last_name")} placeholder="Last name" />
          </Field>
          <Field label="Date of birth" required>
            <input type="date" className={inputCls} value={form.camper_dob} onChange={set("camper_dob")} />
          </Field>
          <Field label="Gender (optional)">
            <select className={selectCls} value={form.camper_gender} onChange={set("camper_gender")}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / prefer to self-describe</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Parent / guardian */}
      <div>
        <SectionHeading>Parent / guardian details</SectionHeading>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" required>
            <input className={inputCls} value={form.parent_first_name} onChange={set("parent_first_name")} placeholder="First name" />
          </Field>
          <Field label="Last name" required>
            <input className={inputCls} value={form.parent_last_name} onChange={set("parent_last_name")} placeholder="Last name" />
          </Field>
          <Field label="Relationship to participant" required>
            <select className={selectCls} value={form.parent_relationship} onChange={set("parent_relationship")}>
              <option value="">Select relationship</option>
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Email address" required>
            <input type="email" className={inputCls} value={form.parent_email} onChange={set("parent_email")} placeholder="email@example.com" />
          </Field>
          <Field label="Phone / WhatsApp" required>
            <input type="tel" className={inputCls} value={form.parent_phone} onChange={set("parent_phone")} placeholder="+44 7..." />
          </Field>
        </div>
      </div>

            {/* Dietary and medical */}
      <div>
        <SectionHeading>Dietary and medical information</SectionHeading>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Please include any relevant information for the participant. Leave blank if none apply.
        </p>
        <div className="grid gap-5">
          <Field label="Dietary requirements">
            <textarea className={textareaCls} rows={3} value={form.dietary_requirements} onChange={set("dietary_requirements")} placeholder="Please list any dietary requirements..." />
          </Field>
          <Field label="Medical / health information">
            <textarea className={textareaCls} rows={3} value={form.medical_info} onChange={set("medical_info")} placeholder="e.g. asthma, medication, physical restrictions..." />
          </Field>
        </div>
      </div>

      {/* Emergency contact */}
      <div>
        <SectionHeading>Emergency contact</SectionHeading>
        <p className="text-sm text-muted-foreground mb-4">
          Please provide someone we can contact in an emergency who will not be attending the residential.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required>
            <input className={inputCls} value={form.emergency_name} onChange={set("emergency_name")} placeholder="Full name" />
          </Field>
          <Field label="Relationship to participant" required>
            <input className={inputCls} value={form.emergency_relationship} onChange={set("emergency_relationship")} placeholder="e.g. parent, aunt..." />
          </Field>
          <Field label="Phone number" required>
            <input type="tel" className={inputCls} value={form.emergency_phone} onChange={set("emergency_phone")} placeholder="+44 7..." />
          </Field>
        </div>
      </div>

      {/* Additional info */}
      <div>
        <SectionHeading>Additional information</SectionHeading>
        <div className="grid gap-5">
          <Field label="How did you hear about Roots?" required>
            <select className={selectCls} value={form.how_did_you_hear} onChange={set("how_did_you_hear")}>
              <option value="">Select one</option>
              <option value="Instagram">Instagram (@rootsuk13)</option>
              <option value="Friend or family">Friend or family</option>
              <option value="Devanhaar website">Devanhaar website</option>
              <option value="Gurdwara">Gurdwara</option>
              <option value="School or college">School or college</option>
              <option value="Previous camp">Previous camp attendee</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Anything else that will help us support the participant">
            <textarea className={textareaCls} rows={4} value={form.additional_info} onChange={set("additional_info")} placeholder="Any other information that would help the Roots team support the participant during the residential..." />
          </Field>
        </div>
      </div>

      {/* Privacy + submit */}
      <div className="space-y-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.privacy_agreed}
            onChange={setCheck("privacy_agreed")}
            className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(43,100%,29%)]"
          />
          <span className="text-sm text-muted-foreground leading-relaxed">
            I have read and agree to the{" "}
            <a href="/privacy" className="text-foreground font-medium hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{" "}
            and acknowledge that personal information will be collected, processed and stored in accordance with that policy and applicable UK data protection laws.
            <span className="text-red-500 ml-0.5">*</span>
          </span>
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full px-8 py-6 text-base bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white w-full sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit booking request"}
        </Button>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Submitting this form does not automatically confirm your place. The Roots team will review your details and contact you directly.
        </p>
      </div>
    </form>
      )}
    </div>
  )
}

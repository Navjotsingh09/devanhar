"use client"

import React, { useState } from "react"
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
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from "lucide-react"

const STEPS = [
  "Important Information",
  "Your Details",
  "Your Address",
  "Further Details",
  "Travel & Payment",
  "Additional Questions",
  "Contact Consent",
]

interface CampApplicationFormProps {
  initiativeSlug?: string
  onClose: () => void
}

export function CampApplicationForm({
  initiativeSlug = "singhs-camp",
  onClose,
}: CampApplicationFormProps) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    age_at_camp: "",
    phone: "",
    university: "",
    occupation: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    city: "",
    postcode: "",
    country: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
    under_18_consent: "",
    dietary_requirements: "",
    medical_requirements: "",
    travel_method: "",
    requires_payment_support: false,
    room_preference: "",
    heard_about_camp: "",
    first_residential_camp: "",
    previous_camps: "",
    been_to_singhs_camp_before: "",
    sikhi_knowledge_level: "",
    takeaway_from_camp: "",
    consent_email: false,
    consent_phone: false,
    consent_sms: false,
  })

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return true // Info page, just read
      case 1:
        return !!(form.first_name && form.last_name && form.email && form.date_of_birth && form.phone)
      case 2:
        return !!(form.address_line_1 && form.city && form.postcode && form.country)
      case 3:
        return !!(form.emergency_contact_name && form.emergency_contact_relationship && form.emergency_contact_phone)
      case 4:
        return true
      case 5:
        return !!(form.heard_about_camp && form.first_residential_camp && form.been_to_singhs_camp_before && form.sikhi_knowledge_level && form.takeaway_from_camp)
      case 6:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/camp-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          initiative_slug: initiativeSlug,
          first_residential_camp: form.first_residential_camp === "yes",
          been_to_singhs_camp_before: form.been_to_singhs_camp_before === "yes",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.")
      } else {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-background rounded-2xl w-full max-w-lg p-8 text-center relative">
          <button onClick={onClose} aria-label="Close"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank you for applying!</h2>
          <p className="text-muted-foreground mb-2">
            Your application for Singhs Camp has been submitted successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            All applications will be considered by the admin team and you will
            hear back within 6 weeks.
          </p>
          <Button onClick={onClose} className="rounded-full px-8">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-background z-10 border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold">Singhs Camp Application</h2>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="w-full bg-muted h-2">
          <div
            className="bg-primary h-2 transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="p-6 space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Important Information</h3>
                <ul className="text-sm text-amber-700 space-y-1 list-disc pl-4">
                  <li>You must be aged 16 or over to attend.</li>
                  <li>Full payment is required to secure your place.</li>
                  <li>Places are limited and allocated on a first-come basis.</li>
                  <li>Please ensure all details are accurate before submitting.</li>
                </ul>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" value={form.first_name}
                    onChange={e => update("first_name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" value={form.last_name}
                    onChange={e => update("last_name", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email}
                  onChange={e => update("email", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input id="date_of_birth" type="date"
                    value={form.date_of_birth}
                    onChange={e => update("date_of_birth", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="age_at_camp">Age at Camp</Label>
                  <Input id="age_at_camp" type="number" min={16}
                    value={form.age_at_camp}
                    onChange={e => update("age_at_camp", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" type="tel" value={form.phone}
                  onChange={e => update("phone", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input id="university" value={form.university}
                    onChange={e => update("university", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" value={form.occupation}
                    onChange={e => update("occupation", e.target.value)} />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address_line_1">Address Line 1 *</Label>
                <Input id="address_line_1" value={form.address_line_1}
                  onChange={e => update("address_line_1", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input id="address_line_2" value={form.address_line_2}
                  onChange={e => update("address_line_2", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address_line_3">Address Line 3</Label>
                <Input id="address_line_3" value={form.address_line_3}
                  onChange={e => update("address_line_3", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.city}
                    onChange={e => update("city", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input id="postcode" value={form.postcode}
                    onChange={e => update("postcode", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input id="country" value={form.country}
                  onChange={e => update("country", e.target.value)} />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
                <Input id="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={e => update("emergency_contact_name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
                  <Input id="emergency_contact_relationship"
                    value={form.emergency_contact_relationship}
                    onChange={e => update("emergency_contact_relationship", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Phone *</Label>
                  <Input id="emergency_contact_phone" type="tel"
                    value={form.emergency_contact_phone}
                    onChange={e => update("emergency_contact_phone", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="under_18_consent">Under 18 Parental Consent</Label>
                <select id="under_18_consent"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.under_18_consent}
                  onChange={e => update("under_18_consent", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="na">N/A (18 or over)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dietary_requirements">Dietary Requirements</Label>
                <Textarea id="dietary_requirements" rows={3}
                  value={form.dietary_requirements}
                  onChange={e => update("dietary_requirements", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="medical_requirements">Medical Requirements</Label>
                <Textarea id="medical_requirements" rows={3}
                  value={form.medical_requirements}
                  onChange={e => update("medical_requirements", e.target.value)} />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="travel_method">Travel Method</Label>
                <select id="travel_method"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.travel_method}
                  onChange={e => update("travel_method", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="coach-birmingham">Coach from Birmingham</option>
                  <option value="coach-london">Coach from London</option>
                  <option value="coach-derby">Coach from Derby</option>
                  <option value="own-transport">Own Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="requires_payment_support">Do you require payment support?</Label>
                <select id="requires_payment_support"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.requires_payment_support}
                  onChange={e => update("requires_payment_support", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <Label htmlFor="room_preference">Room Preference</Label>
                <Textarea id="room_preference" rows={2}
                  value={form.room_preference}
                  onChange={e => update("room_preference", e.target.value)} />
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <Label>How did you hear about camp? *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={form.heard_about_camp}
                    onChange={e => update("heard_about_camp", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="friend">Friend</option>
                    <option value="gurdwara">Gurdwara</option>
                    <option value="university">University</option>
                    <option value="website">Website</option>
                    <option value="previous-camper">Previous Camper</option>
                    <option value="other">Other</option>
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First residential camp? *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={form.first_residential_camp}
                    onChange={e => update("first_residential_camp", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <Label>Been to Singhs Camp before? *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={form.been_to_singhs_camp_before}
                    onChange={e => update("been_to_singhs_camp_before", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              {form.first_residential_camp === "no" && (
                <div>
                  <Label>Previous camps attended</Label>
                  <Input value={form.previous_camps}
                    onChange={e => update("previous_camps", e.target.value)} />
                </div>
              )}
              <div>
                <Label>Sikhi knowledge level *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={form.sikhi_knowledge_level}
                    onChange={e => update("sikhi_knowledge_level", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="beginner">Beginner</option>
                    <option value="some">Some Knowledge</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="good">Good</option>
                    <option value="advanced">Advanced</option>
                  </select>
              </div>
              <div>
                <Label>What do you hope to take away from camp? *</Label>
                <Textarea rows={4} value={form.takeaway_from_camp}
                  onChange={e => update("takeaway_from_camp", e.target.value)} />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Consent</h3>
              <p className="text-sm text-muted-foreground">
                How would you like us to contact you?
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.consent_email === "yes"}
                    onChange={e => update("consent_email", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.consent_phone === "yes"}
                    onChange={e => update("consent_phone", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">Phone</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.consent_sms === "yes"}
                    onChange={e => update("consent_sms", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">SMS</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !canAdvance()}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

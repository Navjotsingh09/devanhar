"use client"

import React, { useState, useEffect } from "react"
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

const ID_DOCUMENT_TYPES_ADULT = [
  { value: "passport", label: "Passport" },
  { value: "driving-licence", label: "Driving Licence" },
]

const ID_DOCUMENT_TYPES_MINOR = [
  { value: "passport", label: "Passport" },
  { value: "driving-licence", label: "Driving Licence" },
  { value: "provisional", label: "Young Person's Provisional Licence" },
  { value: "school-id", label: "School / College ID Card" },
  { value: "birth-certificate", label: "Birth Certificate" },
  { value: "parent-guardian-id", label: "Parent/Guardian ID + Consent Letter" },
]

const STEPS = [
  "Important Information",
  "Your Details",
  "Your Address",
  "Further Details",
  "Travel & Payment",
  "BJJ / Wrestling / Boxing",
  "Additional Questions",
  "Contact Consent",
]


const ALLERGY_OPTIONS = [
  "Gluten Intolerance",
  "Nut Allergy",
  "Dairy",
  "Soy",
  "Egg",
  "Shellfish",
  "Sesame",
  "Other",
]

const ALLOWED_ID_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"]
const MAX_ID_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_ID_UPLOAD_MB = 10
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[a-zA-Z\s'\-]{2,50}$/
const PHONE_REGEX = /^[\d\s\+\-()]{7,20}$/
const POSTCODE_REGEX = /^[a-zA-Z0-9\s]{3,10}$/

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
  const [uploadingId, setUploadingId] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successTitle, setSuccessTitle] = useState("Application submitted")
  const [successMessage, setSuccessMessage] = useState(
    "Your application for Singhs Camp UK has been submitted successfully."
  )
  const [successDetails, setSuccessDetails] = useState(
    "All applications will be considered by the admin team and you will hear back within 6 weeks."
  )
  const [error, setError] = useState("")
  const [idUploadError, setIdUploadError] = useState("")
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null)
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
    requires_payment_support: "",
    room_preference: "",
    heard_about_camp: "",
    first_residential_camp: "",
    previous_camps: "",
    been_to_singhs_camp_before: "",
    sikhi_knowledge_level: "",
    takeaway_from_camp: "",
    consent_email: "yes",
    consent_phone: "yes",
    consent_sms: "yes",
    id_document_url: "",
    id_document_type: "",
    consent_whatsapp: "yes",
    payment_support_details: "",
    own_transport_type: "",
    bjj_interest: "",
    bjj_fought_professionally: "",
    bjj_sport_preference: [] as string[],
    allergies: [] as string[],
    carries_epipen: "",
    other_allergy: "",
    gift_aid: "",
    donation_amount: "199",
    donation_type: "one-off",
    monthly_donation_opted: "no",
    monthly_donation_amount: "",
  })

  // Lock body scroll when modal is open to prevent iOS blank screen issues
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [])

  const update = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }


  const toggleAllergy = (allergy: string) => {
    setForm((prev) => {
      const current = prev.allergies
      const updated = current.includes(allergy)
        ? current.filter((a) => a !== allergy)
        : [...current, allergy]
      return { ...prev, allergies: updated }
    })
  }

  const calculateAgeFromDob = (dobString: string): number | null => {
    if (!dobString) return null
    const dob = new Date(dobString)
    if (Number.isNaN(dob.getTime())) return null

    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
    return age
  }

  const isOver18 = (): boolean => {
    const age = calculateAgeFromDob(form.date_of_birth)
    return age !== null && age >= 18
  }

  const isAtLeast16 = (): boolean => {
    const age = calculateAgeFromDob(form.date_of_birth)
    return age !== null && age >= 16
  }

  const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim())
  const hasValue = (value: string): boolean => value.trim().length > 0

  const hasRequiredSubmissionFields = (): boolean => {
    return !!(
      hasValue(form.first_name) &&
      hasValue(form.last_name) &&
      hasValue(form.email) &&
      isValidEmail(form.email) &&
      hasValue(form.date_of_birth) &&
      hasValue(form.phone) &&
      hasValue(form.address_line_1) &&
      hasValue(form.city) &&
      hasValue(form.postcode) &&
      hasValue(form.country) &&
      hasValue(form.emergency_contact_name) &&
      hasValue(form.emergency_contact_relationship) &&
      hasValue(form.emergency_contact_phone) &&
      hasValue(form.id_document_url) &&
      hasValue(form.id_document_type) &&
      hasValue(form.heard_about_camp) &&
      hasValue(form.first_residential_camp) &&
      hasValue(form.been_to_singhs_camp_before) &&
      hasValue(form.sikhi_knowledge_level) &&
      hasValue(form.takeaway_from_camp)
    )
  }

  const isValidName = (name: string): boolean => NAME_REGEX.test(name.trim())
  const isValidPhone = (phone: string): boolean => PHONE_REGEX.test(phone.trim())
  const isValidPostcode = (postcode: string): boolean => POSTCODE_REGEX.test(postcode.trim())
  const hasMinLength = (value: string, min: number): boolean => value.trim().length >= min

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return true
      case 1:
        return !!(
          form.first_name.trim().length >= 2 &&
          isValidName(form.first_name) &&
          form.last_name.trim().length >= 2 &&
          isValidName(form.last_name) &&
          form.email &&
          isValidEmail(form.email) &&
          form.date_of_birth &&
          form.phone &&
          isValidPhone(form.phone) &&
          isAtLeast16()
        )
      case 2:
        return !!(
          hasMinLength(form.address_line_1, 3) &&
          hasMinLength(form.city, 2) &&
          form.postcode && isValidPostcode(form.postcode) &&
          hasMinLength(form.country, 2)
        )
      case 3:
        return !!(
          hasMinLength(form.emergency_contact_name, 2) &&
          isValidName(form.emergency_contact_name) &&
          hasMinLength(form.emergency_contact_relationship, 2) &&
          form.emergency_contact_phone &&
          isValidPhone(form.emergency_contact_phone) &&
          hasValue(form.id_document_type) &&
          hasValue(form.id_document_url)
        )
      case 4:
        return true
      case 5:
        return !!(
          form.bjj_interest &&
          (form.bjj_interest === "no" || (form.bjj_sport_preference.length > 0 && form.bjj_fought_professionally))
        )
      case 6:
        return !!(
          form.heard_about_camp &&
          form.first_residential_camp &&
          form.been_to_singhs_camp_before &&
          form.sikhi_knowledge_level &&
          hasMinLength(form.takeaway_from_camp, 10)
        )
      case 7:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setError("")

    if (!hasRequiredSubmissionFields()) {
      if (!isValidEmail(form.email)) {
        setStep(1)
        setError("Invalid email address")
        return
      }
      setError("Please complete all required fields before submitting.")
      return
    }

    if (!isAtLeast16()) {
      setStep(1)
      setError("You must be at least 16 years old to apply.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/camp-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          initiative_slug: initiativeSlug,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.")
      } else {
        if (data.checkout_url) {
          window.location.href = data.checkout_url
          return
        }

        setSuccessTitle(data.title || "Application submitted")
        setSuccessMessage(
          data.message || "Your application for Singhs Camp UK has been submitted successfully."
        )
        setSuccessDetails(
          data.payment_mode === "deferred"
            ? "Your place is reserved pending payment follow-up from the team."
            : "All applications will be considered by the admin team and you will hear back within 6 weeks."
        )
        setSubmitted(true)
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleIdUpload = async (file: File | null) => {
    if (!file) return
    setIdUploadError("")

    const fileExt = file.name.split(".").pop()?.toLowerCase() || ""
    if (!ALLOWED_ID_EXTENSIONS.includes(fileExt)) {
      setIdUploadError("Unsupported file type. Allowed formats: JPG, JPEG, PNG, WEBP, HEIC, HEIF, PDF.")
      return
    }

    if (file.size > MAX_ID_UPLOAD_BYTES) {
      setIdUploadError(`File is too large. Maximum allowed size is ${MAX_ID_UPLOAD_MB}MB.`)
      return
    }

    // Create local preview
    const isImage = ["jpg","jpeg","png","webp"].includes(fileExt)
    if (isImage) {
      setIdPreviewUrl(URL.createObjectURL(file))
    } else {
      setIdPreviewUrl(null)
    }

    setUploadingId(true)

    try {
      const data = new FormData()
      data.append("file", file)
      data.append("initiative_slug", initiativeSlug)

      const res = await fetch("/api/camp-applications/upload-id", {
        method: "POST",
        body: data,
      })

      if (res.status === 413) {
        setIdUploadError(`File is too large. Maximum allowed size is ${MAX_ID_UPLOAD_MB}MB. Allowed formats: JPG, JPEG, PNG, WEBP, HEIC, HEIF, PDF.`)
        return
      }

      let json = null
      try {
        json = await res.json()
      } catch {
        setIdUploadError("Upload failed (server returned " + res.status + "). Try again.")
        return
      }

      if (!res.ok) {
        setIdUploadError(json?.error || "Failed to upload file")
      } else {
        update("id_document_url", json?.file_path ?? "")
      }
    } catch {
      setIdUploadError("Network error uploading file. Please try again.")
    } finally {
      setUploadingId(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-4">
        <div className="bg-background rounded-2xl w-full max-w-lg p-8 text-center relative mx-auto my-3 sm:my-6">
          <button onClick={onClose} aria-label="Close"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{successTitle}</h2>
          <p className="text-muted-foreground mb-2">{successMessage}</p>
          <p className="text-sm text-muted-foreground mb-6">{successDetails}</p>
          <Button onClick={onClose} className="rounded-full px-8">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-4" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto relative mx-auto my-0 sm:my-6" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="sticky top-0 bg-background z-10 border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold">Singhs Camp UK Application</h2>
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
                  <li>Payment is normally taken online after submission; if online checkout is unavailable, the team will contact you directly.</li>
                  <li>Payment authorisation does not confirm your seat. Your application is reviewed first, and your place is only confirmed after approval.</li>
                  <li>Places are limited and allocated on a first-come basis.</li>
                  <li>Please ensure all details are accurate before submitting.</li>
                  <li>If your application is not approved, any payment taken will be refunded to your original payment method within 15–30 working days.</li>
                </ul>
              </div>

              <div className="bg-muted/40 border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Camp Registration Steps</h3>
                <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-2">
                  <li>Complete this form to register your application for camp.</li>
                  <li>If online payment is available, you will be redirected to checkout immediately.</li>
                  <li>If checkout is unavailable, the team will follow up with payment instructions.</li>
                </ol>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="mb-1.5 block">First Name *</Label>
                  <Input id="first_name" value={form.first_name}
                    onChange={e => update("first_name", e.target.value)} />
                  {form.first_name.trim().length > 0 && !isValidName(form.first_name) && (
                    <p className="text-xs text-red-700 mt-1">Letters, spaces, hyphens, and apostrophes only</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name" className="mb-1.5 block">Last Name *</Label>
                  <Input id="last_name" value={form.last_name}
                    onChange={e => update("last_name", e.target.value)} />
                  {form.last_name.trim().length > 0 && !isValidName(form.last_name) && (
                    <p className="text-xs text-red-700 mt-1">Letters, spaces, hyphens, and apostrophes only</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block">Email *</Label>
                <Input id="email" type="email" value={form.email}
                  onChange={e => update("email", e.target.value)} />
                {form.email.trim() && !isValidEmail(form.email) && (
                  <p className="text-xs text-red-700 mt-2">Invalid email address</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth" className="mb-1.5 block">Date of Birth *</Label>
                  <Input id="date_of_birth" type="date"
                    value={form.date_of_birth}
                    onChange={e => {
                      const dob = e.target.value
                      const age = calculateAgeFromDob(dob)
                      setForm((prev) => ({
                        ...prev,
                        date_of_birth: dob,
                        age_at_camp: age !== null ? String(age) : "",
                      }))
                    }} />
                  {form.date_of_birth && !isAtLeast16() && (
                    <p className="text-xs text-red-700 mt-2">You must be at least 16 years old to apply.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="age_at_camp" className="mb-1.5 block">Age at Camp</Label>
                  <Input id="age_at_camp" type="text" inputMode="numeric"
                    value={form.age_at_camp}
                    readOnly
                    className="bg-muted/50 max-w-[100px]" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="mb-1.5 block">Phone *</Label>
                <Input id="phone" type="tel" value={form.phone}
                  onChange={e => update("phone", e.target.value)} />
                {form.phone.trim().length > 0 && !isValidPhone(form.phone) && (
                  <p className="text-xs text-red-700 mt-1">Enter a valid phone number</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university" className="mb-1.5 block">University</Label>
                  <Input id="university" value={form.university}
                    onChange={e => update("university", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="occupation" className="mb-1.5 block">Occupation</Label>
                  <Input id="occupation" value={form.occupation}
                    onChange={e => update("occupation", e.target.value)} />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address_line_1" className="mb-1.5 block">Address Line 1 *</Label>
                <Input id="address_line_1" value={form.address_line_1}
                  onChange={e => update("address_line_1", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address_line_2" className="mb-1.5 block">Address Line 2</Label>
                <Input id="address_line_2" value={form.address_line_2}
                  onChange={e => update("address_line_2", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address_line_3" className="mb-1.5 block">Address Line 3</Label>
                <Input id="address_line_3" value={form.address_line_3}
                  onChange={e => update("address_line_3", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="mb-1.5 block">City *</Label>
                  <Input id="city" value={form.city}
                    onChange={e => update("city", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postcode" className="mb-1.5 block">Postcode *</Label>
                  <Input id="postcode" value={form.postcode}
                    onChange={e => update("postcode", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="country" className="mb-1.5 block">Country *</Label>
                <Input id="country" value={form.country}
                  onChange={e => update("country", e.target.value)} />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="emergency_contact_name" className="mb-1.5 block">Emergency Contact Name *</Label>
                <Input id="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={e => update("emergency_contact_name", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_relationship" className="mb-1.5 block">Relationship *</Label>
                  <Input id="emergency_contact_relationship"
                    value={form.emergency_contact_relationship}
                    onChange={e => update("emergency_contact_relationship", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone" className="mb-1.5 block">Phone *</Label>
                  <Input id="emergency_contact_phone" type="tel"
                    value={form.emergency_contact_phone}
                    onChange={e => update("emergency_contact_phone", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="under_18_consent" className="mb-1.5 block">Under 18 Parental Consent</Label>
                {isOver18() ? (
                  <p className="text-sm text-muted-foreground mt-1">Not applicable (you are 18 or over)</p>
                ) : (
                  <Select value={form.under_18_consent} onValueChange={v => update("under_18_consent", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="na">N/A (18 or over)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="dietary_requirements" className="mb-1.5 block">Dietary Requirements</Label>
                <Textarea id="dietary_requirements" rows={3}
                  value={form.dietary_requirements}
                  onChange={e => update("dietary_requirements", e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">Allergies</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => (
                    <label key={allergy} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.allergies.includes(allergy)}
                        onChange={() => toggleAllergy(allergy)}
                      />
                      {allergy}
                    </label>
                  ))}
                </div>
                {form.allergies.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      placeholder="Please specify other allergy"
                      value={form.other_allergy}
                      onChange={e => update("other_allergy", e.target.value)}
                    />
                  </div>
                )}
                {form.allergies.length > 0 && (
                  <div className="mt-3">
                    <Label htmlFor="carries_epipen" className="mb-1.5 block">Will you carry an EpiPen?</Label>
                    <Select value={form.carries_epipen} onValueChange={v => update("carries_epipen", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="medical_requirements" className="mb-1.5 block">Medical Requirements</Label>
                <Textarea id="medical_requirements" rows={3}
                  value={form.medical_requirements}
                  onChange={e => update("medical_requirements", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="id_document_type" className="mb-1.5 block">Photo ID Document Type *</Label>
                <Select value={form.id_document_type} onValueChange={v => {
                    update("id_document_type", v)
                    if (form.id_document_url) {
                      update("id_document_url", "")
                    }
                  }}>
                  <SelectTrigger><SelectValue placeholder="Select document type..." /></SelectTrigger>
                  <SelectContent>
                    {(isOver18() ? ID_DOCUMENT_TYPES_ADULT : ID_DOCUMENT_TYPES_MINOR).map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.id_document_type === "parent-guardian-id" && (
                  <p className="text-xs text-blue-700 mt-1">
                    Please upload your parent or guardian's ID document. A consent letter must also be provided.
                  </p>
                )}
                {form.id_document_type === "birth-certificate" && (
                  <p className="text-xs text-blue-700 mt-1">
                    Please upload a clear photo or scan of your birth certificate.
                  </p>
                )}
              </div>
              {form.id_document_type && (
                <div>
                  <Label htmlFor="id_document" className="mb-1.5 block">Upload Document *</Label>
                  <Input
                    id="id_document"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/*"
                    onChange={e => handleIdUpload(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Allowed formats: JPG, JPEG, PNG, WEBP, HEIC, HEIF, PDF. Maximum file size: {MAX_ID_UPLOAD_MB}MB.
                  </p>
                  {uploadingId && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Uploading document...</p>
                    </div>
                  )}
                  {!uploadingId && form.id_document_url && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-700">Document uploaded successfully. It will be reviewed by the team.</p>
                      </div>
                      {idPreviewUrl && (
                        <div className="border rounded-lg overflow-hidden w-48 h-48 bg-muted/30">
                          <img
                            src={idPreviewUrl}
                            alt="Uploaded ID preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {idUploadError && (
                    <p className="text-xs text-red-700 mt-2">{idUploadError}</p>
                  )}
                  {!form.id_document_url && !uploadingId && !idUploadError && (
                    <p className="text-xs text-red-700 mt-2">A valid ID document is required to proceed.</p>
                  )}
                </div>
              )}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Camp is held in <strong>Wales</strong>. Please select how you plan to travel.
                </p>
              </div>
              <div>
                <Label htmlFor="travel_method" className="mb-1.5 block">Travel Method</Label>
                <Select value={form.travel_method} onValueChange={v => update("travel_method", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coach-birmingham">Coach from Birmingham</SelectItem>
                    <SelectItem value="coach-london">Coach from London (Southall)</SelectItem>
                    <SelectItem value="own-transport">Own Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.travel_method === "own-transport" && (
                <div>
                  <Label>How will you be travelling?</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {["Taxi", "Train", "Car", "Plane"].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="own_transport_type"
                          value={type.toLowerCase()}
                          checked={form.own_transport_type === type.toLowerCase()}
                          onChange={e => update("own_transport_type", e.target.value)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="room_preference" className="mb-1.5 block">Are there any other campers you would like to room with?</Label>
                <Textarea id="room_preference" rows={2}
                  placeholder="Enter names of campers you'd like to share a room with"
                  value={form.room_preference}
                  onChange={e => update("room_preference", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="requires_payment_support" className="mb-1.5 block">Do you require financial support for your camp donation of £199?</Label>
                <Select value={form.requires_payment_support} onValueChange={v => update("requires_payment_support", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.requires_payment_support === "yes" && (
                <div>
                  <Label htmlFor="payment_support_details" className="mb-1.5 block">Please explain your circumstances</Label>
                  <Textarea id="payment_support_details" rows={3}
                    placeholder="Tell us about your situation so we can help"
                    value={form.payment_support_details}
                    onChange={e => update("payment_support_details", e.target.value)} />
                </div>
              )}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  We will be hosting a <strong>BJJ/wrestling/boxing competition</strong> during camp, where the final will be taking place in front of the entire camp.
                </p>
              </div>
              <div>
                <Label>Would you be interested in participating? *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  If you answer yes, you will be allocated a ranking match during camp.
                </p>
                <Select value={form.bjj_interest} onValueChange={v => update("bjj_interest", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.bjj_interest === "yes" && (
                <>
                  <div>
                    <Label>What sport are you interested in? *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select all that apply.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {["BJJ", "Wrestling", "Boxing"].map((sport) => (
                        <label key={sport} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.bjj_sport_preference.includes(sport)}
                            onChange={e => {
                              const updated = e.target.checked
                                ? [...form.bjj_sport_preference, sport]
                                : form.bjj_sport_preference.filter((s) => s !== sport)
                              update("bjj_sport_preference", updated)
                            }}
                          />
                          {sport}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Have you ever fought professionally? *</Label>
                    <Select value={form.bjj_fought_professionally} onValueChange={v => update("bjj_fought_professionally", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div>
                <Label>How did you hear about camp? *</Label>
                  <Select value={form.heard_about_camp} onValueChange={v => update("heard_about_camp", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter / X</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="gurdwara">Gurdwara</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="previous-camper">Previous Camper</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First residential camp? *</Label>
                  <Select value={form.first_residential_camp} onValueChange={v => update("first_residential_camp", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Been to Singhs Camp UK before? *</Label>
                  <Select value={form.been_to_singhs_camp_before} onValueChange={v => update("been_to_singhs_camp_before", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select value={form.sikhi_knowledge_level} onValueChange={v => update("sikhi_knowledge_level", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="some">Some Knowledge</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Label>What do you hope to take away from camp? *</Label>
                <Textarea rows={4} value={form.takeaway_from_camp}
                  onChange={e => update("takeaway_from_camp", e.target.value)} />
                {form.takeaway_from_camp.trim().length > 0 && form.takeaway_from_camp.trim().length < 10 && (
                  <p className="text-xs text-red-700 mt-1">Please write at least 10 characters</p>
                )}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Consent</h3>
              <p className="text-sm text-muted-foreground">
                How would you like us to contact you? All options are selected by default &mdash; uncheck any you do not want.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 accent-primary" checked={form.consent_email === "yes"}
                    onChange={e => update("consent_email", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 accent-primary" checked={form.consent_phone === "yes"}
                    onChange={e => update("consent_phone", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">Phone</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 accent-primary" checked={form.consent_sms === "yes"}
                    onChange={e => update("consent_sms", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">SMS</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 accent-primary" checked={form.consent_whatsapp === "yes"}
                    onChange={e => update("consent_whatsapp", e.target.checked ? "yes" : "no")} />
                  <span className="text-sm">WhatsApp</span>
                </label>
              </div>
              {form.requires_payment_support !== "yes" && (
                <div className="mt-6 pt-6 border-t">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-5 w-5 accent-primary" checked={form.gift_aid === "yes"}
                      onChange={e => update("gift_aid", e.target.checked ? "yes" : "no")} />
                    <span className="text-sm">Gift Aid Declaration - I want this camp to reclaim tax on my donation</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    By ticking this box, I confirm I am a UK taxpayer and pay Income Tax or Capital Gains Tax equal to or greater than the tax that Devanhaar will reclaim.
                  </p>
                </div>
              )}
              {form.requires_payment_support !== "yes" && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold">Support Singhs Camp UK</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      The standard camp contribution is <strong>£199</strong>. If you are able to give more, your generosity directly funds activities, meals and facilities for all campers.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[199, 250, 350].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => update("donation_amount", String(amt))}
                        className={`relative rounded-xl border-2 p-3 text-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 ${form.donation_amount === String(amt) ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}`}
                      >
                        {amt === 199 && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Standard</span>
                        )}
                        {amt === 250 && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Popular</span>
                        )}
                        {amt === 350 && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Generous</span>
                        )}
                        <span className="text-xl font-bold">£{amt}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (["199", "250", "350"].includes(form.donation_amount)) {
                        update("donation_amount", "")
                      }
                      setTimeout(() => {
                        const el = document.getElementById("donation_amount") as HTMLInputElement
                        if (el) { el.focus() }
                      }, 50)
                    }}
                    className={`w-full rounded-xl border-2 p-3 text-center transition-all duration-150 focus:outline-none ${!["199", "250", "350"].includes(form.donation_amount) ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}`}
                  >
                    <span className="text-sm font-medium text-muted-foreground">Custom amount</span>
                  </button>

                  {!["199", "250", "350"].includes(form.donation_amount) && (
                    <div className="mt-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">£</span>
                        <Input
                          id="donation_amount"
                          type="number"
                          min="199"
                          step="1"
                          className="pl-7 text-center text-lg font-semibold"
                          value={form.donation_amount}
                          onChange={e => update("donation_amount", e.target.value)}
                          autoFocus
                        />
                      </div>
                      {form.donation_amount && Number(form.donation_amount) < 199 && (
                        <p className="text-xs text-red-600 mt-1 text-center">Minimum camp contribution is £199</p>
                      )}
                    </div>
                  )}

                  {Number(form.donation_amount) > 199 && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-emerald-800">
                        <span className="font-semibold">Thank you!</span> Your extra £{Number(form.donation_amount) - 199} helps fund camp activities and support those who need financial assistance.
                      </p>
                    </div>
                  )}

              {/* Monthly Donation / Direct Debit Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold">Regular Monthly Donation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Would you like to set up a regular monthly donation to support Devanhaar? This is entirely optional and separate from your camp contribution.
                  </p>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => { update("monthly_donation_opted", "yes"); if (!form.monthly_donation_amount) update("monthly_donation_amount", "10"); }}
                    className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-semibold transition-all ${form.monthly_donation_opted === "yes" ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}`}
                  >
                    Yes, I’d like to give monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => { update("monthly_donation_opted", "no"); update("monthly_donation_amount", ""); }}
                    className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-semibold transition-all ${form.monthly_donation_opted === "no" ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}`}
                  >
                    No thanks
                  </button>
                </div>

                {form.monthly_donation_opted === "yes" && (
                  <div>
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      Choose a monthly amount. Your regular giving helps sustain Devanhaar’s charitable work year-round.
                    </p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[5, 10, 20, 50].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => update("monthly_donation_amount", String(amt))}
                          className={`rounded-xl border-2 p-3 text-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 ${form.monthly_donation_amount === String(amt) ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}`}
                        >
                          <span className="text-lg font-bold">£{amt}</span>
                          <span className="block text-[10px] text-muted-foreground">/month</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (["5", "10", "20", "50"].includes(form.monthly_donation_amount)) {
                          update("monthly_donation_amount", "")
                        }
                        setTimeout(() => {
                          const el = document.getElementById("monthly_donation_amount") as HTMLInputElement
                          if (el) { el.focus() }
                        }, 50)
                      }}
                      className={`w-full rounded-xl border-2 p-3 text-center transition-all duration-150 focus:outline-none ${!["5", "10", "20", "50"].includes(form.monthly_donation_amount) && form.monthly_donation_amount !== "" ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}`}
                    >
                      <span className="text-sm font-medium text-muted-foreground">Custom monthly amount</span>
                    </button>

                    {!["5", "10", "20", "50"].includes(form.monthly_donation_amount) && (
                      <div className="mt-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">£</span>
                          <Input
                            id="monthly_donation_amount"
                            type="number"
                            min="1"
                            step="1"
                            className="pl-7 text-center text-lg font-semibold"
                            value={form.monthly_donation_amount}
                            onChange={e => update("monthly_donation_amount", e.target.value)}
                            autoFocus
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/month</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-800">
                        Your monthly donation of <strong>£{form.monthly_donation_amount || '0'}</strong> will be automatically deducted each month once your application is approved. Your Gift Aid declaration above also applies to your monthly donations.
                      </p>
                    </div>

                  </div>
                )}

                {/* Order Summary */}
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span>Camp fee (one-off):</span>
                    <span className="font-semibold">£{Math.max(Number(form.donation_amount) || 199, 199)}</span>
                  </div>
                  {form.monthly_donation_opted === "yes" && Number(form.monthly_donation_amount) > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span>Monthly donation:</span>
                      <span className="font-semibold">£{form.monthly_donation_amount}/month</span>
                    </div>
                  )}
                  <div className="border-t mt-2 pt-2 flex justify-between text-sm font-bold">
                    <span>Total charged today:</span>
                    <span>£{Math.max(Number(form.donation_amount) || 199, 199)}</span>
                  </div>
                  {form.monthly_donation_opted === "yes" && Number(form.monthly_donation_amount) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      + £{form.monthly_donation_amount}/month starting after approval
                    </p>
                  )}
                </div>
              </div>
                </div>
              )}
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
              <Button onClick={handleSubmit} disabled={submitting || !hasRequiredSubmissionFields() || (form.requires_payment_support !== "yes" && Number(form.donation_amount) < 199)}>
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

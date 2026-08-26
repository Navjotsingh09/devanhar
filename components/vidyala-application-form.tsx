"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from "lucide-react"
import Image from "next/image"

const STEPS = [
  "Important Information",
  "Personal Details",
  "Photo ID",
  "DBS Check",
  "Emergency Contacts",
  "Sikhi Journey",
  "Commitment & Practical",
  "Visa Information",
  "Additional Questions",
]

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"]
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const APPLICATION_DEADLINE = new Date('2026-08-01T00:00:00Z')

interface VidyalaApplicationFormProps {
  onClose: () => void
}

export function VidyalaApplicationForm({ onClose }: VidyalaApplicationFormProps) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [uploadingId, setUploadingId] = useState(false)
  const [uploadingDbs, setUploadingDbs] = useState(false)
  const [idUploadError, setIdUploadError] = useState("")
  const [dbsUploadError, setDbsUploadError] = useState("")

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    email: "",
    phone: "",
    address: "",
    id_document_url: "",
    has_dbs_check: "" as "" | "yes" | "no",
    dbs_certificate_url: "",
    emergency_contact_1_name: "",
    emergency_contact_1_relationship: "",
    emergency_contact_1_phone: "",
    emergency_contact_2_name: "",
    emergency_contact_2_relationship: "",
    emergency_contact_2_phone: "",
    is_amritdhari: "" as "" | "yes" | "no",
    sikhi_journey: "",
    english_ability: "",
    panjabi_ability: "",
    can_commit: "" as "" | "yes" | "no",
    funding_option: "",
    accommodation_option: "",
    requires_visa: "" as "" | "yes" | "no",
    requires_visa_support: "" as "" | "yes" | "no",
    motivation: "",
    current_seva: "",
    what_to_learn: "",
    continue_parchaar: "" as "" | "yes" | "no",
    how_heard: "",
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const NAVY = "#1E3461"
  const GOLD = "#F5A623"
  const WARM_BG = "#FFF8EE"

  async function uploadFile(file: File, type: "id" | "dbs"): Promise<string | null> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      const msg = "File type not supported. Use JPG, PNG, PDF, HEIC or WebP."
      type === "id" ? setIdUploadError(msg) : setDbsUploadError(msg)
      return null
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const msg = "File is too large. Maximum size is 10MB."
      type === "id" ? setIdUploadError(msg) : setDbsUploadError(msg)
      return null
    }
    type === "id" ? setIdUploadError("") : setDbsUploadError("")
    type === "id" ? setUploadingId(true) : setUploadingDbs(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("initiative_slug", "sikhi-vidyala")
      const res = await fetch("/api/camp-applications/upload-id", { method: "POST", body: fd })
      if (!res.ok) {
        const msg = "Upload failed. Please try again."
        type === "id" ? setIdUploadError(msg) : setDbsUploadError(msg)
        return null
      }
      const json = await res.json()
      return (json.file_path ?? json.path) as string
    } finally {
      type === "id" ? setUploadingId(false) : setUploadingDbs(false)
    }
  }

  async function handleIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const path = await uploadFile(file, "id")
    if (path) set("id_document_url", path)
  }

  async function handleDbsUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const path = await uploadFile(file, "dbs")
    if (path) set("dbs_certificate_url", path)
  }

  function validateStep(): string {
    switch (step) {
      case 1:
        if (!form.first_name.trim()) return "First name is required."
        if (!form.last_name.trim()) return "Last name is required."
        if (!form.date_of_birth) return "Date of birth is required."
        if (!EMAIL_REGEX.test(form.email.trim())) return "A valid email address is required."
        if (!form.phone.trim()) return "Phone number is required."
        if (!form.address.trim()) return "Address is required."
        break
      case 2:
        if (!form.id_document_url) return "Please upload a photo ID document."
        break
      case 3:
        if (!form.has_dbs_check) return "Please select whether you have a DBS check."
        if (form.has_dbs_check === "yes" && !form.dbs_certificate_url) return "Please upload your DBS certificate."
        break
      case 4:
        if (!form.emergency_contact_1_name.trim()) return "Emergency contact 1 name is required."
        if (!form.emergency_contact_1_relationship.trim()) return "Emergency contact 1 relationship is required."
        if (!form.emergency_contact_1_phone.trim()) return "Emergency contact 1 phone is required."
        break
      case 5:
        if (!form.is_amritdhari) return "Please indicate whether you are Amritdhari."
        if (!form.english_ability) return "Please select your English ability."
        if (!form.panjabi_ability) return "Please select your Panjabi ability."
        break
      case 6:
        if (!form.can_commit) return "Please indicate whether you can commit to the full programme."
        if (!form.funding_option) return "Please select a funding option."
        if (!form.accommodation_option) return "Please select an accommodation option."
        break
      case 7:
        if (!form.requires_visa) return "Please indicate whether you require a visa."
        if (form.requires_visa === "yes" && !form.requires_visa_support) return "Please indicate whether you need visa support."
        break
      case 8:
        if (!form.motivation.trim()) return "Please tell us your motivation for applying."
        if (!form.how_heard.trim()) return "Please tell us how you heard about the Vidyala."
        break
    }
    return ""
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError("")
    setStep((s) => s + 1)
  }

  function back() {
    setError("")
    setStep((s) => s - 1)
  }

  async function submit() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError("")
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        is_amritdhari: form.is_amritdhari === "yes",
        has_dbs_check: form.has_dbs_check === "yes",
        can_commit: form.can_commit === "yes",
        requires_visa: form.requires_visa === "yes",
        requires_visa_support: form.requires_visa_support === "yes",
        continue_parchaar: form.continue_parchaar === "yes",
        page_url: typeof window !== "undefined" ? window.location.href : "",
      }
      const res = await fetch("/api/vidyala-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Submission failed. Please try again.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const progressPct = Math.round((step / (STEPS.length - 1)) * 100)

  if (new Date() >= APPLICATION_DEADLINE) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${NAVY}15` }}>
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: NAVY }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>Applications Closed</h2>
          <p className="text-gray-600 mb-6">
            The application window for Sikhi Vidyala has now closed (31 July 2026). Please keep an eye out for future cohorts.
          </p>
          <Button onClick={onClose} className="w-full text-white font-semibold" style={{ backgroundColor: NAVY }}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16" style={{ color: GOLD }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>Application Submitted</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to the Sikhi Vidyala. Our team will review your application and be in touch. We aim to review applications as soon as possible. Please allow 2–3 weeks for correspondence regarding the status of your application.
          </p>
          <Button onClick={onClose} className="w-full text-white font-semibold" style={{ backgroundColor: NAVY }}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0 rounded-t-2xl" style={{ backgroundColor: NAVY }}>
          <Image src="/logos/vidyala-logo.jpg" alt="Sikhi Vidyala" width={40} height={40} className="rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Sikhi Vidyala</p>
            <p className="text-white font-bold text-base truncate">{STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition p-1 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 shrink-0">
          <div className="h-full transition-all duration-300" style={{ width: `${progressPct}%`, backgroundColor: GOLD }} />
        </div>
        <p className="text-xs text-gray-400 px-6 pt-2 shrink-0">Step {step + 1} of {STEPS.length}</p>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Step 0: Important Information */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl p-5" style={{ backgroundColor: "#FFF8EE", border: `2px solid ${GOLD}` }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: NAVY }}>Before you apply, please read:</h3>
                <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                  <li>This application is for the Sikhi Vidyala programme run by Devanhaar.</li>
                  <li>All applicants must be 18 or over.</li>
                  <li>You will need to upload a valid photo ID document.</li>
                  <li>A DBS check certificate is welcomed but not required.</li>
                  <li>All information provided will be kept confidential and used only for this application.</li>
                  <li>Applications are reviewed by our team — we will contact you by email once a decision has been made.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Enter your first name" />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} placeholder="Enter your middle name" />
                </div>
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Enter your last name" />
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+44 7700 000000" />
              </div>
              <div>
                <Label>Address *</Label>
                <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Address, City, County, Post/Zip Code, Country" rows={3} />
              </div>
            </div>
          )}

          {/* Step 2: Photo ID */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Please upload a clear photo or scan of a valid photo ID (passport, driving licence, etc.). Maximum 10MB. Accepted: JPG, PNG, PDF, HEIC, WebP.</p>
              <div>
                <Label>Photo ID Document *</Label>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"
                  onChange={handleIdUpload}
                  disabled={uploadingId}
                  className="cursor-pointer"
                />
                {uploadingId && <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</p>}
                {idUploadError && <p className="text-sm text-red-600 mt-1">{idUploadError}</p>}
                {form.id_document_url && !idUploadError && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Document uploaded successfully
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: DBS Check */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">A valid DBS (Disclosure and Barring Service) check is welcomed. If you have one, please indicate and upload a copy.</p>
              <div>
                <Label>Do you have a valid DBS within the last 2 years? (If you are not a UK citizen, this would be your country's equivalent of a criminal record background check)? *</Label>
                <div className="flex gap-4 mt-2">
                  {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="has_dbs_check"
                        value={v}
                        checked={form.has_dbs_check === v}
                        onChange={() => set("has_dbs_check", v)}
                        className="accent-[#F5A623]"
                      />
                      <span className="text-sm capitalize">{v === "yes" ? "Yes, I have one" : "No"}</span>
                    </label>
                  ))}
                </div>
              </div>
              {form.has_dbs_check === "yes" && (
                <div>
                  <Label>If you answered 'Yes' to the previous question, please attach a copy of your valid DBS / foreign background check certificate below *</Label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"
                    onChange={handleDbsUpload}
                    disabled={uploadingDbs}
                    className="cursor-pointer"
                  />
                  {uploadingDbs && <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</p>}
                  {dbsUploadError && <p className="text-sm text-red-600 mt-1">{dbsUploadError}</p>}
                  {form.dbs_certificate_url && !dbsUploadError && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Certificate uploaded successfully
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Emergency Contacts */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3" style={{ color: NAVY }}>Emergency Contact 1 *</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={form.emergency_contact_1_name} onChange={(e) => set("emergency_contact_1_name", e.target.value)} placeholder="Enter name" />
                  </div>
                  <div>
                    <Label>Relationship *</Label>
                    <Input value={form.emergency_contact_1_relationship} onChange={(e) => set("emergency_contact_1_relationship", e.target.value)} placeholder="Enter relationship" />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input type="tel" value={form.emergency_contact_1_phone} onChange={(e) => set("emergency_contact_1_phone", e.target.value)} placeholder="+44 7700 000000" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: NAVY }}>Emergency Contact 2 <span className="font-normal text-gray-400 text-sm">(optional)</span></h3>
                <div className="space-y-3 mt-3">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={form.emergency_contact_2_name} onChange={(e) => set("emergency_contact_2_name", e.target.value)} placeholder="Enter name" />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Input value={form.emergency_contact_2_relationship} onChange={(e) => set("emergency_contact_2_relationship", e.target.value)} placeholder="Enter relationship" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" value={form.emergency_contact_2_phone} onChange={(e) => set("emergency_contact_2_phone", e.target.value)} placeholder="+44 7700 000000" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Sikhi Journey */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <Label>Are you Amritdhari? *</Label>
                <div className="flex gap-4 mt-2">
                  {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="is_amritdhari" value={v} checked={form.is_amritdhari === v} onChange={() => set("is_amritdhari", v)} className="accent-[#F5A623]" />
                      <span className="text-sm capitalize">{v === "yes" ? "Yes" : "No"}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Please briefly tell us where you are in your journey of Sikhi. *</Label>
                <Textarea value={form.sikhi_journey} onChange={(e) => set("sikhi_journey", e.target.value)} placeholder="Enter text here" rows={4} />
              </div>
              <div>
                <Label>What is your English speaking ability? *</Label>
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { v: "elementary", l: "Elementary" },
                    { v: "limited", l: "Limited" },
                    { v: "professional", l: "Professional" },
                    { v: "native", l: "Native/tongue" },
                  ].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="english_ability" value={v} checked={form.english_ability === v} onChange={() => set("english_ability", v)} className="accent-[#F5A623]" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>What is your Panjabi/Gurmukhi reading ability? *</Label>
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { v: "elementary", l: "Elementary" },
                    { v: "limited", l: "Limited" },
                    { v: "professional", l: "Professional" },
                    { v: "native", l: "Native/tongue" },
                  ].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="panjabi_ability" value={v} checked={form.panjabi_ability === v} onChange={() => set("panjabi_ability", v)} className="accent-[#F5A623]" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Commitment & Practical */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <Label>The Vidyala requires you to commit 6 months of seva and activities to attend in-farm as well as some weekends and weekend evenings. Are you able to make this commitment? *</Label>
                <div className="flex gap-4 mt-2">
                  {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="can_commit" value={v} checked={form.can_commit === v} onChange={() => set("can_commit", v)} className="accent-[#F5A623]" />
                      <span className="text-sm capitalize">{v === "yes" ? "Yes" : "No"}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Are you able to fund the fee of £795 or will you require financial support from the Vidyala? *</Label>
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { v: "self_funded", l: "I will be able to fund it myself" },
                    { v: "full_support", l: "I will require financial support from Devanhaar" },
                  ].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="funding_option" value={v} checked={form.funding_option === v} onChange={() => set("funding_option", v)} className="accent-[#F5A623]" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>For those living outside of Birmingham (UK), will you require accommodation? *</Label>
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { v: "provided", l: "Yes, I will need accommodation arranged/funded" },
                    { v: "local", l: "No, I live in Birmingham" },
                    { v: "own", l: "No, I will arrange/fund my own accommodation" },
                  ].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="accommodation_option" value={v} checked={form.accommodation_option === v} onChange={() => set("accommodation_option", v)} className="accent-[#F5A623]" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Visa */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <Label>Are you making a trip to attend the Vidyala? (Note that the Vidyala cannot sponsor students but can send a supporting letter if required.) *</Label>
                <div className="flex gap-4 mt-2">
                  {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="requires_visa" value={v} checked={form.requires_visa === v} onChange={() => set("requires_visa", v)} className="accent-[#F5A623]" />
                      <span className="text-sm capitalize">{v === "yes" ? "Yes" : "No"}</span>
                    </label>
                  ))}
                </div>
              </div>
              {form.requires_visa === "yes" && (
                <div>
                  <Label>Do you require support from the Vidyala to apply for your visa application? *</Label>
                  <div className="flex gap-4 mt-2">
                    {["yes", "no"].map((v) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="requires_visa_support" value={v} checked={form.requires_visa_support === v} onChange={() => set("requires_visa_support", v)} className="accent-[#F5A623]" />
                        <span className="text-sm capitalize">{v === "yes" ? "Yes please" : "No, I will sort it myself"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {form.requires_visa === "no" && (
                <p className="text-sm text-gray-500 rounded-lg p-3 bg-gray-50">No visa is required — you are all set for this section.</p>
              )}
            </div>
          )}

          {/* Step 8: Additional Questions */}
          {step === 8 && (
            <div className="space-y-4">
              <div>
                <Label>What is your main motivation for joining the Vidyala? *</Label>
                <Textarea value={form.motivation} onChange={(e) => set("motivation", e.target.value)} placeholder="Enter text here" rows={3} />
              </div>
              <div>
                <Label>What current seva/s are you involved in? (If any) *</Label>
                <Textarea value={form.current_seva} onChange={(e) => set("current_seva", e.target.value)} placeholder="Enter text here" rows={2} />
              </div>
              <div>
                <Label>Is there anything specific you are looking to learn or takeaway from the Vidyala?</Label>
                <Textarea value={form.what_to_learn} onChange={(e) => set("what_to_learn", e.target.value)} placeholder="Enter text here" rows={2} />
              </div>
              <div>
                <Label>Would you be looking to continue more seva after the Vidyala finished?</Label>
                <div className="flex gap-4 mt-2">
                  {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="continue_parchaar" value={v} checked={form.continue_parchaar === v} onChange={() => set("continue_parchaar", v)} className="accent-[#F5A623]" />
                      <span className="text-sm capitalize">{v === "yes" ? "Yes" : "No"}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>How did you hear about the Vidyala?</Label>
                <Input value={form.how_heard} onChange={(e) => set("how_heard", e.target.value)} placeholder="Enter text here" />
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          {step > 0 ? (
            <Button variant="ghost" onClick={back} className="gap-1 text-gray-600">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <Button
              onClick={next}
              className="gap-1 text-white"
              style={{ backgroundColor: NAVY }}
              disabled={uploadingId || uploadingDbs}
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              className="gap-1 text-white font-semibold px-6"
              style={{ backgroundColor: NAVY }}
              disabled={submitting || uploadingId || uploadingDbs}
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

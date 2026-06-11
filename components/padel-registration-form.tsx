"use client"

import React, { useEffect, useRef, useState } from "react"
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
const MAX_ID_UPLOAD_MB = 10

const ID_DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "driving-licence", label: "Driving Licence" },
]

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
  const [successTitle, setSuccessTitle] = useState("Registration received")
  const [successMessage, setSuccessMessage] = useState(
    "Your registration has been received successfully."
  )
  const [error, setError] = useState("")
  const [uploadingId, setUploadingId] = useState(false)
  const [idUploadError, setIdUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState({
    captain_first_name: "",
    captain_last_name: "",
    captain_date_of_birth: "",
    captain_email: "",
    captain_phone: "",
    city_country: "",
    playtomic_id: "",
    occupation: "",
    id_document_type: "",
    id_document_url: "",
    player2_first_name: "",
    player2_last_name: "",
    player2_date_of_birth: "",
    consent_email: "yes",
    consent_phone: "yes",
    consent_sms: "yes",
    consent_whatsapp: "yes",
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
    if (!NAME_REGEX.test(form.captain_first_name.trim())) return false
    if (!NAME_REGEX.test(form.captain_last_name.trim())) return false
    if (!form.captain_date_of_birth) return false
    if (!EMAIL_REGEX.test(form.captain_email.trim())) return false
    if (!PHONE_REGEX.test(form.captain_phone.trim())) return false
    if (form.city_country.trim().length < 2) return false
    if (form.playtomic_id.trim().length < 1) return false
    if (form.occupation.trim().length < 2) return false
    if (!form.id_document_type) return false
    if (!form.id_document_url) return false
    if (!NAME_REGEX.test(form.player2_first_name.trim())) return false
    if (!NAME_REGEX.test(form.player2_last_name.trim())) return false
    if (!form.player2_date_of_birth) return false
    return true
  }

  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdUploadError("")
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_ID_UPLOAD_MB * 1024 * 1024) {
      setIdUploadError("File is too large. Maximum allowed size is " + MAX_ID_UPLOAD_MB + "MB.")
      return
    }
    setUploadingId(true)
    try {
      const data = new FormData()
      data.append("file", file)
      data.append("initiative_slug", initiativeSlug)
      const res = await fetch("/api/padel-registrations/upload-id", {
        method: "POST",
        body: data,
      })
      let json = null
      try {
        json = await res.json()
      } catch {
        setIdUploadError("Upload failed (server returned " + res.status + "). Please try again.")
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

  const handleSubmit = async () => {
    setError("")
    if (!isValid()) {
      setError("Please complete all required fields, including photo ID, before submitting.")
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
        setSuccessTitle(data.title || "Registration received")
        setSuccessMessage(
          data.message || "Your registration has been received successfully."
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
              Player registration
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Register your pair</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Padel is played in pairs. Complete your details and your partner&apos;s name below.
              The entry fee is £50 per player (£100 per pair), authorised securely and only taken
              once your place is confirmed.
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
          {/* Your details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your details</h3>
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
                <Label htmlFor="captain_date_of_birth">Date of birth *</Label>
                <Input id="captain_date_of_birth" type="date" value={form.captain_date_of_birth} onChange={(e) => update("captain_date_of_birth", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="city_country">City / Country *</Label>
                <Input id="city_country" value={form.city_country} onChange={(e) => update("city_country", e.target.value)} placeholder="e.g. London, UK" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="captain_email">Email *</Label>
                <Input id="captain_email" type="email" value={form.captain_email} onChange={(e) => update("captain_email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="captain_phone">Mobile number *</Label>
                <Input id="captain_phone" type="tel" value={form.captain_phone} onChange={(e) => update("captain_phone", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="playtomic_id">Playtomic ID *</Label>
                <Input id="playtomic_id" value={form.playtomic_id} onChange={(e) => update("playtomic_id", e.target.value)} placeholder="Your Playtomic username / ID" />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation *</Label>
                <Input id="occupation" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Photo ID */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Photo ID verification</h3>
            <p className="text-sm text-muted-foreground">
              We verify each player&apos;s identity. Please select your ID type and upload a clear photo or scan.
            </p>
            <div>
              <Label htmlFor="id_document_type">Form of ID *</Label>
              <Select value={form.id_document_type} onValueChange={(v) => update("id_document_type", v)}>
                <SelectTrigger id="id_document_type">
                  <SelectValue placeholder="Select your ID type" />
                </SelectTrigger>
                <SelectContent>
                  {ID_DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Upload ID document * (JPG, PNG, WEBP, HEIC or PDF — max {MAX_ID_UPLOAD_MB}MB)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"
                onChange={handleIdFileChange}
                className="mt-1.5 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-[hsl(43,100%,29%)]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[hsl(43,100%,29%)] hover:file:bg-[hsl(43,100%,29%)]/20"
              />
              {uploadingId ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </p>
              ) : form.id_document_url ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> ID uploaded
                </p>
              ) : null}
              {idUploadError ? (
                <p className="mt-2 text-sm font-medium text-red-600">{idUploadError}</p>
              ) : null}
            </div>
          </div>

          {/* Partner */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your partner</h3>
            <p className="text-sm text-muted-foreground">We only need your partner&apos;s name and date of birth.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_first_name">Partner first name *</Label>
                <Input id="player2_first_name" value={form.player2_first_name} onChange={(e) => update("player2_first_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="player2_last_name">Partner last name *</Label>
                <Input id="player2_last_name" value={form.player2_last_name} onChange={(e) => update("player2_last_name", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_date_of_birth">Partner date of birth *</Label>
                <Input id="player2_date_of_birth" type="date" value={form.player2_date_of_birth} onChange={(e) => update("player2_date_of_birth", e.target.value)} />
              </div>
              <div />
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact preferences</h3>
            <p className="text-sm text-muted-foreground">
              We will use these to send you event details and updates. Untick any you do not want.
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
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}

          <div className="flex items-center gap-4 pt-2">
            <Button onClick={handleSubmit} disabled={submitting || uploadingId || !isValid()} className="rounded-full px-6">
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

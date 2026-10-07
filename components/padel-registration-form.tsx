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
import { CheckCircle2, HelpCircle, Loader2, X } from "lucide-react"
import type { PublicPadelEvent } from "@/lib/padel-public-event"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[a-zA-Z\s'\-]{2,50}$/
const PHONE_CHARS_REGEX = /^[\d\s\-()]+$/

const COUNTRY_CODES = [
  { code: "+44", label: "UK", flag: "🇬🇧" },
  { code: "+31", label: "NL", flag: "🇳🇱" },
  { code: "+353", label: "IE", flag: "🇮🇪" },
  { code: "+1", label: "US/CA", flag: "🇺🇸" },
  { code: "+33", label: "FR", flag: "🇫🇷" },
  { code: "+49", label: "DE", flag: "🇩🇪" },
  { code: "+34", label: "ES", flag: "🇪🇸" },
  { code: "+39", label: "IT", flag: "🇮🇹" },
  { code: "+32", label: "BE", flag: "🇧🇪" },
  { code: "+41", label: "CH", flag: "🇨🇭" },
  { code: "+351", label: "PT", flag: "🇵🇹" },
  { code: "+45", label: "DK", flag: "🇩🇰" },
  { code: "+46", label: "SE", flag: "🇸🇪" },
  { code: "+47", label: "NO", flag: "🇳🇴" },
  { code: "+358", label: "FI", flag: "🇫🇮" },
  { code: "+48", label: "PL", flag: "🇵🇱" },
  { code: "+420", label: "CZ", flag: "🇨🇿" },
  { code: "+43", label: "AT", flag: "🇦🇹" },
  { code: "+30", label: "GR", flag: "🇬🇷" },
  { code: "+90", label: "TR", flag: "🇹🇷" },
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+966", label: "SA", flag: "🇸🇦" },
  { code: "+91", label: "IN", flag: "🇮🇳" },
  { code: "+92", label: "PK", flag: "🇵🇰" },
  { code: "+65", label: "SG", flag: "🇸🇬" },
  { code: "+60", label: "MY", flag: "🇲🇾" },
  { code: "+61", label: "AU", flag: "🇦🇺" },
  { code: "+64", label: "NZ", flag: "🇳🇿" },
  { code: "+27", label: "ZA", flag: "🇿🇦" },
] as const

function phoneDigits(value: string) {
  return value.replace(/\D/g, "")
}

function internationalPhone(countryCode: string, localNumber: string) {
  const localDigits = phoneDigits(localNumber).replace(/^0+/, "")
  return `${countryCode}${localDigits}`
}

function validInternationalPhone(countryCode: string, localNumber: string) {
  if (!PHONE_CHARS_REGEX.test(localNumber.trim())) return false
  const digits = phoneDigits(internationalPhone(countryCode, localNumber))
  return digits.length >= 8 && digits.length <= 15
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

interface PadelRegistrationFormProps {
  initiativeSlug?: string
  event: PublicPadelEvent
  onClose: () => void
}

export function PadelRegistrationForm({
  initiativeSlug = "sikh-padel-association",
  event,
  onClose,
}: PadelRegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successTitle, setSuccessTitle] = useState("Registration received")
  const [successMessage, setSuccessMessage] = useState(
    "Your registration has been received successfully."
  )
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [captainPhoneCountry, setCaptainPhoneCountry] = useState("+44")
  const [partnerPhoneCountry, setPartnerPhoneCountry] = useState("+44")
  const [form, setForm] = useState({
    captain_first_name: "",
    captain_last_name: "",
    captain_date_of_birth: "",
    captain_email: "",
    captain_phone: "",
    city_country: "",
    playtomic_id: "",
    occupation: "",
    captain_gender: "",
    captain_playtomic_ranking: "",
    id_document_type: "",
    id_document_url: "",
    player2_first_name: "",
    player2_last_name: "",
    player2_date_of_birth: "",
    player2_phone: "",
    player2_playtomic_id: "",
    player2_occupation: "",
    player2_gender: "",
    player2_playtomic_ranking: "",
    player2_id_document_type: "",
    player2_id_document_url: "",
    consent_email: "no",
    consent_phone: "no",
    consent_sms: "no",
    consent_whatsapp: "no",
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

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const toggleConsent = (field: string) =>
    setForm((prev) => ({ ...prev, [field]: prev[field as keyof typeof prev] === "yes" ? "no" : "yes" }))

  const validateField = (field: string): string => {
    const value = form[field as keyof typeof form]

    switch (field) {
      case "captain_first_name":
      case "captain_last_name":
      case "player2_first_name":
      case "player2_last_name":
        return NAME_REGEX.test(String(value).trim()) ? "" : "Enter a valid name (2–50 letters)."
      case "captain_date_of_birth":
      case "player2_date_of_birth":
        return value ? "" : "Date of birth is required."
      case "captain_email":
        return EMAIL_REGEX.test(String(value).trim())
          ? ""
          : "Enter a valid email address, including @ and a domain."
      case "captain_phone":
        return validInternationalPhone(captainPhoneCountry, String(value))
          ? ""
          : "Enter a valid mobile number (8–15 digits including country code)."
      case "player2_phone":
        return validInternationalPhone(partnerPhoneCountry, String(value))
          ? ""
          : "Enter a valid mobile number (8–15 digits including country code)."
      case "city_country":
        return String(value).trim().length >= 2 ? "" : "City / country is required."
      case "playtomic_id":
      case "player2_playtomic_id":
        return String(value).trim() ? "" : "Playtomic ID is required."
      case "occupation":
      case "player2_occupation":
        return String(value).trim().length >= 2 ? "" : "Occupation is required."
      case "captain_gender":
      case "player2_gender":
        return value ? "" : "Please select a gender option."
      default:
        return ""
    }
  }

  const requiredFields = [
    "captain_first_name",
    "captain_last_name",
    "captain_date_of_birth",
    "captain_email",
    "captain_phone",
    "city_country",
    "playtomic_id",
    "occupation",
    "captain_gender",
    "player2_first_name",
    "player2_last_name",
    "player2_date_of_birth",
    "player2_phone",
    "player2_playtomic_id",
    "player2_occupation",
    "player2_gender",
  ]

  const validateAll = () => {
    const nextErrors: Record<string, string> = {}
    for (const field of requiredFields) {
      const message = validateField(field)
      if (message) nextErrors[field] = message
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateOnBlur = (field: string) => {
    const message = validateField(field)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const errorClass = (field: string) =>
    fieldErrors[field] ? "border-red-500 focus-visible:ring-red-500" : ""

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null

  const PlaytomicHelp = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="What is Playtomic?"
            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">Playtomic</p>
          <p className="mt-1 text-xs">Join the community and book courts online in one app.</p>
          <a
            href="https://playtomic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs underline underline-offset-2"
          >
            Visit Playtomic
          </a>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const handleSubmit = async () => {
    setError("")
    if (!validateAll()) {
      setError("Please correct the highlighted fields before submitting.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/padel-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          captain_phone: internationalPhone(captainPhoneCountry, form.captain_phone),
          player2_phone: internationalPhone(partnerPhoneCountry, form.player2_phone),
          initiative_slug: initiativeSlug,
          tournament_id: event.id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.")
      } else {
        // Redirect to NowDonate for payment
        if (data.redirect_url) {
          window.location.href = data.redirect_url
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
    <section className="pt-4 pb-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-3">
              Player registration
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Register your pair</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Padel is played in pairs. Complete your details and your partner&apos;s name below.
              The {event.date} tournament takes place from {event.time} at {event.venue}, {event.address}. The entry fee is £{event.feePerPerson} per player (£{event.teamFee} per pair). Payment is processed securely via our donation manager.
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
                <Input id="captain_first_name" value={form.captain_first_name} onChange={(e) => update("captain_first_name", e.target.value)} onBlur={() => validateOnBlur("captain_first_name")} className={errorClass("captain_first_name")} aria-invalid={Boolean(fieldErrors.captain_first_name)} /><FieldError field="captain_first_name" />
              </div>
              <div>
                <Label htmlFor="captain_last_name">Last name *</Label>
                <Input id="captain_last_name" value={form.captain_last_name} onChange={(e) => update("captain_last_name", e.target.value)} onBlur={() => validateOnBlur("captain_last_name")} className={errorClass("captain_last_name")} aria-invalid={Boolean(fieldErrors.captain_last_name)} /><FieldError field="captain_last_name" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="captain_date_of_birth">Date of birth *</Label>
                <Input id="captain_date_of_birth" type="date" value={form.captain_date_of_birth} onChange={(e) => update("captain_date_of_birth", e.target.value)} onBlur={() => validateOnBlur("captain_date_of_birth")} className={errorClass("captain_date_of_birth")} aria-invalid={Boolean(fieldErrors.captain_date_of_birth)} /><FieldError field="captain_date_of_birth" />
              </div>
              <div>
                <Label htmlFor="city_country">City / Country *</Label>
                <Input id="city_country" value={form.city_country} onChange={(e) => update("city_country", e.target.value)} onBlur={() => validateOnBlur("city_country")} className={errorClass("city_country")} aria-invalid={Boolean(fieldErrors.city_country)} placeholder="e.g. London, UK" /><FieldError field="city_country" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="captain_email">Email *</Label>
                <Input id="captain_email" type="email" value={form.captain_email} onChange={(e) => update("captain_email", e.target.value)} onBlur={() => validateOnBlur("captain_email")} className={errorClass("captain_email")} aria-invalid={Boolean(fieldErrors.captain_email)} placeholder="name@example.com" /><FieldError field="captain_email" />
              </div>
              <div>
                <Label htmlFor="captain_phone">Mobile number *</Label>
                <div className="flex gap-2">
                  <Select
                    value={captainPhoneCountry}
                    onValueChange={(value) => {
                      setCaptainPhoneCountry(value)
                      setFieldErrors((prev) => ({ ...prev, captain_phone: "" }))
                    }}
                  >
                    <SelectTrigger className="w-[118px]" aria-label="Country calling code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code + country.label} value={country.code}>
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="captain_phone"
                    type="tel"
                    inputMode="tel"
                    value={form.captain_phone}
                    onChange={(e) => update("captain_phone", e.target.value)}
                    onBlur={() => validateOnBlur("captain_phone")}
                    className={errorClass("captain_phone")}
                    aria-invalid={Boolean(fieldErrors.captain_phone)}
                    placeholder="Mobile number"
                  />
                </div>
                <FieldError field="captain_phone" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center"><Label htmlFor="playtomic_id">Playtomic ID *</Label><PlaytomicHelp /></div>
                <Input id="playtomic_id" value={form.playtomic_id} onChange={(e) => update("playtomic_id", e.target.value)} onBlur={() => validateOnBlur("playtomic_id")} className={errorClass("playtomic_id")} aria-invalid={Boolean(fieldErrors.playtomic_id)} placeholder="Your Playtomic username / ID" /><FieldError field="playtomic_id" />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation *</Label>
                <Input id="occupation" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} onBlur={() => validateOnBlur("occupation")} className={errorClass("occupation")} aria-invalid={Boolean(fieldErrors.occupation)} /><FieldError field="occupation" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="captain_gender">Gender *</Label>
                <Select value={form.captain_gender} onValueChange={(v) => update("captain_gender", v)}>
                  <SelectTrigger id="captain_gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="captain_gender" />
              </div>
              <div>
                <Label htmlFor="captain_playtomic_ranking">Playtomic ranking</Label>
                <Input id="captain_playtomic_ranking" value={form.captain_playtomic_ranking} onChange={(e) => update("captain_playtomic_ranking", e.target.value)} placeholder="e.g. 2.5" />
              </div>
            </div>
          </div>

          {/* Partner */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your partner</h3>
            <p className="text-sm text-muted-foreground">Please provide your partner&apos;s details below.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_first_name">Partner first name *</Label>
                <Input id="player2_first_name" value={form.player2_first_name} onChange={(e) => update("player2_first_name", e.target.value)} onBlur={() => validateOnBlur("player2_first_name")} className={errorClass("player2_first_name")} aria-invalid={Boolean(fieldErrors.player2_first_name)} /><FieldError field="player2_first_name" />
              </div>
              <div>
                <Label htmlFor="player2_last_name">Partner last name *</Label>
                <Input id="player2_last_name" value={form.player2_last_name} onChange={(e) => update("player2_last_name", e.target.value)} onBlur={() => validateOnBlur("player2_last_name")} className={errorClass("player2_last_name")} aria-invalid={Boolean(fieldErrors.player2_last_name)} /><FieldError field="player2_last_name" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_date_of_birth">Partner date of birth *</Label>
                <Input id="player2_date_of_birth" type="date" value={form.player2_date_of_birth} onChange={(e) => update("player2_date_of_birth", e.target.value)} onBlur={() => validateOnBlur("player2_date_of_birth")} className={errorClass("player2_date_of_birth")} aria-invalid={Boolean(fieldErrors.player2_date_of_birth)} /><FieldError field="player2_date_of_birth" />
              </div>
              <div>
                <Label htmlFor="player2_phone">Partner mobile number *</Label>
                <div className="flex gap-2">
                  <Select
                    value={partnerPhoneCountry}
                    onValueChange={(value) => {
                      setPartnerPhoneCountry(value)
                      setFieldErrors((prev) => ({ ...prev, player2_phone: "" }))
                    }}
                  >
                    <SelectTrigger className="w-[118px]" aria-label="Partner country calling code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code + country.label} value={country.code}>
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="player2_phone"
                    type="tel"
                    inputMode="tel"
                    value={form.player2_phone}
                    onChange={(e) => update("player2_phone", e.target.value)}
                    onBlur={() => validateOnBlur("player2_phone")}
                    className={errorClass("player2_phone")}
                    aria-invalid={Boolean(fieldErrors.player2_phone)}
                    placeholder="Mobile number"
                  />
                </div>
                <FieldError field="player2_phone" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center"><Label htmlFor="player2_playtomic_id">Partner Playtomic ID *</Label><PlaytomicHelp /></div>
                <Input id="player2_playtomic_id" value={form.player2_playtomic_id} onChange={(e) => update("player2_playtomic_id", e.target.value)} onBlur={() => validateOnBlur("player2_playtomic_id")} className={errorClass("player2_playtomic_id")} aria-invalid={Boolean(fieldErrors.player2_playtomic_id)} placeholder="Partner Playtomic username / ID" /><FieldError field="player2_playtomic_id" />
              </div>
              <div>
                <Label htmlFor="player2_occupation">Partner occupation *</Label>
                <Input id="player2_occupation" value={form.player2_occupation} onChange={(e) => update("player2_occupation", e.target.value)} onBlur={() => validateOnBlur("player2_occupation")} className={errorClass("player2_occupation")} aria-invalid={Boolean(fieldErrors.player2_occupation)} /><FieldError field="player2_occupation" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="player2_gender">Partner gender *</Label>
                <Select value={form.player2_gender} onValueChange={(v) => update("player2_gender", v)}>
                  <SelectTrigger id="player2_gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError field="player2_gender" />
              </div>
              <div>
                <Label htmlFor="player2_playtomic_ranking">Partner Playtomic ranking</Label>
                <Input id="player2_playtomic_ranking" value={form.player2_playtomic_ranking} onChange={(e) => update("player2_playtomic_ranking", e.target.value)} placeholder="e.g. 2.5" />
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact preferences</h3>
            <p className="text-sm text-muted-foreground">
              Tick any you are happy for us to use to send you event details and updates.
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

          {/* GDPR consent */}
          <p className="text-xs text-muted-foreground">
            By submitting this form, I confirm that I have read and understood the{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Privacy Policy
            </a>{" "}
            and acknowledge that my personal information will be collected, processed and stored in accordance with that policy and applicable{" "}
            <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              UK data protection laws
            </a>.
          </p>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}

          <div className="flex items-center gap-4 pt-2">
            <Button onClick={handleSubmit} disabled={submitting} className="rounded-full px-6">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                "Register & continue to payment"
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

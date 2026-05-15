"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_EXT = ["pdf", "doc", "docx"]

type UploadField = "cv" | "cover_letter" | "portfolio"

async function uploadToStorage(
  vacancyId: string,
  field: UploadField,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error(`${field.replace("_", " ")} must be PDF, DOC or DOCX`)
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${field.replace("_", " ")} must be under 5MB`)
  }

  const res = await fetch("/api/careers/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vacancy_id: vacancyId,
      field,
      filename: file.name,
      size: file.size,
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.path || !json.token) {
    throw new Error(json.error || `Failed to prepare ${field.replace("_", " ")} upload`)
  }

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(json.bucket)
    .uploadToSignedUrl(json.path, json.token, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })
  if (error) {
    console.error("[Careers Form] storage upload failed:", error)
    throw new Error(`Failed to upload ${field.replace("_", " ")}`)
  }
  return json.path as string
}

export interface ApplicationConfig {
  ask_dob?: boolean
  ask_right_to_work?: boolean
  ask_filming_equipment?: boolean
  ask_travel_events?: boolean
  ask_in_person_meetings?: boolean
  require_portfolio?: boolean
  allow_cover_letter_upload?: boolean
}

interface Props {
  vacancyId: string
  vacancyTitle: string
  config?: ApplicationConfig | null
}

const DEFAULT_CONFIG: ApplicationConfig = {
  ask_dob: false,
  ask_right_to_work: true,
  ask_filming_equipment: false,
  ask_travel_events: false,
  ask_in_person_meetings: false,
  require_portfolio: false,
  allow_cover_letter_upload: true,
}

export function CareersApplyForm({ vacancyId, vacancyTitle, config }: Props) {
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) }
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvName, setCvName] = useState<string | null>(null)
  const [coverName, setCoverName] = useState<string | null>(null)
  const [portfolioName, setPortfolioName] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)
      if (fd.get("company")) {
        setSuccess(true)
        return
      }

      let cvPath: string | null = null
      let coverPath: string | null = null
      let portfolioPath: string | null = null

      if (cvFile) {
        setProgress("Uploading CV...")
        cvPath = await uploadToStorage(vacancyId, "cv", cvFile)
      }
      if (coverFile) {
        setProgress("Uploading cover letter...")
        coverPath = await uploadToStorage(vacancyId, "cover_letter", coverFile)
      }
      if (portfolioFile) {
        setProgress("Uploading portfolio...")
        portfolioPath = await uploadToStorage(vacancyId, "portfolio", portfolioFile)
      }

      setProgress("Submitting application...")
      const payload: Record<string, unknown> = {
        vacancy_id: vacancyId,
        first_name: fd.get("first_name"),
        last_name: fd.get("last_name"),
        date_of_birth: fd.get("date_of_birth"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        linkedin_url: fd.get("linkedin_url"),
        right_to_work_uk: fd.get("right_to_work_uk"),
        has_filming_equipment: fd.get("has_filming_equipment"),
        can_attend_in_person: fd.get("can_attend_in_person"),
        can_travel_events: fd.get("can_travel_events"),
        cover_letter: fd.get("cover_letter"),
        consent: fd.get("consent") === "on" || fd.get("consent") === "true",
        cv_path: cvPath,
        cover_letter_path: coverPath,
        portfolio_path: portfolioPath,
      }

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to submit application")
      setSuccess(true)
      formRef.current?.reset()
      setCvFile(null)
      setCoverFile(null)
      setPortfolioFile(null)
      setCvName(null)
      setCoverName(null)
      setPortfolioName(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
      setProgress(null)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 mb-1">Application received</h3>
        <p className="text-sm text-green-800">
          Thank you for applying for <strong>{vacancyTitle}</strong>. We&apos;ve sent a
          confirmation to your email and will be in touch within 7 days.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Candidate information
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="first_name">First name *</Label>
            <Input id="first_name" name="first_name" required autoComplete="given-name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name">Last name *</Label>
            <Input id="last_name" name="last_name" required autoComplete="family-name" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cfg.ask_dob && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="date_of_birth">Date of birth</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" autoComplete="bday" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone number *</Label>
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address *</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="linkedin_url">LinkedIn (optional)</Label>
            <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
      </fieldset>

      {(cfg.ask_right_to_work || cfg.ask_filming_equipment || cfg.ask_travel_events || cfg.ask_in_person_meetings) && (
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Eligibility
          </legend>
          {cfg.ask_right_to_work && (
            <YesNoQuestion name="right_to_work_uk" required label="Do you have the right to work in the UK?" />
          )}
          {cfg.ask_filming_equipment && (
            <YesNoQuestion name="has_filming_equipment" label="Do you have access to filming equipment?" />
          )}
          {cfg.ask_in_person_meetings && (
            <YesNoQuestion name="can_attend_in_person" label="Are you able to attend in-person meetings/events when required?" />
          )}
          {cfg.ask_travel_events && (
            <YesNoQuestion name="can_travel_events" label="Are you able to travel for events/content shoots?" />
          )}
        </fieldset>
      )}

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Tell us about you
        </legend>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cover_letter">Why do you want this role? (optional)</Label>
          <Textarea
            id="cover_letter"
            name="cover_letter"
            rows={5}
            placeholder="A short paragraph about you and why this role is a fit..."
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Supporting documents
        </legend>
        <p className="text-xs text-muted-foreground -mt-2">
          Supported formats: PDF, DOC, DOCX (max 5MB each).
        </p>

        <FileField
          id="cv"
          name="cv"
          label="CV / Resume"
          fileName={cvName}
          onChange={(f) => {
            setCvFile(f)
            setCvName(f?.name ?? null)
          }}
        />

        {cfg.allow_cover_letter_upload && (
          <FileField
            id="cover_letter_file"
            name="cover_letter_file"
            label="Cover letter (optional)"
            fileName={coverName}
            onChange={(f) => {
              setCoverFile(f)
              setCoverName(f?.name ?? null)
            }}
          />
        )}

        {cfg.require_portfolio && (
          <FileField
            id="portfolio_file"
            name="portfolio_file"
            label="Portfolio / examples of work *"
            helper="Required — applications without examples will not be considered."
            fileName={portfolioName}
            onChange={(f) => {
              setPortfolioFile(f)
              setPortfolioName(f?.name ?? null)
            }}
            required
          />
        )}
      </fieldset>

      <div className="flex items-start gap-2">
        <input id="consent" name="consent" type="checkbox" required className="mt-1" aria-label="Consent to data storage" />
        <Label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
          I consent to Devanhaar storing the information provided for the purpose
          of processing my application. I can request deletion at any time.
        </Label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {progress ?? "Submitting..."}
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  )
}

function YesNoQuestion({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-foreground">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <div className="flex items-center gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="radio" name={name} value="yes" required={required} /> Yes
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="radio" name={name} value="no" required={required} /> No
        </label>
      </div>
    </div>
  )
}

function FileField({
  id,
  name,
  label,
  helper,
  fileName,
  onChange,
  required,
}: {
  id: string
  name: string
  label: string
  helper?: string
  fileName: string | null
  onChange: (f: File | null) => void
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {helper && <p className="text-xs text-muted-foreground -mt-1">{helper}</p>}
      <label
        htmlFor={id}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-background hover:bg-muted cursor-pointer transition-colors"
      >
        <Upload className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {fileName ?? "Click to upload"}
        </span>
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept=".pdf,.doc,.docx"
        required={required}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2, Upload } from "lucide-react"

interface Props {
  vacancyId: string
  vacancyTitle: string
}

export function CareersApplyForm({ vacancyId, vacancyTitle }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)
      // honeypot
      if (fd.get("company")) {
        setSuccess(true)
        return
      }
      fd.set("vacancy_id", vacancyId)
      const res = await fetch("/api/careers/apply", { method: "POST", body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to submit application")
      setSuccess(true)
      formRef.current?.reset()
      setFileName(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Full name *</Label>
          <Input id="full_name" name="full_name" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="linkedin_url">LinkedIn (optional)</Label>
          <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cover_letter">Why do you want this role? *</Label>
        <Textarea id="cover_letter" name="cover_letter" rows={6} required placeholder="Tell us about yourself and why this role is a fit..." />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cv">CV / Resume (PDF or DOCX, max 5MB)</Label>
        <label htmlFor="cv" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-background hover:bg-muted cursor-pointer transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {fileName ?? "Click to upload your CV"}
          </span>
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>

      <div className="flex items-start gap-2">
        <input id="consent" name="consent" type="checkbox" required className="mt-1" />
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
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  )
}

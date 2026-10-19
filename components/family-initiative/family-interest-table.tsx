"use client"

import { deviceLabel } from '@/lib/booking-device'

import { CalendarDays, Download, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export type FamilyInterestSubmission = {
  id: string
  full_name: string
  email: string
  phone: string | null
  form_data: Record<string, unknown> | null
  created_at: string
}

function textValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  return String(value)
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function exportCsv(submissions: FamilyInterestSubmission[]) {
  const headers: string[] = ["Lead name", "Email", "Phone", "Interest / event", "Group size", "Device", "Submitted"]
  const rows: string[][] = submissions.map((submission) => {
    const data = submission.form_data || {}
    const interest = textValue(data.interest_for || data.event || data.project)
    const groupSize = textValue(data.number_of_people_in_group)
    return [
      submission.full_name,
      submission.email,
      submission.phone || "",
      interest === "—" ? "" : interest,
      groupSize === "—" ? "" : groupSize,
      deviceLabel(data.booking_device),
      new Date(submission.created_at).toLocaleString("en-GB"),
    ]
  })

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `family-interest-registrations-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function FamilyInterestTable({
  submissions,
  emptyLabel = "No interest registrations yet.",
}: {
  submissions: FamilyInterestSubmission[]
  emptyLabel?: string
}) {
  if (submissions.length === 0) {
    return <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{emptyLabel}</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => exportCsv(submissions)}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV ({submissions.length})
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-semibold">Lead contact</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Interest / event</th>
            <th className="px-4 py-3 font-semibold">Group size</th>
            <th className="px-4 py-3 font-semibold">Device</th>
            <th className="px-4 py-3 font-semibold">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {submissions.map((submission) => {
            const data = submission.form_data || {}
            return (
              <tr key={submission.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{submission.full_name}</td>
                <td className="px-4 py-3">
                  <a className="text-blue-600 hover:underline" href={`mailto:${submission.email}`}>{submission.email}</a>
                  <div className="mt-1 text-xs text-muted-foreground">{submission.phone || "No phone"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{textValue(data.interest_for || data.event || data.project)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{textValue(data.number_of_people_in_group)}</div>
                </td>
                <td className="px-4 py-3">{deviceLabel(data.booking_device)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(submission.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}

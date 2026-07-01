"use client"

import { useState } from "react"
import { format, differenceInYears, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import {
  confirmRootsBooking,
  declineRootsBooking,
  syncRootsPayment,
} from "@/app/dashboard/roots/actions"

type Booking = {
  id: string
  camper_first_name: string
  camper_last_name: string
  camper_dob: string
  camper_gender: string | null
  parent_first_name: string
  parent_last_name: string
  parent_relationship: string
  parent_email: string
  parent_phone: string
  accommodation_preference: string | null
  dietary_requirements: string | null
  medical_info: string | null
  emergency_name: string
  emergency_relationship: string
  emergency_phone: string
  how_did_you_hear: string | null
  additional_info: string | null
  status: string
  notes: string | null
  amount_due: number | null
  amount_paid: number | null
  payment_status: string
  paid_at: string | null
  stripe_payment_link: string | null
  stripe_payment_link_id: string | null
  created_at: string
}

// CSV helpers
function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function bookingsToCsv(bookings: Booking[]): string {
  const headers = [
    "ID", "Camper First", "Camper Last", "DOB", "Age", "Gender",
    "Parent Name", "Parent Email", "Parent Phone",
    "Accommodation", "Dietary", "Medical",
    "Emergency Name", "Emergency Phone",
    "How Heard", "Additional Info",
    "Status", "Payment Status", "Amount Due", "Amount Paid", "Paid At", "Submitted",
  ]
  const rows = bookings.map((b) => {
    const age = b.camper_dob ? differenceInYears(new Date(), parseISO(b.camper_dob)) : ""
    return [
      b.id, b.camper_first_name, b.camper_last_name, b.camper_dob, age, b.camper_gender ?? "",
      `${b.parent_first_name} ${b.parent_last_name}`, b.parent_email, b.parent_phone,
      b.accommodation_preference ?? "", b.dietary_requirements ?? "", b.medical_info ?? "",
      b.emergency_name, b.emergency_phone,
      b.how_did_you_hear ?? "", b.additional_info ?? "",
      b.status, b.payment_status, b.amount_due ?? "", b.amount_paid ?? "", b.paid_at ?? "",
      b.created_at,
    ].map(csvCell).join(",")
  })
  return "\uFEFF" + [headers.join(","), ...rows].join("\n")
}

function downloadCsv(bookings: Booking[]) {
  const blob = new Blob([bookingsToCsv(bookings)], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `roots-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    waitlisted: "bg-blue-100 text-blue-800",
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  )
}

export function RootsBookingsTable({ bookings }: { bookings: Booking[] }) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, { type: "success" | "error"; text: string }>>({})

  const pending = bookings.filter((b) => b.status === "pending").length
  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const declined = bookings.filter((b) => b.status === "declined").length

  function setMsg(id: string, type: "success" | "error", text: string) {
    setMessages((m) => ({ ...m, [id]: { type, text } }))
  }

  async function handleConfirm(b: Booking) {
    setLoading(b.id)
    try {
      await confirmRootsBooking(b.id, amt)
      setMsg(b.id, "success", `Confirmed. Payment email sent to ${b.parent_email}.`)
      setConfirming(null)
    } catch {
      setMsg(b.id, "error", "Something went wrong. Please try again.")
    }
    setLoading(null)
  }

  async function handleDecline(b: Booking) {
    if (!confirm(`Decline booking for ${b.camper_first_name} ${b.camper_last_name}?`)) return
    setLoading(b.id)
    try {
      await declineRootsBooking(b.id)
      setMsg(b.id, "success", "Declined. Email sent to parent.")
    } catch {
      setMsg(b.id, "error", "Something went wrong. Please try again.")
    }
    setLoading(null)
  }

  async function handleSync(b: Booking) {
    setLoading(b.id)
    try {
      const result = await syncRootsPayment(b.id)
      setMsg(b.id, result.paid ? "success" : "error",
        result.paid ? "Payment confirmed. Receipt email sent." : "No completed payment found yet.")
    } catch {
      setMsg(b.id, "error", "Sync failed.")
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats + export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-5 text-sm">
          <span><strong>{bookings.length}</strong> total</span>
          <span className="text-yellow-700"><strong>{pending}</strong> pending</span>
          <span className="text-green-700"><strong>{confirmed}</strong> confirmed</span>
          <span className="text-red-700"><strong>{declined}</strong> declined</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(bookings)}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Camper</th>
              <th className="text-left px-4 py-3 font-medium">Age</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Parent / Guardian</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Payment</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Submitted</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No booking requests yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => {
              const age = b.camper_dob
                ? differenceInYears(new Date(), parseISO(b.camper_dob))
                : null
              const isPending = b.status === "pending"
              const isConfirmedUnpaid = b.status === "confirmed" && b.payment_status !== "paid"
              const isLoading = loading === b.id
              const msg = messages[b.id]

              return (
                <>
                  <tr key={b.id} className="hover:bg-secondary/20 transition-colors align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium whitespace-nowrap">
                        {b.camper_first_name} {b.camper_last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{b.camper_dob}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {age != null ? `${age}y` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="whitespace-nowrap">
                        {b.parent_first_name} {b.parent_last_name}
                        <span className="text-muted-foreground ml-1 text-xs">({b.parent_relationship})</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{b.parent_email}</div>
                      <div className="text-xs text-muted-foreground">{b.parent_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      {b.payment_status === "paid" ? (
                        <span className="text-green-700 text-xs font-medium">
                          Paid &pound;{b.amount_paid}
                        </span>
                      ) : b.status === "confirmed" ? (
                        <span className="text-amber-700 text-xs">Awaiting payment</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(b.created_at), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50 text-xs"
                            onClick={() => setConfirming(b.id)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 border-red-300 hover:bg-red-50 text-xs"
                            onClick={() => handleDecline(b)}
                            disabled={isLoading}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        )}
                        {isConfirmedUnpaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleSync(b)}
                            disabled={isLoading}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                            Sync payment
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline confirm panel */}
                  {confirming === b.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-green-50 border-b border-green-200">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-medium text-green-800">
                            Confirm place for {b.camper_first_name} at £125?
                          </span>
                          <Button
                            size="sm"
                            className="bg-green-700 hover:bg-green-800 text-white"
                            onClick={() => handleConfirm(b)}
                            disabled={isLoading}
                          >
                            Send confirmation &amp; payment email
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirming(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Message row */}
                  {msg && (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 bg-secondary/10">
                        <span
                          className={`text-xs font-medium ${msg.type === "success" ? "text-green-700" : "text-red-700"}`}
                        >
                          {msg.text}
                        </span>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { format, differenceInYears, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { statusFilterClass } from "@/components/dashboard/status-filter-pills"
import { Download, CheckCircle, XCircle, RefreshCw, Archive, ArchiveRestore, Trash2, Bell, BadgeCheck, ChevronDown, ChevronUp } from "lucide-react"
import {
  confirmRootsBooking,
  declineRootsBooking,
  syncRootsPayment,
  sendRootsPaymentReminder,
  archiveRootsBooking,
  deleteRootsBooking,
  markRootsBookingAsPaid,
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
  parent_address_line_1: string | null
  parent_address_line_2: string | null
  parent_town_city: string | null
  parent_postcode: string | null
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
  nowdonate_payment_url: string | null
  stripe_payment_link: string | null
  stripe_payment_link_id: string | null
  archived: boolean
  archived_at: string | null
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
    "Parent Name", "Parent Email", "Parent Phone", "Address Line 1", "Address Line 2", "Town/City", "Postcode",
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
      b.parent_address_line_1 ?? "", b.parent_address_line_2 ?? "", b.parent_town_city ?? "", b.parent_postcode ?? "",
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

function detailValue(v: unknown): string {
  if (v == null) return "Not provided"
  const s = String(v).trim()
  return s ? s : "Not provided"
}

export function RootsBookingsTable({ bookings }: { bookings: Booking[] }) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, { type: "success" | "error"; text: string }>>({})
  const [showArchived, setShowArchived] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "declined">("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const active = bookings.filter((b) => !b.archived)
  const archived = bookings.filter((b) => b.archived)
  const visible = (showArchived ? archived : active).filter((booking) => statusFilter === "all" || booking.status === statusFilter)

  const pending = active.filter((b) => b.status === "pending").length
  const confirmed = active.filter((b) => b.status === "confirmed").length
  const declined = active.filter((b) => b.status === "declined").length

  function setMsg(id: string, type: "success" | "error", text: string) {
    setMessages((m) => ({ ...m, [id]: { type, text } }))
  }

  async function handleConfirm(b: Booking) {
    const amt = Number(amount)
    if (!amount || isNaN(amt) || amt <= 0) return
    setLoading(b.id)
    try {
      const result = await confirmRootsBooking(b.id, amt)
      if (!result.ok) {
        setMsg(b.id, "error", result.error)
        setLoading(null)
        return
      }
      setMsg(b.id, "success", `Confirmed. Payment email sent to ${b.parent_email}.`)
      setConfirming(null)
      setAmount("")
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again."
      setMsg(b.id, "error", message)
    }
    setLoading(null)
  }

  async function handleSync(b: Booking) {
    setLoading(b.id)
    try {
      const result = await syncRootsPayment(b.id)
      setMsg(b.id, result.paid ? "success" : "error",
        result.paid ? "Payment confirmed." : (result.error ?? "No completed payment found yet."))
    } catch {
      setMsg(b.id, "error", "Sync failed.")
    }
    setLoading(null)
  }

  async function handleMarkPaid(b: Booking) {
    const input = window.prompt(`Mark as paid — enter amount paid (£):`, String(b.amount_due ?? ""))
    if (input === null) return
    const amount = parseFloat(input)
    if (!isFinite(amount) || amount <= 0) { alert("Invalid amount"); return }
    if (!confirm(`Mark ${b.camper_first_name} ${b.camper_last_name} as paid £${amount}? This cannot be undone.`)) return
    setLoading(b.id)
    try {
      const result = await markRootsBookingAsPaid(b.id, amount)
      setMsg(b.id, result.ok ? "success" : "error", result.ok ? `Marked as paid £${amount}.` : result.error)
    } catch {
      setMsg(b.id, "error", "Action failed.")
    }
    setLoading(null)
  }

  async function handleReminder(b: Booking) {
    if (!confirm(`Send payment reminder to ${b.parent_email}?`)) return
    setLoading(b.id)
    try {
      const result = await sendRootsPaymentReminder(b.id)
      setMsg(b.id, result.ok ? "success" : "error",
        result.ok ? `Reminder sent to ${b.parent_email}.` : result.error)
    } catch {
      setMsg(b.id, "error", "Failed to send reminder.")
    }
    setLoading(null)
  }

  async function handleArchive(b: Booking) {
    setLoading(b.id)
    try {
      await archiveRootsBooking(b.id, !b.archived)
      setMsg(b.id, "success", b.archived ? "Restored from archive." : "Archived.")
    } catch {
      setMsg(b.id, "error", "Action failed.")
    }
    setLoading(null)
  }

  async function handleDelete(b: Booking) {
    if (!confirm(`Permanently delete booking for ${b.camper_first_name} ${b.camper_last_name}? This cannot be undone.`)) return
    setLoading(b.id)
    try {
      await deleteRootsBooking(b.id)
    } catch {
      setMsg(b.id, "error", "Delete failed.")
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats + export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter("all")} className={statusFilterClass()}>All ({active.length})</button>
          <button onClick={() => setStatusFilter("confirmed")} className={statusFilterClass("confirmed")}>Confirmed ({confirmed})</button>
          <button onClick={() => setStatusFilter("pending")} className={statusFilterClass("pending")}>Pending ({pending})</button>
          <button onClick={() => setStatusFilter("declined")} className={statusFilterClass("attention")}>Declined ({declined})</button>
        </div>
        <div className="flex gap-2">
          {archived.length > 0 && (
            <Button
              variant={showArchived ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowArchived((v) => !v)}
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? "Show active" : "Show archived"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => downloadCsv(bookings)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {showArchived ? "No archived bookings." : "No booking requests yet."}
                </td>
              </tr>
            )}
            {visible.map((b) => {
              const age = b.camper_dob
                ? differenceInYears(new Date(), parseISO(b.camper_dob))
                : null
              const isPending = b.status === "pending"
              const isConfirmedUnpaid = b.status === "confirmed" && b.payment_status !== "paid"
              const isLoading = loading === b.id
              const msg = messages[b.id]
              const isArchived = b.archived
              const isExpanded = expanded === b.id

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
                            onClick={() => { setConfirming(b.id); setAmount("") }}
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
                          b.nowdonate_payment_url ? (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <a href={b.nowdonate_payment_url} target="_blank" rel="noopener noreferrer">
                                Open payment link
                              </a>
                            </Button>
                          ) : null
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
                        {isConfirmedUnpaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50 text-xs"
                            onClick={() => handleMarkPaid(b)}
                            disabled={isLoading}
                          >
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Mark paid
                          </Button>
                        )}
                        {isConfirmedUnpaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs"
                            onClick={() => handleReminder(b)}
                            disabled={isLoading}
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Send reminder
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setExpanded((prev) => (prev === b.id ? null : b.id))}
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                          {isExpanded ? "Hide details" : "View details"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-muted-foreground text-xs"
                          onClick={() => handleArchive(b)}
                          disabled={isLoading}
                          title={isArchived ? "Restore from archive" : "Archive"}
                        >
                          {isArchived
                            ? <ArchiveRestore className="h-3 w-3" />
                            : <Archive className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-300 hover:bg-red-50 text-xs"
                          onClick={() => handleDelete(b)}
                          disabled={isLoading}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-secondary/10 border-b border-border">
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">Participant</p>
                            <p><span className="text-muted-foreground">Full name:</span> {b.camper_first_name} {b.camper_last_name}</p>
                            <p><span className="text-muted-foreground">Date of birth:</span> {detailValue(b.camper_dob)}</p>
                            <p><span className="text-muted-foreground">Age:</span> {age != null ? `${age} years` : "Not provided"}</p>
                            <p><span className="text-muted-foreground">Gender:</span> {detailValue(b.camper_gender)}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">Parent / Guardian</p>
                            <p><span className="text-muted-foreground">Full name:</span> {b.parent_first_name} {b.parent_last_name}</p>
                            <p><span className="text-muted-foreground">Relationship:</span> {detailValue(b.parent_relationship)}</p>
                            <p><span className="text-muted-foreground">Email:</span> {detailValue(b.parent_email)}</p>
                            <p><span className="text-muted-foreground">Phone / WhatsApp:</span> {detailValue(b.parent_phone)}</p>
                            <p><span className="text-muted-foreground">Address line 1:</span> {detailValue(b.parent_address_line_1)}</p>
                            <p><span className="text-muted-foreground">Address line 2:</span> {detailValue(b.parent_address_line_2)}</p>
                            <p><span className="text-muted-foreground">Town / City:</span> {detailValue(b.parent_town_city)}</p>
                            <p><span className="text-muted-foreground">Postcode:</span> {detailValue(b.parent_postcode)}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">Emergency Contact</p>
                            <p><span className="text-muted-foreground">Name:</span> {detailValue(b.emergency_name)}</p>
                            <p><span className="text-muted-foreground">Relationship:</span> {detailValue(b.emergency_relationship)}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {detailValue(b.emergency_phone)}</p>
                          </div>

                          <div className="space-y-1 md:col-span-2 lg:col-span-3">
                            <p className="font-semibold text-foreground">Support Information</p>
                            <p><span className="text-muted-foreground">Dietary requirements:</span> {detailValue(b.dietary_requirements)}</p>
                            <p><span className="text-muted-foreground">Medical / health information:</span> {detailValue(b.medical_info)}</p>
                            <p><span className="text-muted-foreground">How they heard about Roots:</span> {detailValue(b.how_did_you_hear)}</p>
                            <p><span className="text-muted-foreground">Additional information:</span> {detailValue(b.additional_info)}</p>
                            <p><span className="text-muted-foreground">Internal notes:</span> {detailValue(b.notes)}</p>
                          </div>

                          <div className="space-y-1 md:col-span-2 lg:col-span-3">
                            <p className="font-semibold text-foreground">Booking & Payment</p>
                            <p><span className="text-muted-foreground">Booking ID:</span> {b.id}</p>
                            <p><span className="text-muted-foreground">Application status:</span> {detailValue(b.status)}</p>
                            <p><span className="text-muted-foreground">Payment status:</span> {detailValue(b.payment_status)}</p>
                            <p><span className="text-muted-foreground">Amount due:</span> {b.amount_due != null ? `£${b.amount_due}` : "Not set"}</p>
                            <p><span className="text-muted-foreground">Amount paid:</span> {b.amount_paid != null ? `£${b.amount_paid}` : "Not paid"}</p>
                            <p><span className="text-muted-foreground">Paid at:</span> {b.paid_at ? format(new Date(b.paid_at), "dd MMM yyyy, HH:mm") : "Not paid"}</p>
                            <p><span className="text-muted-foreground">Submitted:</span> {format(new Date(b.created_at), "dd MMM yyyy, HH:mm")}</p>
                            <p><span className="text-muted-foreground">Archived:</span> {b.archived ? "Yes" : "No"}</p>
                            <p><span className="text-muted-foreground">Archive date:</span> {b.archived_at ? format(new Date(b.archived_at), "dd MMM yyyy, HH:mm") : "Not archived"}</p>
                            <p>
                              <span className="text-muted-foreground">Payment link:</span>{" "}
                              {b.nowdonate_payment_url ? (
                                <a href={b.nowdonate_payment_url} target="_blank" rel="noopener noreferrer" className="underline text-amber-800">
                                  Open payment link
                                </a>
                              ) : "Not available"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Inline confirm panel */}
                  {confirming === b.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-green-50 border-b border-green-200">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-medium text-green-800">
                            Confirm place for {b.camper_first_name}:
                          </span>
                          <Input
                            type="number"
                            placeholder="Amount £ (e.g. 125)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-48 h-8 text-sm"
                            min="1"
                          />
                          <Button
                            size="sm"
                            className="bg-green-700 hover:bg-green-800 text-white"
                            onClick={() => handleConfirm(b)}
                            disabled={!amount || isLoading}
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

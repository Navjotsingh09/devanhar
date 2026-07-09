"use client"

import { Fragment, useMemo, useState, useTransition } from "react"
import { format } from "date-fns"
import { Archive, CheckCircle, Download, RefreshCw, Search, Trash2, Wallet, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  removeFamilyRetreatBooking,
  sendFamilyRetreatAdditionalCharge,
  syncFamilyRetreatPayment,
  updateFamilyRetreatStatus,
} from "@/app/dashboard/family-retreat/actions"

type RetreatStatus = "pending" | "confirmed" | "waitlisted" | "declined" | "archived"
type PaymentFilter = "all" | "paid" | "unpaid"
type StatusFilter = "all" | RetreatStatus
type SortMode =
  | "newest"
  | "oldest"
  | "paid_first"
  | "unpaid_first"
  | "name_az"
  | "name_za"
  | "amount_high"
  | "amount_low"

type ChildPerson = {
  first_name?: string
  last_name?: string
  date_of_birth?: string
}

type AdultPerson = {
  first_name?: string
  last_name?: string
}

export type FamilyRetreatBooking = {
  id: string
  created_at: string
  status: RetreatStatus
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  postcode: string | null
  country: string | null
  children_attending: ChildPerson[] | null
  adults_attending: AdultPerson[] | null
  accommodation_preference: string | null
  dietary_requirements: string | null
  medical_requirements: string | null
  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null
  heard_about_retreat: string | null
  additional_notes: string | null
  internal_notes: string | null
  amount_due: number | null
  amount_paid: number | null
  payment_status: string | null
  paid_at: string | null
  stripe_payment_link: string | null
  stripe_payment_link_id: string | null
}

type Message = {
  type: "success" | "error"
  text: string
}

function csvCell(value: unknown): string {
  const raw = value == null ? "" : String(value)
  if (raw.includes(",") || raw.includes('"') || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "-"
  return `£${Number(value).toFixed(2)}`
}

function statusPill(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "declined":
      return "bg-red-100 text-red-800"
    case "waitlisted":
      return "bg-blue-100 text-blue-800"
    case "archived":
      return "bg-slate-100 text-slate-700"
    default:
      return "bg-amber-100 text-amber-800"
  }
}

function paymentPill(paymentStatus: string | null) {
  if (paymentStatus === "paid") return "bg-emerald-100 text-emerald-800"
  return "bg-orange-100 text-orange-800"
}

function toCsv(bookings: FamilyRetreatBooking[]): string {
  const headers = [
    "id", "created_at", "status", "payment_status", "first_name", "last_name", "email", "phone", "city", "postcode", "country",
    "adults_count", "children_count", "amount_due", "amount_paid", "paid_at", "internal_notes",
  ]

  const rows = bookings.map((booking) => {
    const adultsCount = Array.isArray(booking.adults_attending) ? booking.adults_attending.length : 0
    const childrenCount = Array.isArray(booking.children_attending) ? booking.children_attending.length : 0
    return [
      booking.id,
      booking.created_at,
      booking.status,
      booking.payment_status || "",
      booking.first_name || "",
      booking.last_name || "",
      booking.email || "",
      booking.phone || "",
      booking.city || "",
      booking.postcode || "",
      booking.country || "",
      adultsCount,
      childrenCount,
      booking.amount_due ?? "",
      booking.amount_paid ?? "",
      booking.paid_at || "",
      booking.internal_notes || "",
    ].map(csvCell).join(",")
  })

  return "\uFEFF" + [headers.join(","), ...rows].join("\n")
}

function downloadCsv(bookings: FamilyRetreatBooking[]) {
  const blob = new Blob([toCsv(bookings)], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `family-retreat-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function FamilyRetreatBookingsTable({ bookings }: { bookings: FamilyRetreatBooking[] }) {
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("newest")

  // Guardrail: keep one inline panel open at a time to prevent overlapping controls.
  const [activeConfirmRow, setActiveConfirmRow] = useState<string | null>(null)
  const [activeAdditionalRow, setActiveAdditionalRow] = useState<string | null>(null)

  const [confirmAdults, setConfirmAdults] = useState<Record<string, string>>({})
  const [confirmAmount, setConfirmAmount] = useState<Record<string, string>>({})
  const [extraAmount, setExtraAmount] = useState<Record<string, string>>({})
  const [extraReason, setExtraReason] = useState<Record<string, string>>({})

  const [messages, setMessages] = useState<Record<string, Message>>({})

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = bookings.filter((booking) => {
      if (paymentFilter === "paid" && booking.payment_status !== "paid") return false
      if (paymentFilter === "unpaid" && booking.payment_status === "paid") return false
      if (statusFilter !== "all" && booking.status !== statusFilter) return false

      if (!term) return true
      const haystack = [booking.first_name, booking.last_name, booking.email, booking.phone, booking.city, booking.postcode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })

    return list.sort((a, b) => {
      switch (sortMode) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "paid_first":
          return Number(b.payment_status === "paid") - Number(a.payment_status === "paid")
        case "unpaid_first":
          return Number(a.payment_status === "paid") - Number(b.payment_status === "paid")
        case "name_az":
          return `${a.first_name || ""} ${a.last_name || ""}`.localeCompare(`${b.first_name || ""} ${b.last_name || ""}`)
        case "name_za":
          return `${b.first_name || ""} ${b.last_name || ""}`.localeCompare(`${a.first_name || ""} ${a.last_name || ""}`)
        case "amount_high":
          return Number(b.amount_due || 0) - Number(a.amount_due || 0)
        case "amount_low":
          return Number(a.amount_due || 0) - Number(b.amount_due || 0)
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [bookings, paymentFilter, statusFilter, search, sortMode])

  const paidCount = bookings.filter((booking) => booking.payment_status === "paid").length
  const unpaidCount = bookings.length - paidCount

  function setRowMessage(id: string, message: Message) {
    setMessages((current) => ({ ...current, [id]: message }))
  }

  function run(id: string, action: () => Promise<void>, successText: string) {
    startTransition(async () => {
      try {
        await action()
        setRowMessage(id, { type: "success", text: successText })
      } catch (error) {
        setRowMessage(id, {
          type: "error",
          text: error instanceof Error ? error.message : "Something went wrong.",
        })
      }
    })
  }

  function handleConfirm(booking: FamilyRetreatBooking) {
    const amountValue = Number(confirmAmount[booking.id] || "0")
    const adultsValue = Number(confirmAdults[booking.id] || "0")

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setRowMessage(booking.id, { type: "error", text: "Enter a valid amount before confirming." })
      return
    }

    run(
      booking.id,
      async () => {
        await updateFamilyRetreatStatus(booking.id, "confirmed", {
          amount: amountValue,
          adults: Number.isFinite(adultsValue) && adultsValue > 0 ? adultsValue : undefined,
        })
        setActiveConfirmRow(null)
      },
      "Application confirmed. Payment link and email sent.",
    )
  }

  function handleWaitlist(booking: FamilyRetreatBooking) {
    run(booking.id, () => updateFamilyRetreatStatus(booking.id, "waitlisted"), "Application waitlisted.")
  }

  function handleDecline(booking: FamilyRetreatBooking) {
    if (!window.confirm(`Hard decline ${booking.first_name || "this applicant"}?`)) return
    run(booking.id, () => updateFamilyRetreatStatus(booking.id, "declined"), "Application declined and applicant notified.")
  }

  function handleSyncPayment(booking: FamilyRetreatBooking) {
    startTransition(async () => {
      try {
        const result = await syncFamilyRetreatPayment(booking.id)
        setRowMessage(
          booking.id,
          result.paid
            ? { type: "success", text: "Payment synced successfully." }
            : { type: "error", text: "No paid Stripe session found yet." },
        )
      } catch (error) {
        setRowMessage(booking.id, { type: "error", text: error instanceof Error ? error.message : "Payment sync failed." })
      }
    })
  }

  function handleAdditionalCharge(booking: FamilyRetreatBooking) {
    const amountValue = Number(extraAmount[booking.id] || "0")
    const noteValue = (extraReason[booking.id] || "").trim()

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setRowMessage(booking.id, { type: "error", text: "Enter a valid additional amount." })
      return
    }
    if (noteValue.length < 10) {
      setRowMessage(booking.id, { type: "error", text: "Add a clear reference note (10+ characters)." })
      return
    }

    run(
      booking.id,
      async () => {
        await sendFamilyRetreatAdditionalCharge(booking.id, { amount: amountValue, referenceNote: noteValue })
        setActiveAdditionalRow(null)
      },
      "Additional payment link and reference email sent.",
    )
  }

  function handleArchive(booking: FamilyRetreatBooking) {
    if (!window.confirm("Archive this application?")) return
    run(booking.id, () => removeFamilyRetreatBooking(booking.id, "archive"), "Application archived.")
  }

  function handleDelete(booking: FamilyRetreatBooking) {
    if (!window.confirm("Delete this application permanently? This cannot be undone.")) return
    run(booking.id, () => removeFamilyRetreatBooking(booking.id, "delete"), "Application deleted.")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span><strong>{bookings.length}</strong> total</span>
          <span className="text-emerald-700"><strong>{paidCount}</strong> paid</span>
          <span className="text-orange-700"><strong>{unpaidCount}</strong> unpaid</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => downloadCsv(filtered)}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name/email/phone" className="pl-9" />
        </div>

        <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}>
          <SelectTrigger><SelectValue placeholder="Payment filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Payment: all</SelectItem>
            <SelectItem value="paid">Payment: paid only</SelectItem>
            <SelectItem value="unpaid">Payment: unpaid only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger><SelectValue placeholder="Status filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: all</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
          <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Sort: newest first</SelectItem>
            <SelectItem value="oldest">Sort: oldest first</SelectItem>
            <SelectItem value="paid_first">Sort: paid first</SelectItem>
            <SelectItem value="unpaid_first">Sort: unpaid first</SelectItem>
            <SelectItem value="name_az">Sort: name A-Z</SelectItem>
            <SelectItem value="name_za">Sort: name Z-A</SelectItem>
            <SelectItem value="amount_high">Sort: amount high-low</SelectItem>
            <SelectItem value="amount_low">Sort: amount low-high</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[420px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">No applications found for current filters.</TableCell>
                </TableRow>
              ) : (
                filtered.map((booking) => {
                  const childrenCount = Array.isArray(booking.children_attending) ? booking.children_attending.length : 0
                  const adultsCount = Array.isArray(booking.adults_attending) ? booking.adults_attending.length : 0
                  const rowMessage = messages[booking.id]

                  return (
                    <Fragment key={booking.id}>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">{booking.first_name || ""} {booking.last_name || ""}</div>
                          <div className="text-xs text-muted-foreground">{booking.email || "-"}</div>
                          <div className="text-xs text-muted-foreground">{booking.phone || "-"}</div>
                          <div className="text-xs text-muted-foreground mt-1">Adults: {adultsCount} | Children: {childrenCount}</div>
                        </TableCell>
                        <TableCell>
                          <div>{booking.city || "-"}</div>
                          <div className="text-xs text-muted-foreground">{booking.postcode || ""} {booking.country || ""}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusPill(booking.status)}`}>{booking.status}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paymentPill(booking.payment_status)}`}>{booking.payment_status || "unpaid"}</span>
                          <div className="text-xs text-muted-foreground mt-1">Due: {formatMoney(booking.amount_due)}</div>
                          <div className="text-xs text-muted-foreground">Paid: {formatMoney(booking.amount_paid)}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(booking.created_at), "dd MMM yyyy, HH:mm")}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {booking.payment_status === "paid" ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-medium">Paid</span>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => { setActiveConfirmRow(booking.id); setActiveAdditionalRow(null) }} disabled={isPending || booking.status === "declined" || booking.status === "archived"}>
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />Confirm
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleWaitlist(booking)} disabled={isPending || booking.status === "declined" || booking.status === "archived"}>Waitlist</Button>
                                <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleDecline(booking)} disabled={isPending || booking.status === "declined" || booking.status === "archived"}>
                                  <XCircle className="h-3.5 w-3.5 mr-1" />Decline
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleSyncPayment(booking)} disabled={isPending}><RefreshCw className="h-3.5 w-3.5 mr-1" />Check payment</Button>
                            <Button size="sm" variant="outline" onClick={() => { setActiveAdditionalRow(booking.id); setActiveConfirmRow(null) }} disabled={isPending}><Wallet className="h-3.5 w-3.5 mr-1" />Additional charge</Button>
                            <Button size="sm" variant="outline" onClick={() => handleArchive(booking)} disabled={isPending}><Archive className="h-3.5 w-3.5 mr-1" />Archive</Button>
                            <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleDelete(booking)} disabled={isPending}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {activeConfirmRow === booking.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-emerald-50/60">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                              <div>
                                <p className="text-xs mb-1 text-muted-foreground">Adults attending</p>
                                <Input type="number" min="1" value={confirmAdults[booking.id] ?? ""} onChange={(event) => setConfirmAdults((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="e.g. 2" />
                              </div>
                              <div>
                                <p className="text-xs mb-1 text-muted-foreground">Amount due now (£)</p>
                                <Input type="number" min="1" step="0.01" value={confirmAmount[booking.id] ?? ""} onChange={(event) => setConfirmAmount((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="e.g. 140" />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleConfirm(booking)} disabled={isPending}>Send confirmation</Button>
                                <Button variant="ghost" onClick={() => setActiveConfirmRow(null)} disabled={isPending}>Cancel</Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {activeAdditionalRow === booking.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-blue-50/60">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                              <div>
                                <p className="text-xs mb-1 text-muted-foreground">Additional amount (£)</p>
                                <Input type="number" min="1" step="0.01" value={extraAmount[booking.id] ?? ""} onChange={(event) => setExtraAmount((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="e.g. 40" />
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs mb-1 text-muted-foreground">Reference note (required)</p>
                                <Textarea value={extraReason[booking.id] ?? ""} onChange={(event) => setExtraReason((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="Why these additional charges apply, what was paid earlier, and what is due now." rows={3} />
                              </div>
                              <div className="flex gap-2 pt-6">
                                <Button onClick={() => handleAdditionalCharge(booking)} disabled={isPending}>Send link + email</Button>
                                <Button variant="ghost" onClick={() => setActiveAdditionalRow(null)} disabled={isPending}>Cancel</Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {rowMessage && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-2">
                            <p className={`text-xs font-medium ${rowMessage.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{rowMessage.text}</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

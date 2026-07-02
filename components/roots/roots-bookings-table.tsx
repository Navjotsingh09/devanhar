"use client"

import { useState } from "react"
import { format, differenceInYears, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { confirmRootsBooking, declineRootsBooking } from "@/app/dashboard/roots/actions"

type Booking = {
  id: string; camper_first_name: string; camper_last_name: string; camper_dob: string
  parent_first_name: string; parent_last_name: string; parent_relationship: string
  parent_email: string; parent_phone: string; status: string
  amount_due: number | null; payment_status: string; created_at: string
  medical_info: string | null; dietary_requirements: string | null
  emergency_name: string; emergency_phone: string; how_did_you_hear: string | null
  additional_info: string | null
}

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v)
  return s.includes(",") || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s
}

function downloadCsv(b: Booking[]) {
  const headers = ["ID","Camper","DOB","Age","Parent","Email","Phone","Status","Payment","Submitted","Medical","Dietary","Emergency","How Heard","Notes"]
  const rows = b.map(r => {
    const age = r.camper_dob ? differenceInYears(new Date(), parseISO(r.camper_dob)) : ""
    return [r.id, r.camper_first_name+" "+r.camper_last_name, r.camper_dob, age,
      r.parent_first_name+" "+r.parent_last_name, r.parent_email, r.parent_phone,
      r.status, r.payment_status, r.created_at, r.medical_info??"", r.dietary_requirements??"",
      r.emergency_name+" "+r.emergency_phone, r.how_did_you_hear??"", r.additional_info??""
    ].map(csvCell).join(",")
  })
  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n")
  const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"}))
  const a = document.createElement("a"); a.href=url; a.download=`roots-bookings-${format(new Date(),"yyyy-MM-dd")}.csv`; a.click(); URL.revokeObjectURL(url)
}

function StatusBadge({status}: {status:string}) {
  const map: Record<string,string> = {pending:"bg-yellow-100 text-yellow-800",confirmed:"bg-green-100 text-green-800",declined:"bg-red-100 text-red-800"}
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]??"bg-gray-100 text-gray-800"}`}>{status}</span>
}

export function RootsBookingsTable({ bookings }: { bookings: Booking[] }) {
  const [confirming, setConfirming] = useState<string|null>(null)
  const [loading, setLoading] = useState<string|null>(null)
  const [messages, setMessages] = useState<Record<string,{type:"success"|"error";text:string}>>({})

  const pending = bookings.filter(b => b.status==="pending").length
  const confirmed = bookings.filter(b => b.status==="confirmed").length
  const declined = bookings.filter(b => b.status==="declined").length

  async function handleConfirm(b: Booking) {
    setLoading(b.id)
    const result = await confirmRootsBooking(b.id, 125)
    if (result && result.ok) {
      setMessages(m => ({...m, [b.id]: {type:"success", text:`Confirmed. Payment email sent to ${b.parent_email}.`}}))
      setConfirming(null)
    } else {
      setMessages(m => ({...m, [b.id]: {type:"error", text:"Error: " + (result?.error || "unknown")}}))
    }
    setLoading(null)
  }

  async function handleDecline(b: Booking) {
    if (\!window.confirm(`Decline booking for ${b.camper_first_name} ${b.camper_last_name}?`)) return
    setLoading(b.id)
    try {
      await declineRootsBooking(b.id)
      setMessages(m => ({...m, [b.id]: {type:"success", text:"Declined. Email sent to parent."}}))
    } catch { setMessages(m => ({...m, [b.id]: {type:"error", text:"Something went wrong."}})) }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-5 text-sm">
          <span><strong>{bookings.length}</strong> total</span>
          <span className="text-yellow-700"><strong>{pending}</strong> pending</span>
          <span className="text-green-700"><strong>{confirmed}</strong> confirmed</span>
          <span className="text-red-700"><strong>{declined}</strong> declined</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(bookings)}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 border-b border-border">
            <tr>
              {["Camper","Age","Parent / Guardian","Status","Payment","Submitted","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No booking requests yet.</td></tr>
            )}
            {bookings.map(b => {
              const age = b.camper_dob ? differenceInYears(new Date(), parseISO(b.camper_dob)) : null
              const isPending = b.status === "pending"
              const msg = messages[b.id]
              return (
                <>
                  <tr key={b.id} className="hover:bg-secondary/20 transition-colors align-top">
                    <td className="px-4 py-3"><div className="font-medium whitespace-nowrap">{b.camper_first_name} {b.camper_last_name}</div><div className="text-xs text-muted-foreground">{b.camper_dob}</div></td>
                    <td className="px-4 py-3 text-muted-foreground">{age \!= null ? `${age}y` : "—"}</td>
                    <td className="px-4 py-3"><div className="whitespace-nowrap">{b.parent_first_name} {b.parent_last_name} <span className="text-muted-foreground text-xs">({b.parent_relationship})</span></div><div className="text-xs text-muted-foreground">{b.parent_email}</div></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">{b.payment_status === "paid" ? <span className="text-green-700 text-xs font-medium">Paid £{b.amount_due}</span> : b.status === "confirmed" ? <span className="text-amber-700 text-xs">Awaiting payment</span> : <span className="text-muted-foreground text-xs">—</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{format(new Date(b.created_at), "dd MMM yyyy")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {isPending && <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50 text-xs" onClick={() => setConfirming(b.id)} disabled={loading===b.id}><CheckCircle className="h-3 w-3 mr-1" />Confirm</Button>}
                        {isPending && <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50 text-xs" onClick={() => handleDecline(b)} disabled={loading===b.id}><XCircle className="h-3 w-3 mr-1" />Decline</Button>}
                      </div>
                    </td>
                  </tr>
                  {confirming === b.id && (
                    <tr><td colSpan={7} className="px-4 py-4 bg-green-50 border-b border-green-200">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-green-800">Confirm place for {b.camper_first_name} at £125?</span>
                        <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white" onClick={() => handleConfirm(b)} disabled={loading===b.id}>Send confirmation &amp; payment email</Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Cancel</Button>
                      </div>
                    </td></tr>
                  )}
                  {msg && <tr><td colSpan={7} className="px-4 py-2 bg-secondary/10"><span className={`text-xs font-medium ${msg.type==="success"?"text-green-700":"text-red-700"}`}>{msg.text}</span></td></tr>}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"

import { archiveSubmission, capturePadelPayment, cancelPadelPayment } from "@/app/dashboard/submissions/actions"
import { statusFilterClass } from "@/components/dashboard/status-filter-pills"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Archive, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

export type PadelEntry = {
  id: string
  name: string
  email: string
  phone: string | null
  amount: number | null
  currency: string | null
  status: "confirmed" | "awaiting" | "not_paid"
  source: string
  created_at: string
  details?: Record<string, unknown>
  isLiveRegistration?: boolean
}

const labels = {
  confirmed: "Confirmed paid",
  awaiting: "Awaiting payment",
  not_paid: "Not paid",
}

function EntriesTable({ entries }: { entries: PadelEntry[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDecision = (entry: PadelEntry, decision: "approve" | "decline") => {
    startTransition(async () => {
      try {
        if (decision === "approve") {
          await capturePadelPayment(entry.id)
          toast.success("Registration approved")
        } else {
          await cancelPadelPayment(entry.id)
          toast.success("Registration declined")
        }
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update registration")
      }
    })
  }

  const handleArchive = (entry: PadelEntry) => {
    startTransition(async () => {
      try {
        await archiveSubmission(entry.id, "padel_registrations")
        toast.success("Registration archived")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to archive registration")
      }
    })
  }


  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Payment</th>
            <th className="px-4 py-3 text-left">Source</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const canDecide = entry.isLiveRegistration === true && entry.status === "confirmed" ? false : entry.isLiveRegistration === true
            return (
              <>
                <tr key={entry.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{entry.name}</td>
                  <td className="px-4 py-3">{entry.email || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.phone || "Not recovered"}</td>
                  <td className="px-4 py-3">
                    <span className={entry.status === "confirmed" ? "text-green-700" : entry.status === "awaiting" ? "text-amber-700" : "text-red-700"}>{labels[entry.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(entry.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canDecide && <><Button size="sm" className="h-7 gap-1 bg-green-600 px-2.5 text-xs font-semibold text-white hover:bg-green-700" onClick={() => handleDecision(entry, "approve")} disabled={isPending}><CheckCircle className="h-3.5 w-3.5" />Approve</Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDecision(entry, "decline")} disabled={isPending} title="Decline registration"><XCircle className="h-4 w-4" /><span className="sr-only">Decline</span></Button></>}
                      {entry.isLiveRegistration === true && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => handleArchive(entry)} disabled={isPending} title="Archive registration"><Archive className="h-4 w-4" /><span className="sr-only">Archive</span></Button>}
                      {entry.details && <button onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} className="text-sm text-blue-700 hover:underline">{expanded === entry.id ? "Hide" : "View"}</button>}
                    </div>
                  </td>
                </tr>
                {expanded === entry.id && entry.details && <tr key={`${entry.id}-details`} className="bg-muted/20"><td colSpan={7} className="px-4 py-4"><dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(entry.details).filter(([key, value]) => ["id", "initiative_id", "created_at", "updated_at"].includes(key) ? false : value === null || value === "" ? false : true).map(([key, value]) => <div key={key}><dt className="text-xs font-medium text-muted-foreground">{key.replace(/_/g, " ")}</dt><dd className="mt-0.5 break-words text-sm">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</dd></div>)}</dl></td></tr>}
              </>
            )
          })}
          {entries.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No entries in this status.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function PadelEntriesDashboard({ entries }: { entries: PadelEntry[] }) {
  const statuses = ["confirmed", "awaiting", "not_paid"] as const
  const tones = { confirmed: "confirmed", awaiting: "pending", not_paid: "attention" } as const
  return <Tabs defaultValue="all"><TabsList className="mb-4 h-auto flex flex-wrap gap-2 bg-transparent p-0"><TabsTrigger value="all" className={statusFilterClass()}>All ({entries.length})</TabsTrigger>{statuses.map((status) => <TabsTrigger key={status} value={status} className={statusFilterClass(tones[status])}>{labels[status]} ({entries.filter((entry) => entry.status === status).length})</TabsTrigger>)}</TabsList><TabsContent value="all"><EntriesTable entries={entries} /></TabsContent>{statuses.map((status) => <TabsContent key={status} value={status}><EntriesTable entries={entries.filter((entry) => entry.status === status)} /></TabsContent>)}</Tabs>
}

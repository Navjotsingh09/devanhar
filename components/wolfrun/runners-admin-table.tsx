"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"

type Runner = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  age: number
  city: string
  pack: string
  agree_whatsapp_group: boolean
  status: string
  created_at: string
}

const PACK_LABELS: Record<string, string> = {
  singhs: "Singhs",
  kaurs: "Kaurs",
}

export default function RunnersAdminTable({ runners }: { runners: Runner[] }) {
  const [packFilter, setPackFilter] = useState<"all" | "singhs" | "kaurs">("all")

  const filtered =
    packFilter === "all" ? runners : runners.filter((r) => r.pack === packFilter)

  return (
    <div className="space-y-4">
      {/* Pack filter tabs */}
      <div className="flex gap-2">
        {(["all", "singhs", "kaurs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setPackFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              packFilter === tab
                ? tab === "singhs"
                  ? "bg-amber-100 border-amber-400 text-amber-800"
                  : tab === "kaurs"
                  ? "bg-purple-100 border-purple-400 text-purple-800"
                  : "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40"
            }`}
          >
            {tab === "all"
              ? `All (${runners.length})`
              : tab === "singhs"
              ? `Singhs (${runners.filter((r) => r.pack === "singhs").length})`
              : `Kaurs (${runners.filter((r) => r.pack === "kaurs").length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6 text-center">No runners yet.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pack</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Age</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">City</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">WhatsApp</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((runner, i) => (
                <tr
                  key={runner.id}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="px-4 py-3 font-medium">
                    {runner.first_name} {runner.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{runner.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{runner.phone || "-"}</td>
                  <td className="px-4 py-3">
                    {runner.pack === "singhs" ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
                        Singhs
                      </Badge>
                    ) : runner.pack === "kaurs" ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100">
                        Kaurs
                      </Badge>
                    ) : (
                      <Badge variant="outline">{runner.pack}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{runner.age}</td>
                  <td className="px-4 py-3 text-muted-foreground">{runner.city}</td>
                  <td className="px-4 py-3">
                    {runner.agree_whatsapp_group ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">No</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(runner.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

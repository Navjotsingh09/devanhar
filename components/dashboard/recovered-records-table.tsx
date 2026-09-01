"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type RecoveredSubmission = {
  id: string
  category: string
  source: string
  full_name: string
  email: string
  status: string
  details: string
  created_at: string
}

const categories = ["Camps", "Roots Residential", "Sikh Padel Association", "Wolf Run", "Family Fun Day", "Family Retreat", "Donations / Unclassified"]

function RecordsTable({ records }: { records: RecoveredSubmission[] }) {
  return <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[920px] text-sm"><thead><tr className="bg-muted/50 text-left"><th className="px-4 py-3 font-semibold text-foreground">Name</th><th className="px-4 py-3 font-semibold text-foreground">Source</th><th className="px-4 py-3 font-semibold text-foreground">Email</th><th className="px-4 py-3 font-semibold text-foreground">Status</th><th className="px-4 py-3 font-semibold text-foreground">Recovered details</th><th className="px-4 py-3 font-semibold text-foreground">Date</th></tr></thead><tbody className="divide-y divide-border">{records.map((record) => <tr key={record.id} className="hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-medium text-foreground">{record.full_name}</td><td className="px-4 py-3 text-muted-foreground">{record.source}</td><td className="px-4 py-3">{record.email ? <a href={`mailto:${record.email}`} className="text-blue-600 hover:underline">{record.email}</a> : "-"}</td><td className="px-4 py-3 text-muted-foreground">{record.status}</td><td className="px-4 py-3 text-muted-foreground max-w-xs break-words">{record.details || "-"}</td><td className="px-4 py-3 text-muted-foreground text-xs tabular-nums whitespace-nowrap">{new Date(record.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td></tr>)}</tbody></table></div>
}

export function RecoveredRecordsTable({ records }: { records: RecoveredSubmission[] }) {
  return <Tabs defaultValue="all"><TabsList className="mb-4 h-auto flex flex-wrap justify-start gap-2 bg-transparent p-0"><TabsTrigger value="all">All ({records.length})</TabsTrigger>{categories.map((category) => <TabsTrigger key={category} value={category}>{category} ({records.filter((record) => record.category === category).length})</TabsTrigger>)}</TabsList><TabsContent value="all"><RecordsTable records={records} /></TabsContent>{categories.map((category) => <TabsContent key={category} value={category}><RecordsTable records={records.filter((record) => record.category === category)} /></TabsContent>)}</Tabs>
}

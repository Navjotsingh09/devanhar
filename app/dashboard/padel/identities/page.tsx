import Link from "next/link"
import { AlertTriangle, CheckCircle2, Users } from "lucide-react"
import { requirePadelStaff } from "@/lib/padel-admin"

export const dynamic = "force-dynamic"

function normalize(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()
}

export default async function SPAIdentitiesPage() {
  const supabase = await requirePadelStaff()
  const { data: players, error } = await supabase.from("padel_players")
    .select("id, first_name, last_name, is_active, total_points")
    .order("first_name")

  const groups = new Map<string, typeof players>()
  for (const player of players || []) {
    const key = normalize([player.first_name, player.last_name].filter(Boolean).join(" "))
    if (key) groups.set(key, [...(groups.get(key) || []), player])
  }
  const collisions = [...groups.entries()].filter(([, records]) => (records || []).length > 1)
  const incomplete = (players || []).filter((p) => !p.first_name?.trim())
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">SPA Ranking System V2</p>
        <h1 className="mt-1 text-3xl font-bold">Player identity review</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Protect spreadsheet identity rules. Similar or identical names are not automatically
          merged: use confirmed player records and source notes before making changes.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <Users className="h-5 w-5 text-muted-foreground" /><p className="mt-2 text-3xl font-bold">{players?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Database player records</p>
        </div>
        <div className="rounded-xl border p-5">
          <AlertTriangle className="h-5 w-5 text-amber-600" /><p className="mt-2 text-3xl font-bold">{collisions.length}</p>
          <p className="text-sm text-muted-foreground">Names needing review</p>
        </div>
        <div className="rounded-xl border p-5">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" /><p className="mt-2 text-3xl font-bold">{incomplete.length}</p>
          <p className="text-sm text-muted-foreground">Missing first names</p>
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">Could not load player records: {error.message}</p>}
      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <h2 className="font-semibold">Potential duplicate identities</h2>
          <Link href="/dashboard/padel/players" className="text-sm font-medium text-primary hover:underline">Open player records →</Link>
        </div>
        {collisions.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No identical normalised names found. Different spellings and near-matches still require source-note review.</p> :
          <div className="divide-y">
            {collisions.map(([name, records]) => (
              <div key={name} className="p-4">
                <p className="font-semibold capitalize">{name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(records || []).map((record) => (
                    <span key={record.id} className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
                      {record.id.slice(0, 8)} · {record.total_points} pts · {record.is_active ? "Active" : "Archived"}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Import results using existing, uniquely resolved player records. Unresolved names are blocked;
        no automatic name merges or new identity creation should occur during an import.
      </div>
    </div>
  )
}

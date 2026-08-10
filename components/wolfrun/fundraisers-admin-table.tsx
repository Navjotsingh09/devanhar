"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Pencil, Trash2, X, Check, Ban } from "lucide-react"

type Fundraiser = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  pack: string
  slug: string
  fundraising_goal: number
  total_raised: number
  profile_message?: string | null
  status: string
  created_at: string
}

function formatAmount(pence: number) {
  return `£${(pence / 100).toFixed(pence % 100 === 0 ? 0 : 2)}`
}

export default function FundraisersAdminTable({ initialFundraisers }: { initialFundraisers: Fundraiser[] }) {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>(initialFundraisers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Fundraiser>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")

  const startEdit = (f: Fundraiser) => {
    setEditingId(f.id)
    setEditForm({
      first_name: f.first_name,
      last_name: f.last_name,
      pack: f.pack,
      fundraising_goal: f.fundraising_goal,
      profile_message: f.profile_message || "",
    })
    setError("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    setError("")
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/wolfrun/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to save")
        return
      }
      setFundraisers((prev) =>
        prev.map((f) => (f.id === editingId ? { ...f, ...data.fundraiser } : f))
      )
      setEditingId(null)
      setEditForm({})
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (f: Fundraiser) => {
    const newStatus = f.status === "active" ? "inactive" : "active"
    try {
      const res = await fetch("/api/wolfrun/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: f.id, status: newStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setFundraisers((prev) =>
          prev.map((item) => (item.id === f.id ? { ...item, status: newStatus } : item))
        )
      } else {
        setError(data.error || "Failed to update status")
      }
    } catch {
      setError("Network error")
    }
  }

  const deleteFundraiser = async (f: Fundraiser) => {
    if (!window.confirm(`Permanently delete ${f.first_name} ${f.last_name} and all their donations? This cannot be undone.`)) {
      return
    }
    setDeleting(f.id)
    setError("")

    try {
      const res = await fetch(`/api/wolfrun/admin?id=${f.id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        setFundraisers((prev) => prev.filter((item) => item.id !== f.id))
      } else {
        setError(data.error || "Failed to delete")
      }
    } catch {
      setError("Network error")
    } finally {
      setDeleting(null)
    }
  }

  if (fundraisers.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No fundraisers registered yet.</p>
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm mb-3">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Phone</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pack</th>
              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Goal</th>
              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Raised</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Registered</th>
              <th className="py-3 px-2 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fundraisers.map((f) => (
              <tr key={f.id} className="border-b border-border last:border-0">
                {editingId === f.id ? (
                  <>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <input
                          className="border rounded px-1.5 py-1 text-sm w-20"
                          value={editForm.first_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          placeholder="First"
                        />
                        <input
                          className="border rounded px-1.5 py-1 text-sm w-20"
                          value={editForm.last_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          placeholder="Last"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{f.email}</td>
                    <td className="py-3 px-2 text-muted-foreground">{f.phone}</td>
                    <td className="py-3 px-2">
                      <select
                        className="border rounded px-1.5 py-1 text-sm"
                        value={editForm.pack || ""}
                        onChange={(e) => setEditForm({ ...editForm, pack: e.target.value })}
                      >
                        <option value="singhs">Singhs</option>
                        <option value="kaurs">Kaurs</option>
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        className="border rounded px-1.5 py-1 text-sm w-20 text-right"
                        value={editForm.fundraising_goal || ""}
                        onChange={(e) => setEditForm({ ...editForm, fundraising_goal: Number(e.target.value) })}
                        min={10}
                      />
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{formatAmount(f.total_raised)}</td>
                    <td className="py-3 px-2">
                      <Badge variant={f.status === "active" ? "default" : "secondary"}>{f.status}</Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="p-1.5 rounded hover:bg-green-50 text-green-600 disabled:opacity-50"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-2 font-medium">{f.first_name} {f.last_name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{f.email}</td>
                    <td className="py-3 px-2 text-muted-foreground">{f.phone}</td>
                    <td className="py-3 px-2">
                      <Badge variant={f.pack === "singhs" ? "default" : "secondary"}>
                        {f.pack === "singhs" ? "Singhs" : "Kaurs"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">£{f.fundraising_goal}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatAmount(f.total_raised)}</td>
                    <td className="py-3 px-2">
                      <Badge variant={f.status === "active" ? "default" : "secondary"}>{f.status}</Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/events/wolfrun/fundraiser/${f.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-muted text-primary"
                          title="View page"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => startEdit(f)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(f)}
                          className={`p-1.5 rounded hover:bg-muted ${f.status === "active" ? "text-amber-500" : "text-green-600"}`}
                          title={f.status === "active" ? "Deactivate" : "Reactivate"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFundraiser(f)}
                          disabled={deleting === f.id}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-50"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

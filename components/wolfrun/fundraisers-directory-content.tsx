"use client"

import { useState, useEffect } from "react"
import { Users, Trophy, Loader2, ArrowRight, Search } from "lucide-react"
import Link from "next/link"

interface Fundraiser {
  first_name: string
  last_name: string
  pack: string
  slug: string
  fundraising_goal: number
  total_raised: number
  donation_count: number
}

export function FundraisersDirectoryContent() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "singhs" | "kaurs">("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchFundraisers() {
      try {
        const res = await fetch("/api/wolfrun/fundraisers")
        if (res.ok) {
          const data = await res.json()
          setFundraisers(data.fundraisers || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchFundraisers()
  }, [])

  const filtered = fundraisers
    .filter((f) => filter === "all" || f.pack === filter)
    .filter((f) => {
      if (!search) return true
      const term = search.toLowerCase()
      return `${f.first_name} ${f.last_name}`.toLowerCase().includes(term)
    })
    .sort((a, b) => b.total_raised - a.total_raised)

  const totalRaised = fundraisers.reduce((sum, f) => sum + f.total_raised, 0)
  const totalDonations = fundraisers.reduce((sum, f) => sum + f.donation_count, 0)

  const formatAmount = (pence: number) => `£${(pence / 100).toFixed(pence % 100 === 0 ? 0 : 2)}`

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/events/wolfrun" className="text-sm text-muted-foreground hover:text-foreground transition mb-4 inline-block">
            ← Back to Wolf Run
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Fundraisers</h1>
          <p className="text-lg text-muted-foreground">Support a fundraiser and help raise money for Devanhaar</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{fundraisers.length}</div>
            <div className="text-sm text-muted-foreground">Fundraisers</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatAmount(totalRaised)}</div>
            <div className="text-sm text-muted-foreground">Total Raised</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{totalDonations}</div>
            <div className="text-sm text-muted-foreground">Donations</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {(["all", "singhs", "kaurs"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {f === "all" ? "All" : f === "singhs" ? "Singhs Pack" : "Kaurs Pack"}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search fundraisers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              {search ? "No fundraisers match your search" : "No fundraisers yet"}
            </p>
            <Link
              href="/events/wolfrun"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Be the first fundraiser
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Fundraiser Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f, i) => {
              const progressPercent = Math.min(100, Math.round((f.total_raised / (f.fundraising_goal * 100)) * 100))
              const packColor = f.pack === "singhs"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-purple-100 text-purple-700 border-purple-200"
              const barColor = f.pack === "singhs" ? "bg-amber-500" : "bg-purple-500"

              return (
                <Link
                  key={f.slug}
                  href={`/events/wolfrun/fundraiser/${f.slug}`}
                  className="group bg-background border border-border rounded-xl p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold group-hover:text-primary transition">
                        {f.first_name} {f.last_name}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${packColor}`}>
                        {f.pack === "singhs" ? "Singhs Pack" : "Kaurs Pack"}
                      </span>
                    </div>
                    {i === 0 && (
                      <Trophy className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="text-lg font-bold">{formatAmount(f.total_raised)}</span>
                    <span className="text-sm text-muted-foreground ml-1">of £{f.fundraising_goal}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {f.donation_count} sponsor{f.donation_count !== 1 ? "s" : ""}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

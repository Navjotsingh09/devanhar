"use client"

import { useState, useEffect } from "react"
import { Heart, Copy, Check, ArrowRight, Loader2, Share2, ChevronDown } from "lucide-react"
import Link from "next/link"

const presetAmounts = [10, 20, 50, 100]

interface FundraiserData {
  first_name: string
  last_name: string
  pack: string
  slug: string
  fundraising_goal: number
  total_raised: number
  profile_message: string | null
  donation_count: number
  created_at: string
}

interface DonationData {
  donor_name: string
  amount: number
  gift_aid: boolean
  message: string | null
  created_at: string
}

export function FundraiserPageContent({ slug }: { slug: string }) {
  const [fundraiser, setFundraiser] = useState<FundraiserData | null>(null)
  const [donations, setDonations] = useState<DonationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [donated, setDonated] = useState(false)

  // Donation form
  const [amount, setAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [giftAid, setGiftAid] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [donateError, setDonateError] = useState("")

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if user just donated
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("donated") === "true") {
        setDonated(true)
      }
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/wolfrun/fundraiser/${slug}`)
        if (!res.ok) {
          setError("Fundraiser not found")
          return
        }
        const data = await res.json()
        setFundraiser(data.fundraiser)
        setDonations(data.donations || [])
      } catch {
        setError("Failed to load fundraiser")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const effectiveAmount = customAmount ? parseFloat(customAmount) : amount
  const fundraiserLink = typeof window !== "undefined" ? `${window.location.origin}/events/wolfrun/fundraiser/${slug}` : ""
  const progressPercent = fundraiser ? Math.min(100, Math.round((fundraiser.total_raised / (fundraiser.fundraising_goal * 100)) * 100)) : 0

  const copyLink = () => {
    navigator.clipboard.writeText(fundraiserLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!effectiveAmount || effectiveAmount < 5) {
      setDonateError("Minimum donation is £5")
      return
    }
    setSubmitting(true)
    setDonateError("")

    try {
      const res = await fetch("/api/wolfrun/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundraiser_slug: slug,
          amount: effectiveAmount,
          donor_name: donorName.trim(),
          donor_email: donorEmail.trim() || null,
          gift_aid: giftAid,
          message: message.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setDonateError(data.error || "Something went wrong")
        return
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch {
      setDonateError("Unable to connect. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !fundraiser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">{error || "Fundraiser not found"}</p>
        <Link href="/events/wolfrun" className="text-primary hover:underline">
          Back to Wolf Run
        </Link>
      </div>
    )
  }

  const packLabel = fundraiser.pack === "singhs" ? "Singhs Camp Pack" : "Kaurs Camp Pack"
  const packColor = fundraiser.pack === "singhs"
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-purple-100 text-purple-700 border-purple-200"
  const progressColor = fundraiser.pack === "singhs" ? "bg-amber-500" : "bg-purple-500"

  const formatAmount = (pence: number) => `£${(pence / 100).toFixed(pence % 100 === 0 ? 0 : 2)}`

  return (
    <div className="py-12">
      {/* Success banner */}
      {donated && (
        <div className="max-w-2xl mx-auto mb-6 px-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-medium">Thank you for your donation! Your sponsorship has been processed.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Fundraiser Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Fundraiser Header */}
          <div>
            <Link href="/events/wolfrun" className="text-sm text-muted-foreground hover:text-foreground transition mb-4 inline-block">
              ← Back to Wolf Run
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {fundraiser.first_name} {fundraiser.last_name}
            </h1>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${packColor}`}>
              {packLabel}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-3xl font-bold">{formatAmount(fundraiser.total_raised)}</span>
                <span className="text-muted-foreground ml-1">raised of £{fundraiser.fundraising_goal} goal</span>
              </div>
              <span className="text-sm text-muted-foreground">{fundraiser.donation_count} sponsor{fundraiser.donation_count !== 1 ? "s" : ""}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Message */}
          {fundraiser.profile_message && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Why I&apos;m fundraising</h3>
              <p className="text-muted-foreground">{fundraiser.profile_message}</p>
            </div>
          )}

          {/* Share */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3">Share this fundraiser</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                readOnly
                value={fundraiserLink}
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm truncate"
              />
              <button onClick={copyLink} className="shrink-0 p-2 rounded-lg hover:bg-muted transition">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Sponsor ${fundraiser.first_name} for the Wolf Run! All money goes to Devanhaar: ${fundraiserLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              Share on WhatsApp
            </a>
          </div>

          {/* Recent Donations */}
          {donations.length > 0 && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Recent Sponsors</h3>
              <div className="space-y-3">
                {donations.map((d, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium text-sm">{d.donor_name}</div>
                      {d.message && <p className="text-xs text-muted-foreground mt-0.5">&quot;{d.message}&quot;</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm">{formatAmount(d.amount)}</div>
                      {d.gift_aid && <span className="text-xs text-green-600">+ Gift Aid</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Donate Form */}
        <div className="lg:col-span-2">
          <div className="bg-background border border-border rounded-xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-1">Sponsor {fundraiser.first_name}</h3>
            <p className="text-sm text-muted-foreground mb-4">All donations go to Devanhaar</p>

            <form onSubmit={handleDonate} className="space-y-4">
              {donateError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  {donateError}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {presetAmounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setAmount(a); setCustomAmount("") }}
                      className={`py-2 rounded-lg border text-sm font-semibold transition ${
                        amount === a && !customAmount
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      £{a}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="5"
                  step="1"
                  placeholder="Custom amount (£)"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(null) }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Donor Info */}
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message (optional)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Good luck!"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Gift Aid */}
              <label className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftAid}
                  onChange={(e) => setGiftAid(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <div>
                  <span className="text-sm font-medium">Add Gift Aid (25%)</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    I am a UK taxpayer and want Devanhaar to claim Gift Aid on my donation.
                  </p>
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting || !effectiveAmount || effectiveAmount < 5 || !donorName.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Donate {effectiveAmount ? `£${effectiveAmount}` : ""}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment via Stripe. You&apos;ll be redirected to complete your donation.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Users, Heart, Share2, ArrowRight, Copy, Check, ExternalLink, ChevronDown, Loader2, MapPin, Calendar, Trophy } from "lucide-react"
import Link from "next/link"

const siteUrl = typeof window !== "undefined" ? window.location.origin : ""

const presetAmounts = [10, 20, 50, 100]

const faqs = [
  {
    q: "What is the Wolf Run?",
    a: "The Wolf Run is one of the UK's most popular wild running events — a 5K obstacle course through mud, woodland, lakes and trails in the Warwickshire countryside. It's not a race — it's a shared adventure."
  },
  {
    q: "Do I have to run to be a fundraiser?",
    a: "No! Anyone can register as a fundraiser. You'll get your own unique page and link to collect sponsorships from friends and family. You don't have to physically run."
  },
  {
    q: "What are the packs?",
    a: "We're entering as two packs — the Singhs Camp UK Pack and the Kaurs Camp UK Pack. When you register, you choose which pack to join. It's a great way to represent your camp community."
  },
  {
    q: "Where does the money go?",
    a: "100% of sponsorship donations go to Devanhaar to fund Sikh education, camps, and community programmes. Wolf Run entry fees are separate and paid directly to Wolf Run."
  },
  {
    q: "How does sponsorship work?",
    a: "When you register as a fundraiser, you get a unique link. Share it with friends, family, and colleagues. They can sponsor you by donating through your link. All donations are tracked to your profile."
  },
  {
    q: "Is there a minimum donation?",
    a: "Yes, the minimum sponsorship donation is £5. Every pound makes a difference!"
  },
  {
    q: "Can I claim Gift Aid?",
    a: "Yes — donors can tick the Gift Aid box when sponsoring. This lets us claim an extra 25p for every £1 donated at no extra cost to the donor (UK taxpayers only)."
  },
]

function FundraiserRegistrationForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fundraiserLink, setFundraiserLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    pack: "",
    fundraising_goal: "",
    profile_message: "",
    agree_terms: false,
    opt_in_email: false,
    monthly_donation: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/wolfrun/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fundraising_goal: Number(form.fundraising_goal) || 100,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 && data.link) {
          setFundraiserLink(data.link)
          setStep("success")
          return
        }
        setError(data.error || "Something went wrong")
        return
      }

      setFundraiserLink(data.link)
      setStep("success")
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(fundraiserLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === "success") {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold">You&apos;re Registered!</h3>
        <p className="text-muted-foreground">Share your unique fundraising link with friends and family to collect sponsorships.</p>
        <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={fundraiserLink}
            className="flex-1 bg-transparent text-sm truncate outline-none"
          />
          <button
            onClick={copyLink}
            className="shrink-0 p-2 rounded-md hover:bg-background transition"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex gap-3 justify-center">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`I'm raising money for Devanhaar by taking on the Wolf Run! Sponsor me here: ${fundraiserLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            Share on WhatsApp
          </a>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition text-sm font-medium"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition underline">
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">Join Devanhaar in the Wolf Run</h3>
      <p className="text-sm text-muted-foreground">Sign up to get your unique fundraising link</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            required
            value={form.first_name}
            onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            required
            value={form.last_name}
            onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Age *</label>
          <input
            type="number"
            min="16"
            max="100"
            required
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Choose Your Pack *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, pack: "singhs" }))}
            className={`p-3 rounded-lg border-2 text-center transition text-sm font-medium ${
              form.pack === "singhs"
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-border hover:border-amber-300"
            }`}
          >
            Singhs Camp UK Pack
          </button>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, pack: "kaurs" }))}
            className={`p-3 rounded-lg border-2 text-center transition text-sm font-medium ${
              form.pack === "kaurs"
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-border hover:border-purple-300"
            }`}
          >
            Kaurs Camp UK Pack
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fundraising Goal (£)</label>
        <input
          type="number"
          min="1"
          value={form.fundraising_goal}
          onChange={(e) => setForm((p) => ({ ...p, fundraising_goal: e.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Personal Message (optional)</label>
        <textarea
          rows={3}
          value={form.profile_message}
          onChange={(e) => setForm((p) => ({ ...p, profile_message: e.target.value }))}
          placeholder="Tell people why you're fundraising..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.agree_terms}
            onChange={(e) => setForm((p) => ({ ...p, agree_terms: e.target.checked }))}
            className="mt-0.5 rounded border-border"
          />
          <span>I agree to the Terms &amp; Conditions *</span>
        </label>

      </div>

      <button
        type="submit"
        disabled={loading || !form.pack || !form.first_name || !form.last_name || !form.email || !form.agree_terms}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            Register as Fundraiser
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}

function WolfRunPaymentForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    agree_whatsapp_group: false,
    agree_terms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/wolfrun/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">Join the Wolf Run</h3>
      <p className="text-sm text-muted-foreground">Pay your £45 entry fee to secure your spot</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            required
            value={form.first_name}
            onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            required
            value={form.last_name}
            onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Age *</label>
          <input
            type="number"
            min="16"
            max="99"
            required
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.agree_whatsapp_group}
            onChange={(e) => setForm((p) => ({ ...p, agree_whatsapp_group: e.target.checked }))}
            className="mt-0.5 rounded border-border"
          />
          <span>Add me to the WhatsApp group</span>
        </label>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.agree_terms}
            onChange={(e) => setForm((p) => ({ ...p, agree_terms: e.target.checked }))}
            className="mt-0.5 rounded border-border"
          />
          <span>I agree to the Terms &amp; Conditions *</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !form.first_name || !form.last_name || !form.email || !form.phone || !form.age || !form.city || !form.agree_terms}
        className="w-full py-3 bg-amber-500 text-slate-900 rounded-lg font-bold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay £45 &amp; Secure Your Spot
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        You&apos;ll be redirected to Stripe to complete your payment securely.
      </p>
    </form>
  )
}

function SupportFundraiserPopup({ onClose, onBecomeAFundraiser }: { onClose: () => void; onBecomeAFundraiser: () => void }) {
  return (
    <div className="text-center space-y-6 py-2">
      <h3 className="text-2xl font-bold">Support a Fundraiser</h3>
      <p className="text-muted-foreground">Choose how you&apos;d like to get involved</p>
      <div className="space-y-4">
        <Link
          href="/events/wolfrun/fundraisers"
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition"
        >
          <Heart className="w-5 h-5" />
          View Fundraisers
        </Link>
        <button
          onClick={onBecomeAFundraiser}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-muted text-foreground rounded-xl font-semibold text-lg hover:bg-muted/80 transition border border-border"
        >
          <Users className="w-5 h-5" />
          Become a Fundraiser
        </button>
      </div>
      <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition underline">
        Close
      </button>
    </div>
  )
}

export function WolfRunContent() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showSupportPopup, setShowSupportPopup] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/events/wolfrun-hero.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-amber-900/80" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/grid.svg')" }} />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-8">
              <Calendar className="w-4 h-4" />
              12th September 2026 — Warwickshire
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Born to Battle.<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Built to Endure.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the Devanhaar pack for the Wolf Run — the UK&apos;s wildest obstacle run. 
              Become a fundraiser, share your link, and collect sponsorships to support 
              Sikh education, camps, and community programmes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowPaymentForm(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-slate-900 rounded-xl font-bold text-lg hover:bg-amber-400 transition shadow-lg shadow-amber-500/25"
              >
                Join Wolf Run
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSupportPopup(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition border border-white/20"
              >
                Support a Fundraiser
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Wolf Run */}
      <section className="py-20 bg-background" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What is the Wolf Run?</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                The Wolf Run is one of the UK&apos;s most iconic wild running events. Set in the 
                Warwickshire countryside at Offchurch Bury near Leamington Spa, you&apos;ll take on 
                a 5K course packed with mud, woodland, freezing lakes, streams, and natural obstacles.
              </p>
              <p>
                This isn&apos;t a race — there are no winners. It&apos;s about showing up together, 
                getting absolutely filthy, and having the time of your life doing it. When someone 
                struggles, the group pulls them through. When the mud swallows your shoe, 
                someone&apos;s there laughing with you and dragging you out.
              </p>
              <p>
                It doesn&apos;t matter if you&apos;re fast, fit, or have never run a day in your life. 
                What matters is that you turn up, give it everything, and cross that finish line together.
              </p>
              <p>
                That&apos;s what brotherhood, and sisterhood, look like.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-muted/50 rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                <div className="font-bold text-lg">12th September 2026</div>
                <div className="text-sm text-muted-foreground">The Wolf Run</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                <div className="font-bold text-lg">Warwickshire</div>
                <div className="text-sm text-muted-foreground">The Offchurch Bury, Offchurch, Leamington Spa, CV33 9AW</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                <div className="font-bold text-lg">60 Spaces</div>
                <div className="text-sm text-muted-foreground">Book your Space NOW</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Devanhaar */}
      <section className="py-20 bg-muted/30" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why We&apos;re Running for Devanhaar</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Devanhaar is a Sikh-led charity creating educational and community spaces for 
                learning, growth, and service. From Singhs Camp UK and Kaurs Camp UK to Sikhi Vidyala, 
                university outreach, and community programmes — every penny raised goes towards 
                empowering the next generation.
              </p>
              <p>
                By taking on the Wolf Run together, we&apos;re not just challenging ourselves physically — 
                we&apos;re showing the power of community and raising vital funds for programmes that 
                change lives.
              </p>
              <p>And along the way, you&apos;ll take something back for yourself too:</p>
            </div>
            <ul className="list-disc list-inside mt-6 space-y-2 text-muted-foreground text-lg">
              <li>Mental Resilience</li>
              <li>Real Confidence</li>
              <li>Comfort with Discomfort</li>
              <li>Team Spirit</li>
              <li>Chardi Kala</li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Packs */}
      <section className="py-20 bg-background" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Pack</h2>
            <p className="text-lg text-muted-foreground">Two packs. One mission. Choose yours.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Singhs Camp UK Pack</h3>
              <p className="text-amber-700/80 mb-6">
                Representing the Singhs Camp UK community. Run together, raise together, 
                and show what brotherhood means.
              </p>
              <button
                onClick={() => setShowRegistration(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
              >
                Join the Singhs Pack
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-2">Kaurs Camp UK Pack</h3>
              <p className="text-purple-700/80 mb-6">
                Representing the Kaurs Camp UK community. Stand strong, run wild, and 
                make an impact for sisterhood.
              </p>
              <button
                onClick={() => setShowRegistration(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition"
              >
                Join the Kaurs Pack
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Fundraising Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to start raising money for Devanhaar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Sign Up</h3>
              <p className="text-muted-foreground text-sm">
                Register as a fundraiser and choose your pack — Singhs or Kaurs. 
                You&apos;ll get your own unique fundraising page.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Share Your Link</h3>
              <p className="text-muted-foreground text-sm">
                Send your unique link to friends, family, and colleagues via WhatsApp, 
                social media, or however you like.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Collect Sponsorships</h3>
              <p className="text-muted-foreground text-sm">
                People donate through your link. Every donation is tracked to you, 
                and all funds go to Devanhaar.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => setShowRegistration(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-20 bg-background" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Event Details</h2>
            <div className="bg-muted/50 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Autumn Wolf 2026</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" />
                      <span>Saturday 12th September 2026</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" />
                      <span>The Offchurch Bury, Offchurch, Leamington Spa, CV33 9AW</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4">Entry Prices</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex justify-between">
                      <span>Wolf 5K</span>
                      <span className="font-semibold text-foreground">£45</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Entry fees are paid directly to Wolf Run. Our fundraising is separate — sponsorship 
                  donations go to Devanhaar.
                </p>
                <a
                  href="https://thewolfrun.com/entry/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Enter via thewolfrun.com
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-muted/30" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-background rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-muted/50 transition"
                  >
                    {faq.q}
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        expandedFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-5 pb-5 text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900" data-animate>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg text-white/70 mb-8">
              Whether you&apos;re running the course or raising funds from the sidelines, 
              every effort counts. Join the pack today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowPaymentForm(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-slate-900 rounded-xl font-bold text-lg hover:bg-amber-400 transition"
              >
                Join Wolf Run
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSupportPopup(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition border border-white/20"
              >
                Support a Fundraiser
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRegistration(false)} />
          <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRegistration(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <FundraiserRegistrationForm onClose={() => setShowRegistration(false)} />
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentForm(false)} />
          <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentForm(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <WolfRunPaymentForm onClose={() => setShowPaymentForm(false)} />
          </div>
        </div>
      )}

      {/* Support Fundraiser Popup */}
      {showSupportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSupportPopup(false)} />
          <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button
              onClick={() => setShowSupportPopup(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SupportFundraiserPopup
              onClose={() => setShowSupportPopup(false)}
              onBecomeAFundraiser={() => {
                setShowSupportPopup(false)
                setShowRegistration(true)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

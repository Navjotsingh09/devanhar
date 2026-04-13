"use client"

import { useState, useEffect } from "react"
import { Heart, Shield, Building2, Users, BookOpen, Tent, GraduationCap, Check, ArrowRight, Sparkles, Gift, CreditCard, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
const presetAmounts = [10, 25, 50, 100, 250]

const impactItems = [
  { amount: 10, icon: BookOpen, description: "Provides learning materials for one child at Kids Camp", color: "bg-blue-500" },
  { amount: 25, icon: Users, description: "Funds a day of langar seva for community events", color: "bg-green-500" },
  { amount: 50, icon: Tent, description: "Supports one young person's camp registration", color: "bg-amber-500" },
  { amount: 100, icon: GraduationCap, description: "Covers travel costs for university outreach talks", color: "bg-purple-500" },
  { amount: 250, icon: Heart, description: "Sponsors an entire family's camp experience", color: "bg-rose-500" },
]

export function DonateContent() {
  const [amount, setAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [frequency, setFrequency] = useState<"one-time" | "monthly" | "quarterly" | "yearly">("one-time")
  const [giftAid, setGiftAid] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<{ stripeConnected: boolean; nowDonateConnected: boolean } | null>(null)

  const effectiveAmount = customAmount ? parseFloat(customAmount) : amount
  const giftAidBonus = giftAid && effectiveAmount ? effectiveAmount * 0.25 : 0
  const totalWithGiftAid = (effectiveAmount || 0) + giftAidBonus

  const handleSelectAmount = (value: number) => {
    setAmount(value)
    setCustomAmount("")
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    setAmount(null)
  }

  const frequencyMap: Record<string, string> = {
    "one-time": "o",
    monthly: "m",
    quarterly: "q",
    yearly: "y",
  }

  const handleDonate = async () => {
    if (!effectiveAmount || effectiveAmount <= 0) return
    setError("")
    setLoading(true)
    try {
      const params = new URLSearchParams({
        amount: String(effectiveAmount),
        repeat: frequencyMap[frequency] || "o",
        giftaid: String(giftAid),
      })
      const res = await fetch(`/api/donate?${params.toString()}`)
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Something went wrong. Please try again.")
        setLoading(false)
      }
    } catch {
      setError("Unable to connect to payment service. Please try again.")
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadPaymentStatus = async () => {
      try {
        const res = await fetch("/api/payment-status", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted) {
          setPaymentStatus({
            stripeConnected: Boolean(data?.stripeConnected),
            nowDonateConnected: Boolean(data?.nowDonateConnected),
          })
        }
      } catch {
        // Keep UI resilient if status endpoint is unavailable.
      }
    }
    loadPaymentStatus()
    return () => {
      isMounted = false
    }
  }, [])




  return (
    <main className="pt-24 pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f8f8f8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
          {/* Main Headline */}
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1f2e] mb-5 leading-[1.1] tracking-tight">
              Great futures are built with a small donation
            </h1>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
              Empowering community initiatives &mdash; your generosity makes it all possible.
            </p>

          </div>

          {/* Donation Form */}
          <div id="donate-form" className="max-w-6xl mx-auto mt-14 md:mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-10" data-animate>
                {/* Frequency Toggle */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Donation Type</label>
                  <div className="inline-flex p-1 bg-muted rounded-xl">
                    <button
                      onClick={() => setFrequency("one-time")}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        frequency === "one-time"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      One-time
                    </button>
                    <button
                      onClick={() => setFrequency("monthly")}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                        frequency === "monthly"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Monthly
                    </button>
                    <button
                      onClick={() => setFrequency("quarterly")}
                      className={"px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 " + (frequency === "quarterly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >
                      Quarterly
                    </button>
                    <button
                      onClick={() => setFrequency("yearly")}
                      className={"px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 " + (frequency === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >
                      Yearly
                    </button>
                  </div>
                  {frequency !== "one-time" && (
                    <p className="mt-2 text-xs text-amber-600">Regular giving provides sustained support for our programmes</p>
                  )}
                </div>

                {/* Amount Selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Select Amount</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {presetAmounts.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleSelectAmount(value)}
                        className={`relative px-4 py-4 rounded-xl text-center font-semibold transition-all duration-300 ${
                          amount === value && !customAmount
                            ? "bg-amber-400 text-black ring-2 ring-amber-400 ring-offset-2 ring-offset-background"
                            : "bg-muted text-foreground hover:bg-muted/80 hover:ring-1 hover:ring-border"
                        }`}
                      >
                        <span className="text-lg">£{value}</span>
                        {amount === value && !customAmount && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mt-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">£</span>
                      <input
                        type="number"
                        placeholder="Other amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 rounded-xl bg-muted border-2 border-transparent focus:border-amber-400 focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Gift Aid */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => setGiftAid(!giftAid)}
                      className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        giftAid
                          ? "bg-green-500 border-green-500"
                          : "border-green-500/50 hover:border-green-500"
                      }`}
                    >
                      {giftAid && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-foreground">Add Gift Aid</span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">+25%</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any difference.
                      </p>
                      {giftAid && effectiveAmount && effectiveAmount > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-green-500/10">
                          <p className="text-sm text-green-600 font-medium">
                            We'll reclaim an extra £{giftAidBonus.toFixed(2)} from HMRC!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Donor Info */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-foreground">Your Details</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-4 py-4 rounded-xl bg-muted border-2 border-transparent focus:border-amber-400 focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-4 rounded-xl bg-muted border-2 border-transparent focus:border-amber-400 focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

                {/* Submit Button */}
                <button
                  onClick={handleDonate}
                  disabled={!effectiveAmount || effectiveAmount <= 0 || loading}
                  className="w-full py-5 px-8 bg-amber-400 hover:bg-amber-500 disabled:bg-muted disabled:text-muted-foreground text-black font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>
                        Donate £{effectiveAmount?.toFixed(2) || "0.00"}{frequency !== "one-time" ? " " + frequency : ""}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">Secure payment powered by NowDonate™</span>
                </div>
                {paymentStatus && (
                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        paymentStatus.stripeConnected
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      Stripe connection: {paymentStatus.stripeConnected ? "Connected" : "Not configured"}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-2" data-animate>
                <div className="sticky top-28 p-6 rounded-2xl bg-muted/50 border border-border">
                  <h3 className="font-semibold text-foreground mb-6">Donation Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-foreground">£{effectiveAmount?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium text-foreground capitalize">{frequency}</span>
                    </div>
                    {giftAid && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Gift Aid (25%)</span>
                        <span className="font-medium text-green-600">+£{giftAidBonus.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-px bg-border my-4" />
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Total Impact</span>
                      <span className="text-2xl font-bold text-amber-500">£{totalWithGiftAid.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-8 pt-6 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>Registered UK Charity</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      <span>100% goes to programmes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>Secure & encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-gradient-to-b from-[#0d1120] to-[#1a1f2e] text-white">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center mb-16" data-animate>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-4">Your Impact</p>
            <h2 className="text-3xl md:text-5xl font-light mb-6 tracking-tight">See What Your Donation Achieves</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Every pound makes a difference. Here's how your generosity transforms lives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-animate>
            {impactItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.amount}
                  className={`relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all duration-300 group ${
                    effectiveAmount === item.amount ? "ring-2 ring-amber-400 border-amber-400" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-amber-400 mb-2">£{item.amount}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="donate-form" className="bg-background border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center" data-animate>
            <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-amber-500" />
            </div>
            <blockquote className="text-xl md:text-3xl font-light text-foreground leading-relaxed mb-8">
              "Devanhaar gave me a community and a sense of purpose. The camp changed my life — I went from feeling disconnected from my roots to being proud of who I am."
            </blockquote>
            <div>
              <p className="font-medium text-foreground">Harpreet Singh</p>
              <p className="text-sm text-muted-foreground">Singhs Camp 2023 Participant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-[#0d1120] text-white">
        <div className="container mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16" data-animate>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">Registered Charity</p>
                <p className="text-xs text-gray-400">UK Charity Commission</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">Secure Payments</p>
                <p className="text-xs text-gray-400">256-bit SSL Encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">100% Impact</p>
                <p className="text-xs text-gray-400">Every penny counts</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

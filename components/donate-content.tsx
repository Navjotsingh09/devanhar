"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Shield, Building2, Users, BookOpen, Tent, GraduationCap, Check, ArrowRight, Sparkles, Gift, CreditCard, Lock, ChevronDown, Loader2, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const presetAmounts = [10, 25, 50, 100, 250]

const impactItems = [
  { amount: 10, icon: BookOpen, description: "Provides learning materials for one child at Kids Camp", color: "bg-blue-500" },
  { amount: 25, icon: Users, description: "Funds a day of langar seva for community events", color: "bg-green-500" },
  { amount: 50, icon: Tent, description: "Supports one young person's camp registration", color: "bg-amber-500" },
  { amount: 100, icon: GraduationCap, description: "Covers travel costs for university outreach talks", color: "bg-purple-500" },
  { amount: 250, icon: Heart, description: "Sponsors an entire family's camp experience", color: "bg-rose-500" },
]

const faqs = [
  {
    q: "How is my donation used?",
    a: "100% of your donation goes directly to our programmes. We operate with minimal overhead, and all administrative costs are covered separately by our trustees."
  },
  {
    q: "What is Gift Aid?",
    a: "Gift Aid allows us to claim an extra 25p for every £1 you donate at no extra cost to you. You must be a UK taxpayer and pay Income Tax and/or Capital Gains Tax at least equal to the tax we reclaim."
  },
  {
    q: "Can I set up a regular donation?",
    a: "Yes! Monthly donations help us plan long-term and sustain our programmes throughout the year. You can cancel anytime."
  },
  {
    q: "Is my donation secure?",
    a: "Absolutely. All payments are processed through secure, encrypted payment systems. We never store your card details."
  },
]

export function DonateContent() {
  const [amount, setAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [frequency, setFrequency] = useState<"one-time" | "monthly" | "quarterly" | "yearly">("one-time")
  const [giftAid, setGiftAid] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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


  // CountUp animation hook
  const useCountUp = (end: number, duration = 2000, suffix = "") => {
    const [count, setCount] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
      if (!ref.current) return
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true) },
        { threshold: 0.3 }
      )
      observer.observe(ref.current)
      return () => observer.disconnect()
    }, [hasStarted])

    useEffect(() => {
      if (!hasStarted) return
      let startTime: number
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, [hasStarted, end, duration])

    return { count: count + suffix, ref }
  }

  // Scroll-triggered card animations
  const gridRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll("[data-card]")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              ;(entry.target as HTMLElement).style.opacity = "1"
              ;(entry.target as HTMLElement).style.transform = "translateY(0) scale(1)"
            }, i * 100)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    cards.forEach((card) => {
      ;(card as HTMLElement).style.opacity = "0"
      ;(card as HTMLElement).style.transform = "translateY(40px) scale(0.95)"
      ;(card as HTMLElement).style.transition = "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
      observer.observe(card)
    })
    return () => observer.disconnect()
  }, [])

  const stat85 = useCountUp(85, 2000, "%")
  const stat1000 = useCountUp(1000, 2500, "+")
  const stat500 = useCountUp(500, 2000, "+")

  return (
    <main className="pt-24 pb-0">
      {/* Bento Grid Hero */}
      <section className="relative overflow-hidden bg-[#f8f8f8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
          {/* Main Headline */}
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1f2e] mb-5 leading-[1.1] tracking-tight">
              Great futures are built with a small charity
            </h1>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
              Empowering young Sikhs across the UK through education, camps, and community &mdash; your generosity makes it all possible.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="#donate-form"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a1f2e] text-white rounded-full text-sm font-medium hover:bg-[#252a3a] transition-all duration-300 hover:shadow-lg hover:shadow-[#1a1f2e]/20 hover:-translate-y-0.5"
              >
                Donate now
              </Link>
            </div>
          </div>

          {/* Bento Grid */}
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 md:gap-4 max-w-6xl mx-auto">
            {/* Card 1: Stats */}
            <Link href="#donate-form" data-card className="col-span-2 md:col-span-2 lg:col-span-3 row-span-2 bg-[#1a1f2e] rounded-3xl p-6 flex flex-col justify-between min-h-[320px] md:min-h-[400px] relative overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-[#1a1f2e]/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors duration-500" />
              <div>
                <span ref={stat85.ref} className="text-5xl md:text-6xl font-bold text-[#F59E0B]">{stat85.count}</span>
                <p className="text-white/80 text-sm mt-3 leading-relaxed">
                  Of every pound goes directly to Sikh education, camps, and community initiatives across the UK.
                </p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="text-white text-sm font-medium">Donate now</span>
                <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center group-hover:bg-[#FBBF24] transition-all duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 text-[#1a1f2e]" />
                </div>
              </div>
            </Link>

            {/* Card 2: Singhs Camp */}
            <Link href="/initiatives/singhs-camp" data-card className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-3xl overflow-hidden relative min-h-[180px] group cursor-pointer hover:shadow-lg transition-all duration-500">
              <Image src="/images/donate-singhscamp.jpg" alt="Singhs Camp" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-4 left-4 text-xs font-medium text-white/90 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">Camps</span>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-sm leading-tight">Singhs Camp for <span ref={stat500.ref} className="tabular-nums">{stat500.count}</span> Youth across the UK</p>
              </div>
            </Link>

            {/* Card 3: Join community */}
            <Link href="#donate-form" data-card className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#F59E0B] rounded-3xl p-5 flex flex-col justify-between min-h-[180px] group cursor-pointer hover:bg-[#FBBF24] transition-all duration-500 hover:shadow-lg">
              <p className="text-[#1a1f2e] text-2xl md:text-3xl font-bold leading-tight">Join <span ref={stat1000.ref} className="tabular-nums">{stat1000.count}</span><br />Donors</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[#1a1f2e]/70 text-sm font-medium">Join community</span>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-[#1a1f2e]" />
                </div>
              </div>
            </Link>

            {/* Card 4: About Us */}
            <Link href="/about" data-card className="col-span-2 md:col-span-2 lg:col-span-3 row-span-2 rounded-3xl overflow-hidden relative min-h-[320px] md:min-h-[400px] group cursor-pointer hover:shadow-xl transition-all duration-500">
              <Image src="/images/about-people.jpg" alt="Our Community" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute top-4 left-4 text-xs font-medium text-white/90 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">About Us</span>
              <div className="absolute bottom-6 left-5 right-5 flex items-center justify-between">
                <span className="text-white text-sm font-medium">Learn more</span>
                <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center group-hover:bg-[#FBBF24] transition-all duration-300 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 text-[#1a1f2e]" />
                </div>
              </div>
            </Link>

            {/* Card 5: Forums */}
            <Link href="/initiatives/forums" data-card className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#F59E0B] rounded-3xl p-5 flex flex-col justify-center items-center min-h-[180px] group cursor-pointer hover:bg-[#FBBF24] transition-all duration-500 hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-5 h-5 text-[#1a1f2e]" />
              </div>
              <p className="text-[#1a1f2e] font-bold text-lg text-center leading-tight">Let them<br />be heard</p>
            </Link>

            {/* Card 6: Sikhi Vidyala */}
            <Link href="/initiatives/sikhi-vidyala" data-card className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-3xl overflow-hidden relative min-h-[180px] group cursor-pointer hover:shadow-lg transition-all duration-500">
              <Image src="/images/donate-sikhi-vidyala.jpg" alt="Sikhi Vidyala" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-4 left-4 text-xs font-medium text-white/90 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">Education</span>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-sm leading-tight">Sponsor education for Sikh youth across the UK</p>
              </div>
            </Link>

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

      {/* FAQ Section */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12" data-animate>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-500 mb-4">Questions</p>
              <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3" data-animate>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-foreground pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                        expandedFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedFaq === idx ? "max-h-48" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
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

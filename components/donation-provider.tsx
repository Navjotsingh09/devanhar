"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { ArrowRight, ShieldCheck, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const presetAmounts = [10, 25, 50, 100, 250, 500]

interface DonationContextType {
  openDonation: (source: string) => void
}

const DonationContext = createContext<DonationContextType>({
  openDonation: () => {},
})

export function useDonation() {
  return useContext(DonationContext)
}

function DonationModal({
  source,
  onClose,
}: {
  source: string
  onClose: () => void
}) {
  const [step, setStep] = useState<"form" | "submitting" | "success">("form")
  const [donationType, setDonationType] = useState<"one-off" | "monthly">(
    "one-off",
  )
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [giftAid, setGiftAid] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  })

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0)

  function handleAmountClick(value: number) {
    setSelectedAmount(value)
    setCustomAmount("")
  }

  function handleCustomAmountChange(value: string) {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (amount <= 0) return
    setStep("submitting")

    // Log donation intent to Supabase
    if (supabase) {
      try {
        await supabase.from("donation_intents").insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          message: formData.message || null,
          amount,
          frequency: donationType,
          gift_aid: giftAid,
          source,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }])
      } catch (err) {
        console.error("[Devanhaar] Failed to log donation intent:", err)
      }
    }

    const justGivingUrl = `https://www.justgiving.com/charity/devanhaar/donate?amount=${amount}&frequency=${donationType === "monthly" ? "monthly" : "single"}`

    await new Promise((r) => setTimeout(r, 1200))

    window.open(justGivingUrl, "_blank", "noopener,noreferrer")
    setStep("success")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
        role="button"
        tabIndex={0}
        aria-label="Close donation form"
      />

      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Make a Donation
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {"Support Devanhaar's mission"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {/* Type Toggle */}
            <div className="flex rounded-xl bg-secondary p-1 mb-6">
              <button
                type="button"
                onClick={() => setDonationType("one-off")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  donationType === "one-off"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                One-off
              </button>
              <button
                type="button"
                onClick={() => setDonationType("monthly")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  donationType === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Amount Selection */}
            <p className="text-sm font-medium text-foreground mb-3">
              Select amount
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAmountClick(value)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                    selectedAmount === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-transparent hover:border-primary/30"
                  }`}
                >
                  &pound;{value}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                &pound;
              </span>
              <input
                type="number"
                min="1"
                placeholder="Other amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Donor Info */}
            <p className="text-sm font-medium text-foreground mb-3">
              Your details
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="First name"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <input
                type="text"
                placeholder="Last name"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <input
              type="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-3"
            />
            <textarea
              placeholder="Leave a message (optional)"
              rows={2}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-5"
            />

            {/* Gift Aid */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={giftAid}
                  onChange={(e) => setGiftAid(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                  {giftAid && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Add Gift Aid
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  I am a UK taxpayer and understand that if I pay less Income
                  Tax and/or Capital Gains Tax than the amount of Gift Aid
                  claimed on all my donations, it is my responsibility to pay
                  any difference.
                </p>
              </div>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={amount <= 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-13 text-base font-semibold disabled:opacity-40"
            >
              Donate &pound;{amount > 0 ? amount : "0"}
              {donationType === "monthly" ? "/month" : ""}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground/60">
                Secure and encrypted donation
              </p>
            </div>
          </form>
        )}

        {step === "submitting" && (
          <div className="px-8 pb-12 pt-8 flex flex-col items-center text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-6" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processing your donation...
            </h3>
            <p className="text-sm text-muted-foreground">
              You will be redirected to complete your payment securely.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="px-8 pb-10 pt-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Thank you for your generosity
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              A secure payment page has been opened for you to complete your
              &pound;{amount}
              {donationType === "monthly" ? "/month" : ""} donation. Waheguru Ji
              Ka Khalsa, Waheguru Ji Ki Fateh.
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-xl bg-transparent"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState("")

  const openDonation = useCallback((src: string) => {
    setSource(src)
    setIsOpen(true)
  }, [])

  return (
    <DonationContext.Provider value={{ openDonation }}>
      {children}
      {isOpen && (
        <DonationModal source={source} onClose={() => setIsOpen(false)} />
      )}
    </DonationContext.Provider>
  )
}

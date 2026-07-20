"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function TestDonation() {
  const [donationAmount, setDonationAmount] = useState("199")
  const [monthlyOpted, setMonthlyOpted] = useState("no")
  const [monthlyAmount, setMonthlyAmount] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold text-center">Singhs Camp UK Application</h2>
        <p className="text-sm text-muted-foreground text-center">Step 8 of 8 — Contact Consent</p>
        <hr />

        {/* Camp Fee Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold">Support Singhs Camp UK</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The standard camp contribution is <strong>£199</strong>. If you are able to give more, your generosity directly funds activities, meals and facilities for all campers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[199, 250, 350].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setDonationAmount(String(amt))}
                className={`relative rounded-xl border-2 p-3 text-center transition-all duration-150 ${donationAmount === String(amt) ? "border-amber-500 bg-amber-50 shadow-md ring-1 ring-amber-300" : "border-gray-200 hover:border-amber-300 hover:shadow-sm"}`}
              >
                {amt === 199 && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Standard</span>}
                {amt === 250 && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Popular</span>}
                {amt === 350 && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Generous</span>}
                <span className="text-xl font-bold">£{amt}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { if (["199","250","350"].includes(donationAmount)) setDonationAmount(""); }}
            className={`w-full rounded-xl border-2 p-3 text-center transition-all ${!["199","250","350"].includes(donationAmount) ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-300"}`}
          >
            <span className="text-sm font-medium text-gray-500">Custom amount</span>
          </button>

          {!["199", "250", "350"].includes(donationAmount) && (
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">£</span>
                <Input
                  type="number" min="199" step="1"
                  className="pl-7 text-center text-lg font-semibold"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  autoFocus
                />
              </div>
              {donationAmount && Number(donationAmount) < 199 && (
                <p className="text-xs text-red-600 mt-1 text-center">Minimum camp contribution is £199</p>
              )}
            </div>
          )}

          {Number(donationAmount) > 199 && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">Thank you!</span> Your extra £{Number(donationAmount) - 199} helps fund camp activities and support those who need financial assistance.
              </p>
            </div>
          )}
        </div>

        {/* Monthly Donation Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold">Regular Monthly Donation</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Would you like to set up a regular monthly donation to support Devanhaar? This is entirely optional and separate from your camp contribution.
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setMonthlyOpted("yes"); if (!monthlyAmount) setMonthlyAmount("10"); }}
              className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-semibold transition-all ${monthlyOpted === "yes" ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-300"}`}
            >
              Yes, I'd like to give monthly
            </button>
            <button
              type="button"
              onClick={() => { setMonthlyOpted("no"); setMonthlyAmount(""); }}
              className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-semibold transition-all ${monthlyOpted === "no" ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-300"}`}
            >
              No thanks
            </button>
          </div>

          {monthlyOpted === "yes" && (
            <div>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Choose a monthly amount.
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[5, 10, 20, 50].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMonthlyAmount(String(amt))}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${monthlyAmount === String(amt) ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-300"}`}
                  >
                    <span className="text-lg font-bold">£{amt}</span>
                    <span className="block text-[10px] text-gray-500">/month</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { if (["5","10","20","50"].includes(monthlyAmount)) setMonthlyAmount(""); }}
                className={`w-full rounded-xl border-2 p-3 text-center transition-all ${!["5","10","20","50"].includes(monthlyAmount) && monthlyAmount !== "" ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-300"}`}
              >
                <span className="text-sm font-medium text-gray-500">Custom monthly amount</span>
              </button>

              {!["5","10","20","50"].includes(monthlyAmount) && (
                <div className="mt-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">£</span>
                  <Input
                    type="number" min="1" step="1"
                    className="pl-7 text-center text-lg font-semibold"
                    value={monthlyAmount}
                    onChange={e => setMonthlyAmount(e.target.value)}
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/month</span>
                </div>
              )}

              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-800">
                  Your monthly donation of <strong>£{monthlyAmount || '0'}</strong> will be automatically deducted each month once your application is approved.
                </p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span>Camp fee (one-off):</span>
              <span className="font-semibold">£{Math.max(Number(donationAmount) || 199, 199)}</span>
            </div>
            {monthlyOpted === "yes" && Number(monthlyAmount) > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span>Monthly donation:</span>
                <span className="font-semibold">£{monthlyAmount}/month</span>
              </div>
            )}
            <div className="border-t mt-2 pt-2 flex justify-between text-sm font-bold">
              <span>Total charged today:</span>
              <span>£{Math.max(Number(donationAmount) || 199, 199)}</span>
            </div>
            {monthlyOpted === "yes" && Number(monthlyAmount) > 0 && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                + £{monthlyAmount}/month starting after approval
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button className="px-4 py-2 border rounded-lg text-sm">← Back</button>
          <button
            disabled={Number(donationAmount) < 199}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  )
}

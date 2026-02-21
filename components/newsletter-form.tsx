"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [email, setEmail] = useState("")

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    setErrorMsg("")

    try {
      if (supabase) {
        const { error } = await supabase
          .from("newsletter_subscriptions")
          .upsert([{ email }], { onConflict: "email" })

        if (error) throw error
      } else {
        console.warn("Supabase not configured - newsletter subscription not saved")
      }

      setStatus("success")
      setEmail("")
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err) {
      console.error("Newsletter subscription error:", err)
      setErrorMsg("Could not subscribe. Please try again.")
      setStatus("error")
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  return (
    <div className="max-w-sm ml-auto w-full">
      <h3 className="text-lg font-bold text-white mb-2">
        Be a part of the future of education
      </h3>
      <p className="text-sm text-white/40 mb-4">Stay updated with our initiatives</p>

      {status === "success" ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-green-900/30 border border-green-500/20">
          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">Subscribed! Thank you.</p>
        </div>
      ) : (
        <form onSubmit={handleSubscribe}>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email goes here"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-3 text-sm"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>
          {status === "error" && (
            <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
          )}
        </form>
      )}
    </div>
  )
}

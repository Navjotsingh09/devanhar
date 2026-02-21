"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function FooterContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const form = e.currentTarget
    const fd = new FormData(form)
    const firstName = fd.get("firstName") as string
    const lastName = fd.get("lastName") as string
    const email = fd.get("email") as string
    const message = fd.get("message") as string

    try {
      if (supabase) {
        const { error } = await supabase
          .from("footer_contact_submissions")
          .insert([{ first_name: firstName, last_name: lastName, email, message }])

        if (error) throw error
      } else {
        window.location.href = `mailto:info@devanhaar.com?subject=Contact from ${firstName} ${lastName}&body=${encodeURIComponent(message)}`
        return
      }

      setStatus("success")
      form.reset()
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err) {
      console.error("Footer contact error:", err)
      setErrorMsg("Something went wrong. Please try again or email us directly.")
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
      <h3 className="text-lg font-bold text-foreground mb-6">
        Send us a message
      </h3>

      {status === "success" ? (
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-7 w-7 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">Message sent!</h4>
          <p className="text-sm text-muted-foreground">Thank you for reaching out. We will get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{errorMsg}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="footerFirstName" className="text-xs font-medium text-muted-foreground mb-2 block">
                First name
              </label>
              <input type="text" id="footerFirstName" name="firstName" required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Your first name" />
            </div>
            <div>
              <label htmlFor="footerLastName" className="text-xs font-medium text-muted-foreground mb-2 block">
                Last name
              </label>
              <input type="text" id="footerLastName" name="lastName" required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Your last name" />
            </div>
          </div>
          <div>
            <label htmlFor="footerEmail" className="text-xs font-medium text-muted-foreground mb-2 block">
              Email
            </label>
            <input type="email" id="footerEmail" name="email" required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="your@email.com" />
          </div>
          <div>
            <label htmlFor="footerMessage" className="text-xs font-medium text-muted-foreground mb-2 block">
              Message
            </label>
            <textarea id="footerMessage" name="message" rows={4} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              placeholder="Tell us how we can help..." />
          </div>
          <Button type="submit" disabled={status === "loading"}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5 text-sm">
            {status === "loading" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <>Send Message <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

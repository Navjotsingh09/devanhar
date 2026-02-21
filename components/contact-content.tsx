"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Send, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ContactContent() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)
    const name = data.get("name") as string
    const email = data.get("email") as string
    const subject = data.get("subject") as string
    const message = data.get("message") as string

    try {
      if (supabase) {
        const { error: dbError } = await supabase
          .from("form_submissions")
          .insert([{ full_name: name, email, message, form_data: { subject }, status: "new" }])

        if (dbError) throw dbError
      } else {
        window.location.href = `mailto:info@devanhaar.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
        return
      }

      setSubmitted(true)
      form.reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error("Error:", err)
      window.location.href = `mailto:info@devanhaar.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen mt-20">
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-6 lg:px-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Have questions about our initiatives? We would love to hear from you.</p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <Check className="h-12 w-12 text-green-600 mb-4 mx-auto" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
              <p className="text-muted-foreground">Thank you for reaching out. We will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input type="text" name="name" required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <input type="text" name="subject" required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea name="message" rows={6} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send Message"}</Button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

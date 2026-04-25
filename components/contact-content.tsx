"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Mail, MapPin, Clock, Instagram, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "contact@devanhaar.com",
    href: "mailto:contact@devanhaar.com",
    description: "We aim to respond within 48 hours",
  },
  {
    icon: Instagram,
    title: "Instagram",
    detail: "@devanhaar",
    href: "https://instagram.com/devanhaar",
    description: "Follow us for updates and events",
  },
  {
    icon: MapPin,
    title: "Location",
    detail: "United Kingdom",
    description: "Events held across the UK",
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "Within 48 hours",
    description: "Mon – Fri, 9am – 6pm GMT",
  },
]

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
      // Save to Supabase if available
      if (supabase) {
        await supabase
          .from("contact_submissions")
          .insert([{ full_name: name, email, message, form_data: { subject }, status: "new" }])
      }

      // Send email notification via API
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          source_page: "Contact Page",
        }),
      })

      setSubmitted(true)
      form.reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error("Error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you have a question about our projects, want to volunteer, or are interested in partnering with us — our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item) => {
              const Icon = item.icon
              const Wrapper = item.href ? "a" : "div"
              const wrapperProps = item.href
                ? { href: item.href, target: item.href.startsWith("http") ? "_blank" as const : undefined, rel: item.href.startsWith("http") ? "noopener noreferrer" : undefined }
                : {}
              return (
                <Wrapper
                  key={item.title}
                  {...wrapperProps}
                  className="group relative rounded-2xl border border-border bg-card p-6 text-center transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-base font-medium text-primary mb-1">{item.detail}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </Wrapper>
              )
            })}
          </div>
        </div>
      </section>

      {/* Form + Side Info */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Send Us a Message</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Fill out the form and our team will get back to you as soon as possible. We welcome enquiries about volunteering, partnerships, donations, camp registration, and more.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">What can we help with?</h3>
                <ul className="space-y-3">
                  {[
                    "Volunteering opportunities",
                    "Camp and programme registration",
                    "Partnership and sponsorship",
                    "Donation enquiries",
                    "General questions",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-7 w-7 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground">Thank you for reaching out. We will get back to you within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm space-y-6">
                  {error && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      placeholder="What is this about?"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      placeholder="Tell us more about your enquiry..."
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} size="lg" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

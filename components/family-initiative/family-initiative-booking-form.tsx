"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Attendee = { name: string; age: string }
type Travel = "door" | "transport"
const RATES = { child: { door: 8, transport: 10 }, adult: { door: 15, transport: 20 } }
const emptyAttendee = (): Attendee => ({ name: "", age: "" })
const namePattern = /^[\p{L}\p{M}\s'.()\-]{1,80}$/u
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[\d\s+\-()]{7,24}$/

export function FamilyInitiativeBookingForm() {
  const [contact, setContact] = useState({ name: "", email: "", phone: "", medical: "", consent: false })
  const [children, setChildren] = useState<Attendee[]>([emptyAttendee()])
  const [adults, setAdults] = useState<Attendee[]>([emptyAttendee()])
  const [travel, setTravel] = useState<Travel>("door")
  const [pickup, setPickup] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState("")
  const [error, setError] = useState("")
  const successRef = useRef<HTMLDivElement>(null)
  const total = children.length * RATES.child[travel] + adults.length * RATES.adult[travel]
  const updateContact = (field: string, value: string | boolean) => setContact((current) => ({ ...current, [field]: value }))
  const updateAttendee = (group: "children" | "adults", index: number, field: keyof Attendee, value: string) => {
    const setter = group === "children" ? setChildren : setAdults
    setter((current) => current.map((attendee, attendeeIndex) => attendeeIndex === index ? { ...attendee, [field]: value } : attendee))
  }
  const addAttendee = (group: "children" | "adults") => {
    const setter = group === "children" ? setChildren : setAdults
    setter((current) => current.length < 20 ? [...current, emptyAttendee()] : current)
  }
  const removeAttendee = (group: "children" | "adults", index: number) => {
    const setter = group === "children" ? setChildren : setAdults
    setter((current) => current.length > 1 ? current.filter((_, attendeeIndex) => attendeeIndex !== index) : current)
  }
  useEffect(() => { if (submitted) successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }) }, [submitted])
  const validate = () => {
    if (!namePattern.test(contact.name.trim())) return "Please enter the main contact's name."
    if (!emailPattern.test(contact.email.trim())) return "Please enter a valid email address."
    if (!phonePattern.test(contact.phone.trim())) return "Please enter a valid phone or WhatsApp number."
    if (children.some((attendee) => !namePattern.test(attendee.name.trim()) || !/^\d{1,2}$/.test(attendee.age))) return "Please complete every child's name and age."
    if (adults.some((attendee) => !namePattern.test(attendee.name.trim()) || !/^\d{1,3}$/.test(attendee.age))) return "Please complete every adult's name and age."
    if (travel === "transport" && pickup.trim().length < 2) return "Please provide your pickup point or transport details."
    if (!contact.consent) return "Please agree to the Privacy Policy before submitting."
    return null
  }
  const submit = async () => {
    setError("")
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSubmitting(true)
    try {
      const response = await fetch("/api/family-initiative-bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contact, children, adults, travel, pickup, total, page_url: window.location.href }) })
      const result = await response.json()
      if (!response.ok) { setError(result.error || "Something went wrong. Please try again."); return }
      setPaymentUrl(typeof result.payment_url === "string" ? result.payment_url : "")
      setSubmitted(true)
    } catch { setError("Something went wrong. Please try again or contact the team directly.") }
    finally { setSubmitting(false) }
  }
  if (submitted) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="family-initiative-success-title"><div ref={successRef} className="w-full max-w-xl rounded-3xl border-2 border-emerald-500/30 bg-background p-8 text-center shadow-2xl md:p-12"><div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-11 w-11 text-emerald-600" strokeWidth={2.5} /></div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Submission successful</p><h3 id="family-initiative-success-title" className="mb-4 text-3xl font-bold text-foreground">Booking request received</h3><p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-muted-foreground">Thank you. Your Family Fun Day booking request has been submitted. Please complete your payment to finish the booking request. The Sikh Family Initiative team will then review your details and contact you to confirm the booking.</p>{paymentUrl && <Button asChild className="mb-3 rounded-full bg-[hsl(43,100%,29%)] px-8 text-white hover:bg-[hsl(43,100%,25%)]"><a href={paymentUrl} target="_blank" rel="noopener noreferrer">Pay now</a></Button>}<div><Button type="button" variant="outline" onClick={() => setSubmitted(false)} className="rounded-full px-8">Close confirmation</Button></div></div></div>
  const attendeeFields = (group: "children" | "adults", attendees: Attendee[], label: string) => <div className="space-y-4"><div><h3 className="border-b border-border pb-3 text-lg font-semibold">{label}</h3><p className="mt-2 text-sm text-muted-foreground">Add every person attending the event.</p></div>{attendees.map((attendee, index) => <div key={index} className="rounded-xl border border-border bg-secondary/30 p-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">{label.slice(0, -1)} {index + 1}</p>{attendees.length > 1 && <button type="button" onClick={() => removeAttendee(group, index)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Remove</button>}</div><div className="grid gap-4 sm:grid-cols-[1fr_140px]"><div><Label>Name *</Label><Input value={attendee.name} onChange={(event) => updateAttendee(group, index, "name", event.target.value)} /></div><div><Label>Age *</Label><Input type="number" min="0" max="120" value={attendee.age} onChange={(event) => updateAttendee(group, index, "age", event.target.value)} /></div></div></div>)}{attendees.length < 20 && <Button type="button" variant="outline" onClick={() => addAttendee(group)} className="rounded-full gap-2"><Plus className="h-4 w-4" /> Add another</Button>}</div>
  return <div className="space-y-10"><div className="space-y-4"><h3 className="border-b border-border pb-3 text-lg font-semibold">Main contact</h3><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="initiative-contact-name">Full name *</Label><Input id="initiative-contact-name" value={contact.name} onChange={(event) => updateContact("name", event.target.value)} /></div><div><Label htmlFor="initiative-contact-email">Email address *</Label><Input id="initiative-contact-email" type="email" value={contact.email} onChange={(event) => updateContact("email", event.target.value)} /></div></div><div><Label htmlFor="initiative-contact-phone">Phone / WhatsApp *</Label><Input id="initiative-contact-phone" type="tel" value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} /></div></div>{attendeeFields("children", children, "Children")}{attendeeFields("adults", adults, "Adults")}<div className="space-y-4"><h3 className="border-b border-border pb-3 text-lg font-semibold">Booking rate</h3><p className="text-sm text-muted-foreground">Choose door entry or transport for everyone in this booking.</p><div className="grid gap-4 sm:grid-cols-2">{(["door", "transport"] as Travel[]).map((option) => <label key={option} className={`cursor-pointer rounded-xl border p-5 ${travel === option ? "border-[hsl(43,100%,29%)] bg-secondary/50" : "border-border"}`}><input type="radio" name="travel" value={option} checked={travel === option} onChange={() => setTravel(option)} className="sr-only" /><span className="block font-semibold">{option === "door" ? "Door entry" : "Door entry + transport"}</span><span className="mt-1 block text-sm text-muted-foreground">Child £{RATES.child[option]} · Adult £{RATES.adult[option]}</span></label>)}</div>{travel === "transport" && <div><Label htmlFor="initiative-pickup">Pickup point or transport details *</Label><Input id="initiative-pickup" value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Tell us where you need to be picked up" /></div>}</div><div className="space-y-4"><h3 className="border-b border-border pb-3 text-lg font-semibold">Medical and allergy information</h3><p className="text-sm text-muted-foreground">Please include any medical conditions, medication, allergies, dietary needs, or support requirements for everyone attending.</p><Textarea value={contact.medical} onChange={(event) => updateContact("medical", event.target.value)} rows={5} placeholder="Leave blank if none apply" /></div><div className="rounded-2xl bg-[hsl(43,100%,29%)] p-6 text-white"><p className="text-sm text-white/80">Estimated total</p><p className="mt-1 text-4xl font-bold">£{total}</p><p className="mt-2 text-sm text-white/80">{children.length} child{children.length === 1 ? "" : "ren"} · {adults.length} adult{adults.length === 1 ? "" : "s"} · {travel === "transport" ? "transport included" : "door entry"}</p></div><label className="flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={contact.consent} onChange={(event) => updateContact("consent", event.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(43,100%,29%)]" /><span>I have read and agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a> and consent to my information being used to process this booking. *</span></label>{error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}<div><Button type="button" onClick={submit} disabled={submitting} className="rounded-full bg-[hsl(43,100%,29%)] px-8 text-white hover:bg-[hsl(43,100%,25%)]">{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit booking request"}</Button><p className="mt-4 text-xs text-muted-foreground">This is a booking request for team confirmation. No online payment will be taken.</p></div></div>
}

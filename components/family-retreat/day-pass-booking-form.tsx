"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[\p{L}\p{M}\s'.\-]{1,60}$/u
const PHONE_REGEX = /^[\d\s+\-()\u0028\u0029]{7,20}$/

const DAY_OPTIONS = [
  { value: '2026-07-23', label: 'Thursday 23 July 2026' },
  { value: '2026-07-24', label: 'Friday 24 July 2026' },
  { value: '2026-07-25', label: 'Saturday 25 July 2026' },
  { value: '2026-07-26', label: 'Sunday 26 July 2026' },
]

const HEARD_OPTIONS = [
  'Word of mouth / friend or family', 'Instagram', 'Facebook',
  'WhatsApp message', 'Email', 'Singhs Camp / Kaurs Camp',
  'Kids Camps', 'Devanhaar website', 'Other',
]

interface ChildEntry { first_name: string; last_name: string; date_of_birth: string }
const emptyChild = (): ChildEntry => ({ first_name: '', last_name: '', date_of_birth: '' })

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-amber-700 border-amber-700' : 'border-border bg-background'}`}>
      {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
    </button>
  )
}

export default function DayPassBookingForm() {
  const errorRef = useRef<HTMLDivElement>(null)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('United Kingdom')
  const [selectedDate, setSelectedDate] = useState('')
  const [numAdults, setNumAdults] = useState(1)
  const [children, setChildren] = useState<ChildEntry[]>([])
  const [dietary, setDietary] = useState('')
  const [medical, setMedical] = useState('')
  const [ecName, setEcName] = useState('')
  const [ecRel, setEcRel] = useState('')
  const [ecPhone, setEcPhone] = useState('')
  const [heard, setHeard] = useState('')
  const [notes, setNotes] = useState('')
  const [consentEmail, setConsentEmail] = useState(false)
  const [consentWhatsapp, setConsentWhatsapp] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Live price
  const totalPence = numAdults * 3500 + children.length * 1500
  const totalStr = (totalPence / 100).toFixed(2)

  function addChild() { setChildren(prev => [...prev, emptyChild()]) }
  function removeChild(i: number) { setChildren(prev => prev.filter((_, idx) => idx !== i)) }
  function updateChild(i: number, field: keyof ChildEntry, val: string) {
    setChildren(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  function getValidationError(): string | null {
    if (!firstName.trim() || !NAME_REGEX.test(firstName.trim())) return 'Please enter a valid first name.'
    if (!lastName.trim() || !NAME_REGEX.test(lastName.trim())) return 'Please enter a valid last name.'
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.'
    if (!phone.trim() || !PHONE_REGEX.test(phone.trim())) return 'Please enter a valid phone number.'
    if (!city.trim()) return 'Please enter your city or town.'
    if (!postcode.trim()) return 'Please enter your postcode.'
    if (!country.trim()) return 'Please enter your country.'
    if (!selectedDate) return 'Please select which day you will be attending.'
    if (numAdults < 1) return 'At least 1 adult is required.'
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (!c.first_name.trim() || !NAME_REGEX.test(c.first_name.trim())) return `Please enter a valid first name for child ${i + 1}.`
      if (!c.last_name.trim() || !NAME_REGEX.test(c.last_name.trim())) return `Please enter a valid last name for child ${i + 1}.`
      if (!c.date_of_birth) return `Please enter the date of birth for child ${i + 1}.`
    }
    if (!ecName.trim()) return 'Please enter your emergency contact name.'
    if (!ecRel.trim()) return 'Please enter the relationship to your emergency contact.'
    if (!ecPhone.trim() || !PHONE_REGEX.test(ecPhone.trim())) return 'Please enter a valid emergency contact phone number.'
    if (!consentPrivacy) return 'Please accept the privacy policy to continue.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validErr = getValidationError()
    if (validErr) {
      setError(validErr)
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/family-retreat-day-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(), last_name: lastName.trim(),
          email: email.trim(), phone: phone.trim(),
          city: city.trim(), postcode: postcode.trim(), country: country.trim(),
          selected_date: selectedDate,
          num_adults: numAdults,
          children,
          dietary_requirements: dietary, medical_requirements: medical,
          emergency_contact_name: ecName.trim(),
          emergency_contact_relationship: ecRel.trim(),
          emergency_contact_phone: ecPhone.trim(),
          heard_about_retreat: heard, additional_notes: notes,
          consent_email: consentEmail ? 'yes' : 'no',
          consent_whatsapp: consentWhatsapp ? 'yes' : 'no',
          consent_privacy: consentPrivacy,
          page_url: typeof window !== 'undefined' ? window.location.href : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      if (data.stripeUrl) {
        window.location.href = data.stripeUrl
      } else {
        setError('Payment link could not be generated. Please try again or contact us.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-2">Sikh Family Retreat 2026</p>
        <h1 className="text-3xl font-bold text-foreground mb-2">Day Pass Booking</h1>
        <p className="text-muted-foreground">Hilston Park, Wales &mdash; 23&ndash;26 July 2026</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1">Adults from &pound;35</span>
          <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1">Children from &pound;15</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {error && (
          <div ref={errorRef} className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Day selection */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Which day are you attending? *</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DAY_OPTIONS.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => setSelectedDate(opt.value)}
                className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${selectedDate === opt.value ? 'border-amber-600 bg-amber-50 text-amber-900 font-medium' : 'border-border bg-background hover:border-amber-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Attendee count */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Number of attendees</h2>
          <div className="flex items-center gap-4">
            <Label className="text-sm text-muted-foreground w-32">Adults (14+) *</Label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setNumAdults(Math.max(1, numAdults - 1))}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">-</button>
              <span className="w-8 text-center font-semibold">{numAdults}</span>
              <button type="button" onClick={() => setNumAdults(numAdults + 1)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">+</button>
              <span className="text-sm text-muted-foreground ml-2">&pound;{(numAdults * 35).toFixed(2)}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm text-muted-foreground">Children / Young people (0&ndash;13)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addChild} className="gap-1.5 text-xs h-7">
                <Plus className="h-3 w-3" /> Add child
              </Button>
            </div>
            {children.length === 0 && <p className="text-xs text-muted-foreground">No children added yet.</p>}
            {children.map((c, i) => (
              <div key={i} className="border border-border rounded-xl p-4 mb-3 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Child {i + 1} <span className="text-xs text-muted-foreground">&mdash; &pound;15</span></p>
                  <button type="button" onClick={() => removeChild(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4"/></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">First name *</Label><Input value={c.first_name} onChange={e => updateChild(i,'first_name',e.target.value)} placeholder="First name" className="h-9 text-sm"/></div>
                  <div className="space-y-1"><Label className="text-xs">Last name *</Label><Input value={c.last_name} onChange={e => updateChild(i,'last_name',e.target.value)} placeholder="Last name" className="h-9 text-sm"/></div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Date of birth *</Label><Input type="date" value={c.date_of_birth} onChange={e => updateChild(i,'date_of_birth',e.target.value)} className="h-9 text-sm"/></div>
              </div>
            ))}
          </div>
          {/* Price summary */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-amber-800">{numAdults} adult{numAdults !== 1 ? 's' : ''}{children.length > 0 ? ` + ${children.length} child${children.length !== 1 ? 'ren' : ''}` : ''}</span>
            <span className="font-bold text-amber-900 text-lg">&pound;{totalStr}</span>
          </div>
        </section>

        {/* Contact details */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Your details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="first_name" className="text-sm">First name *</Label><Input id="first_name" value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" className="h-11"/></div>
            <div className="space-y-1.5"><Label htmlFor="last_name" className="text-sm">Last name *</Label><Input id="last_name" value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" className="h-11"/></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="email" className="text-sm">Email address *</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="h-11"/></div>
          <div className="space-y-1.5"><Label htmlFor="phone" className="text-sm">Phone number *</Label><Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" className="h-11"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="city" className="text-sm">City / Town *</Label><Input id="city" value={city} onChange={e => setCity(e.target.value)} autoComplete="address-level2" className="h-11"/></div>
            <div className="space-y-1.5"><Label htmlFor="postcode" className="text-sm">Postcode *</Label><Input id="postcode" value={postcode} onChange={e => setPostcode(e.target.value)} autoComplete="postal-code" className="h-11"/></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="country" className="text-sm">Country *</Label><Input id="country" value={country} onChange={e => setCountry(e.target.value)} autoComplete="country-name" className="h-11"/></div>
        </section>

        {/* Dietary & Medical */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Dietary &amp; medical requirements</h2>
          <div className="space-y-1.5"><Label htmlFor="dietary" className="text-sm">Dietary requirements</Label><Textarea id="dietary" value={dietary} onChange={e => setDietary(e.target.value)} placeholder="Any dietary requirements for your group" rows={3}/></div>
          <div className="space-y-1.5"><Label htmlFor="medical" className="text-sm">Medical requirements</Label><Textarea id="medical" value={medical} onChange={e => setMedical(e.target.value)} placeholder="Any medical conditions or requirements we should be aware of" rows={3}/></div>
        </section>

        {/* Emergency contact */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Emergency contact</h2>
          <div className="space-y-1.5"><Label htmlFor="ec_name" className="text-sm">Full name *</Label><Input id="ec_name" value={ecName} onChange={e => setEcName(e.target.value)} className="h-11"/></div>
          <div className="space-y-1.5"><Label htmlFor="ec_rel" className="text-sm">Relationship to you *</Label><Input id="ec_rel" value={ecRel} onChange={e => setEcRel(e.target.value)} placeholder="e.g. Spouse, Parent, Sibling" className="h-11"/></div>
          <div className="space-y-1.5"><Label htmlFor="ec_phone" className="text-sm">Phone number *</Label><Input id="ec_phone" type="tel" value={ecPhone} onChange={e => setEcPhone(e.target.value)} className="h-11"/></div>
        </section>

        {/* How did you hear */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">How did you hear about the Sikh Family Retreat?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HEARD_OPTIONS.map(opt => (
              <button key={opt} type="button" onClick={() => setHeard(heard === opt ? '' : opt)}
                className={`text-left text-xs rounded-lg border px-3 py-2 transition-colors ${heard === opt ? 'border-amber-600 bg-amber-50 text-amber-900 font-medium' : 'border-border hover:border-amber-300'}`}>
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section>
          <div className="space-y-1.5"><Label htmlFor="notes" className="text-sm">Additional notes</Label><Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else you would like us to know" rows={3}/></div>
        </section>

        {/* Consent */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Consent</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={consentEmail} onToggle={() => setConsentEmail(v => !v)}/>
            <span className="text-sm text-muted-foreground">I am happy to receive email updates about future Devanhaar events and programmes.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={consentWhatsapp} onToggle={() => setConsentWhatsapp(v => !v)}/>
            <span className="text-sm text-muted-foreground">I am happy to be added to a WhatsApp group for this event.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={consentPrivacy} onToggle={() => setConsentPrivacy(v => !v)}/>
            <span className="text-sm text-muted-foreground">I have read and agree to the <a href="/privacy-policy" target="_blank" className="underline text-amber-700">Privacy Policy</a>. *</span>
          </label>
        </section>

        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total to pay</span>
            <span className="text-2xl font-bold text-foreground">&pound;{totalStr}</span>
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-base">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Processing&hellip;</> : `Pay \u00a3${totalStr} &amp; Confirm`}
          </Button>
          <p className="text-xs text-muted-foreground text-center">You will be taken to our secure payment page. Your place is confirmed once payment is complete.</p>
        </div>
      </form>
    </div>
  )
}

export const RETREAT_BOOKING_EVENTS = {
  'new-year-reset': { title: 'New Year Reset', date: '31 December 2026 – 3 January 2027' },
  spring: { title: 'Spring Retreat', date: '1–4 April 2027' },
  summer: { title: 'Summer Retreat', date: '22–25 July 2027' },
} as const

export type RetreatBookingEvent = keyof typeof RETREAT_BOOKING_EVENTS

export function isRetreatBookingEvent(value: unknown): value is RetreatBookingEvent {
  return typeof value === 'string' && Object.hasOwn(RETREAT_BOOKING_EVENTS, value)
}

export function isRetreatBookingOpen(event: RetreatBookingEvent) {
  return (process.env.FAMILY_RETREAT_BOOKING_EVENTS || '').split(',').some((value) => value.trim() === event)
}

// Public booking options. Do not offer the old onsite ensuite option.
export const RETREAT_ACCOMMODATION = [
  { value: 'hilston-park', label: 'Hilston Park' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'family-pass-1-day', label: '1-day family pass' },
  { value: 'family-pass-2-day', label: '2-day family pass' },
] as const

// Historical bookings must retain the exact meaning of their original selection.
// These values are displayed to staff but cannot be selected for new applications.
const LEGACY_RETREAT_ACCOMMODATION: Record<string, string> = {
  'option-1': 'Onsite family room with shared facilities (previous option)',
  'option-2': 'Onsite ensuite family accommodation (previous option)',
  'option-3': 'Offsite ensuite family accommodation (previous option)',
}

export function retreatAccommodationLabel(value: string | null | undefined) {
  return RETREAT_ACCOMMODATION.find((option) => option.value === value)?.label
    || (value ? LEGACY_RETREAT_ACCOMMODATION[value] : undefined)
    || value || 'Not specified'
}

export function retreatReference(number: number | string | null | undefined) {
  return number == null ? null : 'SFR-' + String(number).padStart(4, '0')
}

export function retreatSubmittedAt(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  }).format(new Date(date))
}

export function retreatChildAge(dob: string, asOf = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null
  const birth = new Date(dob + 'T00:00:00Z')
  if (!Number.isFinite(birth.valueOf()) || !Number.isFinite(asOf.valueOf()) || birth.toISOString().slice(0, 10) !== dob) return null
  const today = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(asOf)
  const [day, month, year] = today.split('/').map(Number)
  const [birthYear, birthMonth, birthDay] = dob.split('-').map(Number)
  const age = year - birthYear - Number(month < birthMonth || (month === birthMonth && day < birthDay))
  return age < 0 ? null : age
}

export function retreatChildCounts(children: { date_of_birth?: string }[], asOf: Date) {
  const counts = { children: 0, infants: 0, unknown: 0 }
  for (const child of children) {
    const age = retreatChildAge(child.date_of_birth || '', asOf)
    if (age === null || age >= 18) counts.unknown++
    else if (age < 2) counts.infants++
    else counts.children++
  }
  return counts
}

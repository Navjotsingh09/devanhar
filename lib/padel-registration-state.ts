/**
 * Amsterdam applications were closed on 17 November 2026.
 * Historic rows may still have registration_open=true until an organiser
 * explicitly uses the SPA backend to resume them. updated_at is advanced
 * by the dedicated organiser action, so old data fails closed.
 */
export const AMSTERDAM_APPLICATIONS_CLOSED_AT = '2026-11-17T13:41:00.000Z'

export function isAmsterdamPadelTournament(value: { name?: string | null; venue?: string | null; address?: string | null }) {
  return /amsterdam/i.test([value.name, value.venue, value.address].filter(Boolean).join(' '))
}

export function isPadelRegistrationOpen(value: {
  registration_open?: boolean | null
  name?: string | null
  venue?: string | null
  address?: string | null
  updated_at?: string | null
}) {
  if (value.registration_open !== true) return false
  if (!isAmsterdamPadelTournament(value)) return true
  if (!value.updated_at) return false
  const lastChanged = Date.parse(value.updated_at)
  return Number.isFinite(lastChanged) && lastChanged > Date.parse(AMSTERDAM_APPLICATIONS_CLOSED_AT)
}

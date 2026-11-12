import { isRetreatBookingOpen, RETREAT_BOOKING_EVENTS, type RetreatBookingEvent } from '@/lib/family-retreat-booking-details'
import type { PublishedEntry } from '@/lib/cms/entries/server'

export type SfiOpenBooking = { title: string; date: string; href: string }

const familyProjectSlugs = new Set([
  'sikh-family-initiative',
  'sikh-family-retreat',
  'sikh-family-extravaganza',
  'wedding-fair',
])

export function getSfiOpenBookings(projects: PublishedEntry[], events: PublishedEntry[], now = Date.now()): SfiOpenBooking[] {
  const bookings: SfiOpenBooking[] = (Object.keys(RETREAT_BOOKING_EVENTS) as RetreatBookingEvent[])
    .filter(isRetreatBookingOpen)
    .map(event => ({
      title: `Sikh Family Retreat · ${RETREAT_BOOKING_EVENTS[event].title}`,
      date: RETREAT_BOOKING_EVENTS[event].date,
      href: `/sfr/book?event=${event}`,
    }))
  const projectIds = new Set(projects.filter(project => familyProjectSlugs.has(project.slug)).map(project => project.id))
  const seen = new Set(bookings.map(booking => new URL(booking.href, 'https://devanhaar.com').href))

  for (const event of events) {
    const content = event.content
    if (!event.projectId || !projectIds.has(event.projectId) || content.kind !== 'event' ||
      content.status !== 'registration_open' || content.comingSoon || !content.registrationUrl ||
      content.registrationUrl.startsWith('#') || (content.endAt && Date.parse(content.endAt) <= now)) continue
    const url = new URL(content.registrationUrl, 'https://devanhaar.com').href
    if (seen.has(url)) continue
    seen.add(url)
    bookings.push({ title: content.title, date: content.dateLabel, href: content.registrationUrl })
  }
  return bookings
}

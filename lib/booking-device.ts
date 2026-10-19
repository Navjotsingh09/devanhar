export type BookingDevice = 'mobile' | 'tablet' | 'computer' | 'unknown'
export const DEVICE_LABELS: Record<BookingDevice,string> = { mobile:'Mobile', tablet:'Tablet', computer:'Laptop / desktop', unknown:'Not recorded' }
export function detectBookingDevice(headers: Pick<Headers,'get'>): BookingDevice {
 const ua = headers.get('user-agent') || ''
 if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet'
 if (headers.get('sec-ch-ua-mobile') === '?1' || /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile'
 if (/Windows NT|Macintosh|X11|CrOS/i.test(ua)) return 'computer'
 return 'unknown'
}
export function deviceLabel(value: unknown) { return DEVICE_LABELS[value as BookingDevice] || DEVICE_LABELS.unknown }

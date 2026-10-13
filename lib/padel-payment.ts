export const AMSTERDAM_PAYMENT_URL = 'https://www.totalgiving.co.uk/appeal/SPAEU/donate'
export const LEGACY_PADEL_PAYMENT_URL = 'https://www.nowdonate.com/checkout/63hzpepp0m54p65i54d0'

type PaymentEvent = { name: string; payment_url?: string | null }

export function validatePadelPaymentUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password &&
      ['www.totalgiving.co.uk', 'totalgiving.co.uk', 'www.nowdonate.com', 'nowdonate.com'].includes(url.hostname)
  } catch { return false }
}

export function getPadelPaymentDestination(event: PaymentEvent) {
  const url = event.payment_url?.trim() ||
    (/\bamsterdam\b/i.test(event.name) ? AMSTERDAM_PAYMENT_URL : LEGACY_PADEL_PAYMENT_URL)
  if (!validatePadelPaymentUrl(url)) throw new Error('Tournament payment destination is invalid')
  return { url, provider: new URL(url).hostname.endsWith('totalgiving.co.uk') ? 'totalgiving' : 'nowdonate' }
}

export function canAutoConfirmPadelRegistration(status: string) {
  return !['declined', 'archived', 'cancelled', 'rejected'].includes(status)
}

export function getPadelPaymentStatus(row: { payment_status?: string | null; stripe_pi_status?: string | null }) {
  if (row.payment_status === 'paid' || row.stripe_pi_status === 'succeeded') return 'paid'
  if (row.payment_status === 'refunded') return 'refunded'
  if (row.stripe_pi_status === 'requires_capture') return 'authorized'
  return row.payment_status === 'pending' ? 'pending' : 'unverified'
}

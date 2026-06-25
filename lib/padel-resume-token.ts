import crypto from "crypto"

function getSecret(): string {
  const secret =
    process.env.RESUME_TOKEN_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  if (!secret) {
    throw new Error(
      "Missing RESUME_TOKEN_SECRET (and STRIPE_WEBHOOK_SECRET / SUPABASE_SERVICE_ROLE_KEY fallbacks)",
    )
  }
  return secret
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

/**
 * Sign a padel registration id so it can be safely embedded in a public resume URL.
 * The token is an HMAC-SHA256 of the id keyed by RESUME_TOKEN_SECRET.
 */
export function signPadelResumeToken(registrationId: string): string {
  const mac = crypto.createHmac("sha256", getSecret()).update(`padel-resume:${registrationId}`).digest()
  return base64url(mac)
}

export function verifyPadelResumeToken(registrationId: string, token: string): boolean {
  if (!registrationId || !token) return false
  const expected = signPadelResumeToken(registrationId)
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function buildPadelResumeUrl(siteUrl: string, registrationId: string): string {
  const token = signPadelResumeToken(registrationId)
  return `${siteUrl}/api/padel-registrations/resume-payment?registration_id=${encodeURIComponent(
    registrationId,
  )}&token=${encodeURIComponent(token)}`
}

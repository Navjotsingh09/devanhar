import crypto from 'crypto'

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID

function getServerPrefix(): string {
  if (!MAILCHIMP_API_KEY) throw new Error('Missing MAILCHIMP_API_KEY')
  const parts = MAILCHIMP_API_KEY.split('-')
  if (parts.length !== 2) throw new Error('Invalid MAILCHIMP_API_KEY format (expected key-dc)')
  return parts[1]
}

function subscriberHash(email: string): string {
  return crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex')
}

interface CampApplicant {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  age_at_camp?: number | null
  university?: string | null
  occupation?: string | null
  city: string
  postcode: string
  country: string
  initiative_slug: string
  status: string
}

export async function sendToMailchimp(applicant: CampApplicant): Promise<void> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    console.warn('[Mailchimp] Skipping - MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID not set')
    return
  }

  const dc = getServerPrefix()
  const hash = subscriberHash(applicant.email)
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${hash}`

  const body = {
    email_address: applicant.email.trim().toLowerCase(),
    status_if_new: 'subscribed' as const,
    merge_fields: {
      FNAME: applicant.first_name,
      LNAME: applicant.last_name,
      PHONE: applicant.phone,
      DOB: applicant.date_of_birth,
      CITY: applicant.city,
      POSTCODE: applicant.postcode,
      COUNTRY: applicant.country,
      ...(applicant.university && { UNI: applicant.university }),
      ...(applicant.occupation && { JOB: applicant.occupation }),
      ...(applicant.age_at_camp && { AGE: String(applicant.age_at_camp) }),
    },
    tags: [
      applicant.initiative_slug,
      'camp-applicant',
    ],
  }

  const authHeader = 'Basic ' + Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error('Mailchimp API ' + res.status + ': ' + text)
  }

  console.log('[Mailchimp] Upserted contact ' + applicant.email)
}

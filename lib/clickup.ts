const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID

interface CampApplicationData {
  id: string
  initiative_slug: string
  first_name: string
  last_name: string
  email: string
  date_of_birth: string
  age_at_camp?: number | null
  phone: string
  university?: string | null
  occupation?: string | null
  address_line_1: string
  address_line_2?: string | null
  address_line_3?: string | null
  city: string
  postcode: string
  country: string
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  under_18_consent?: string | null
  dietary_requirements?: string | null
  medical_requirements?: string | null
  allergies?: string | null
  carries_epipen?: string | null
  travel_method?: string | null
  own_transport_type?: string | null
  requires_payment_support?: string | null
  payment_support_details?: string | null
  room_preference?: string | null
  heard_about_camp: string
  first_residential_camp: string
  been_to_singhs_camp_before: string
  previous_camps?: string | null
  sikhi_knowledge_level: string
  takeaway_from_camp: string
  bjj_interest?: string | null
  bjj_fought_professionally?: string | null
  consent_email?: string | null
  consent_phone?: string | null
  consent_sms?: string | null
  consent_whatsapp?: string | null
  id_document_url?: string | null
  id_document_type?: string | null
  status: string
  payment_mode: string
}

function formatInitiativeName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function buildTaskDescription(app: CampApplicationData): string {
  const lines: string[] = []
  const ini = formatInitiativeName(app.initiative_slug)

  lines.push('## ' + ini + ' Application')
  lines.push('**Database ID:** ' + app.id)
  lines.push('**Status:** ' + app.status)
  lines.push('**Payment Mode:** ' + app.payment_mode)
  lines.push('')

  lines.push('### Personal Details')
  lines.push('- **Name:** ' + app.first_name + ' ' + app.last_name)
  lines.push('- **Email:** ' + app.email)
  lines.push('- **Phone:** ' + app.phone)
  lines.push('- **Date of Birth:** ' + app.date_of_birth)
  if (app.age_at_camp) lines.push('- **Age at Camp:** ' + app.age_at_camp)
  if (app.university) lines.push('- **University:** ' + app.university)
  if (app.occupation) lines.push('- **Occupation:** ' + app.occupation)
  lines.push('')

  lines.push('### Address')
  lines.push('- ' + app.address_line_1)
  if (app.address_line_2) lines.push('- ' + app.address_line_2)
  if (app.address_line_3) lines.push('- ' + app.address_line_3)
  lines.push('- ' + app.city + ', ' + app.postcode)
  lines.push('- ' + app.country)
  lines.push('')

  lines.push('### Emergency Contact')
  lines.push('- **Name:** ' + app.emergency_contact_name)
  lines.push('- **Relationship:** ' + app.emergency_contact_relationship)
  lines.push('- **Phone:** ' + app.emergency_contact_phone)
  if (app.under_18_consent) lines.push('- **Under-18 Consent:** ' + app.under_18_consent)
  lines.push('')

  lines.push('### Medical & Dietary')
  if (app.dietary_requirements) lines.push('- **Dietary Requirements:** ' + app.dietary_requirements)
  if (app.medical_requirements) lines.push('- **Medical Requirements:** ' + app.medical_requirements)
  if (app.allergies) lines.push('- **Allergies:** ' + app.allergies)
  if (app.carries_epipen) lines.push('- **Carries EpiPen:** ' + app.carries_epipen)
  if (!app.dietary_requirements && !app.medical_requirements && !app.allergies) lines.push('- None specified')
  lines.push('')

  lines.push('### Travel & Accommodation')
  if (app.travel_method) lines.push('- **Travel Method:** ' + app.travel_method)
  if (app.own_transport_type) lines.push('- **Transport Type:** ' + app.own_transport_type)
  if (app.room_preference) lines.push('- **Room Preference:** ' + app.room_preference)
  lines.push('')

  lines.push('### Payment')
  if (app.requires_payment_support === 'yes') {
    lines.push('- **Requires Payment Support:** Yes')
    if (app.payment_support_details) lines.push('- **Details:** ' + app.payment_support_details)
  } else {
    lines.push('- **Requires Payment Support:** No')
  }
  lines.push('')

  lines.push('### BJJ / Wrestling')
  lines.push('- **Interested:** ' + (app.bjj_interest || 'not specified'))
  if (app.bjj_interest === 'yes' && app.bjj_fought_professionally) lines.push('- **Fought Professionally:** ' + app.bjj_fought_professionally)
  lines.push('')

  lines.push('### Sikhi & Camp')
  lines.push('- **Heard About Camp:** ' + app.heard_about_camp)
  lines.push('- **First Residential Camp:** ' + app.first_residential_camp)
  lines.push('- **Been to ' + ini + ' Before:** ' + app.been_to_singhs_camp_before)
  if (app.previous_camps) lines.push('- **Previous Camps:** ' + app.previous_camps)
  lines.push('- **Sikhi Knowledge Level:** ' + app.sikhi_knowledge_level)
  lines.push('- **Takeaway from Camp:** ' + app.takeaway_from_camp)
  lines.push('')

  lines.push('### Contact Consent')
  lines.push('- Email: ' + (app.consent_email || 'not specified'))
  lines.push('- Phone: ' + (app.consent_phone || 'not specified'))
  lines.push('- SMS: ' + (app.consent_sms || 'not specified'))
  lines.push('- WhatsApp: ' + (app.consent_whatsapp || 'not specified'))

  if (app.id_document_url) {
    lines.push('')
    lines.push('### ID Document')
    lines.push('[View uploaded document](' + app.id_document_url + ')')
  }

  return lines.join('\n')
}

export async function sendToClickUp(app: CampApplicationData): Promise<void> {
  if (!CLICKUP_API_TOKEN || !CLICKUP_LIST_ID) {
    console.warn('[ClickUp] Skipping - CLICKUP_API_TOKEN or CLICKUP_LIST_ID not configured')
    return
  }

  const initiativeName = formatInitiativeName(app.initiative_slug)
  const taskName = initiativeName + ' Application: ' + app.first_name + ' ' + app.last_name

  const res = await fetch('https://api.clickup.com/api/v2/list/' + CLICKUP_LIST_ID + '/task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CLICKUP_API_TOKEN,
    },
    body: JSON.stringify({
      name: taskName,
      markdown_description: buildTaskDescription(app),
      tags: [app.initiative_slug, app.payment_mode],
      priority: app.requires_payment_support === 'yes' ? 2 : 3,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error('ClickUp API ' + res.status + ': ' + text)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const webhookSecret = process.env.BEACON_WEBHOOK_SECRET

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret via query param or header
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret') || request.headers.get('x-webhook-secret')

    if (!webhookSecret || secret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Beacon sends form data - map fields to camp_applications columns
    const fields = body.fields || body.data || body

    const firstName = fields.first_name || fields.firstName || fields['First Name'] || ''
    const lastName = fields.last_name || fields.lastName || fields['Last Name'] || ''
    const email = fields.email || fields.Email || ''
    const phone = fields.phone || fields.Phone || fields.phone_number || ''
    const dob = fields.date_of_birth || fields.dateOfBirth || fields['Date of Birth'] || null
    const city = fields.city || fields.City || ''
    const postcode = fields.postcode || fields.Postcode || fields.zip || ''
    const country = fields.country || fields.Country || 'UK'

    if (!firstName || !email) {
      return NextResponse.json({ error: 'Missing required fields (first_name, email)' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Look up Kaurs Camp initiative
    const { data: initiative } = await supabase
      .from('initiatives')
      .select('id')
      .eq('slug', 'kaurs-camp')
      .maybeSingle()

    const payload = {
      initiative_id: initiative?.id || null,
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      date_of_birth: dob || null,
      age_at_camp: fields.age_at_camp ? Number(fields.age_at_camp) : null,
      phone: String(phone).trim(),
      university: fields.university || fields.University || null,
      occupation: fields.occupation || fields.Occupation || null,
      address_line_1: fields.address_line_1 || fields.address || fields.Address || '',
      address_line_2: fields.address_line_2 || null,
      address_line_3: fields.address_line_3 || null,
      city: String(city).trim(),
      postcode: String(postcode).trim(),
      country: String(country).trim(),
      emergency_contact_name: fields.emergency_contact_name || fields['Emergency Contact Name'] || null,
      emergency_contact_relationship: fields.emergency_contact_relationship || fields['Emergency Contact Relationship'] || null,
      emergency_contact_phone: fields.emergency_contact_phone || fields['Emergency Contact Phone'] || null,
      dietary_requirements: fields.dietary_requirements || null,
      medical_requirements: fields.medical_requirements || null,
      travel_method: fields.travel_method || null,
      requires_payment_support: fields.requires_payment_support === 'yes' || fields.requires_payment_support === true,
      heard_about_camp: fields.heard_about_camp || fields['How did you hear about camp?'] || null,
      first_residential_camp: fields.first_residential_camp === 'yes' || fields.first_residential_camp === true || null,
      been_to_singhs_camp_before: fields.been_to_singhs_camp_before === 'yes' || fields.been_to_singhs_camp_before === true || null,
      sikhi_knowledge_level: fields.sikhi_knowledge_level || fields['Sikhi Knowledge Level'] || null,
      takeaway_from_camp: fields.takeaway_from_camp || fields['What do you hope to take away from camp?'] || null,
      status: 'pending',
      internal_notes: 'Submitted via Beacon form',
    }

    const { data, error } = await supabase
      .from('camp_applications')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[Beacon Webhook] Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    await supabase.from('activity_log').insert({
      action: 'Kaurs Camp application received via Beacon webhook',
      entity_type: 'camp_application',
      entity_id: data.id,
      metadata: {
        name: `${firstName} ${lastName}`,
        email,
        source: 'beacon',
      },
    })

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (error) {
    console.error('[Beacon Webhook] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

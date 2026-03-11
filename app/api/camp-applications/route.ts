import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = [
      'first_name', 'last_name', 'email', 'date_of_birth', 'phone',
      'address_line_1', 'city', 'postcode', 'country',
      'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
      'heard_about_camp', 'first_residential_camp', 'been_to_singhs_camp_before',
      'sikhi_knowledge_level', 'takeaway_from_camp',
    ]

    const missing = required.filter((field) => !body[field] && body[field] !== false)
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Look up the Singhs Camp initiative ID
    const { data: initiative } = await supabase
      .from('initiatives')
      .select('id')
      .eq('slug', body.initiative_slug || 'singhs-camp')
      .single()

    const { data, error } = await supabase.from('camp_applications').insert({
      initiative_id: initiative?.id || null,
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      date_of_birth: body.date_of_birth,
      age_at_camp: body.age_at_camp ? Number(body.age_at_camp) : null,
      phone: body.phone.trim(),
      university: body.university?.trim() || null,
      occupation: body.occupation?.trim() || null,
      address_line_1: body.address_line_1.trim(),
      address_line_2: body.address_line_2?.trim() || null,
      address_line_3: body.address_line_3?.trim() || null,
      city: body.city.trim(),
      postcode: body.postcode.trim(),
      country: body.country.trim(),
      emergency_contact_name: body.emergency_contact_name.trim(),
      emergency_contact_relationship: body.emergency_contact_relationship.trim(),
      emergency_contact_phone: body.emergency_contact_phone.trim(),

    if (error) {
      console.error('[Camp Application] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    // Log the activity
    await supabase.from('activity_log').insert({
      action: 'New camp application submitted',
      entity_type: 'camp_application',
      entity_id: data.id,
      metadata: {
        name: `${body.first_name} ${body.last_name}`,
        email: body.email,
        initiative: body.initiative_slug || 'singhs-camp',
      },
    })

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Camp Application] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}

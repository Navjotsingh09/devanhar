import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function generateSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { first_name, last_name, email, phone, age, city, pack, fundraising_goal, profile_message, agree_whatsapp_group, agree_terms } = body

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !pack) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, last_name, email, pack' },
        { status: 400 }
      )
    }

    if (!agree_terms) {
      return NextResponse.json({ error: 'You must agree to the Terms & Conditions' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!['singhs', 'kaurs'].includes(pack)) {
      return NextResponse.json({ error: 'Pack must be "singhs" or "kaurs"' }, { status: 400 })
    }

    const goal = fundraising_goal ? Math.max(1, Math.min(100000, Number(fundraising_goal))) : 100

    const supabase = getSupabaseAdmin()

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('wolfrun_fundraisers')
      .select('id, slug')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        error: 'You have already registered for the Wolf Run',
        slug: existing.slug,
        link: `${siteUrl}/events/wolfrun/fundraiser/${existing.slug}`,
      }, { status: 409 })
    }

    const slug = generateSlug(first_name, last_name)

    const { data, error } = await supabase
      .from('wolfrun_fundraisers')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        pack,
        slug,
        fundraising_goal: goal,
        profile_message: profile_message?.trim() || null,
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('[Wolf Run Register] Supabase error:', error)
      return NextResponse.json({ error: `Failed to register: ${error.message || error.code || JSON.stringify(error)}` }, { status: 500 })
    }

    const fundraiserLink = `${siteUrl}/events/wolfrun/fundraiser/${data.slug}`

    // Log activity
    await supabase.from('activity_log').insert({
      action: 'Wolf Run participant registered',
      entity_type: 'wolfrun_fundraiser',
      entity_id: data.id,
      metadata: {
        name: `${first_name.trim()} ${last_name.trim()}`,
        city: city?.trim() || null,
        age: age ? Number(age) : null,
        phone: phone?.trim() || null,
        agree_whatsapp_group: Boolean(agree_whatsapp_group),
        agree_terms: Boolean(agree_terms),
        link: fundraiserLink,
      },
    }).then(() => {}).catch(() => {})

    return NextResponse.json({
      success: true,
      slug: data.slug,
      link: fundraiserLink,
    })
  } catch (err) {
    console.error('[Wolf Run Register] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

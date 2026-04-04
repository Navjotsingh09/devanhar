import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: fundraisers, error } = await supabase
      .from('wolfrun_fundraisers')
      .select(`
        id, first_name, last_name, pack, slug, fundraising_goal, total_raised,
        wolfrun_donations(id)
      `)
      .eq('status', 'active')
      .eq('wolfrun_donations.status', 'completed')
      .order('total_raised', { ascending: false })

    if (error) {
      console.error('[Wolf Run Fundraisers] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to load fundraisers' }, { status: 500 })
    }

    const result = (fundraisers || []).map((f) => ({
      first_name: f.first_name,
      last_name: f.last_name,
      pack: f.pack,
      slug: f.slug,
      fundraising_goal: f.fundraising_goal,
      total_raised: f.total_raised,
      donation_count: Array.isArray(f.wolfrun_donations) ? f.wolfrun_donations.length : 0,
    }))

    return NextResponse.json({ fundraisers: result })
  } catch (error) {
    console.error('[Wolf Run Fundraisers] Error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

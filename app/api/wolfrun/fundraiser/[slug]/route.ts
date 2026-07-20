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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = getSupabaseAdmin()

    const { data: fundraiser, error } = await supabase
      .from('wolfrun_fundraisers')
      .select('id, first_name, last_name, pack, slug, fundraising_goal, total_raised, profile_message, created_at')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()

    if (error || !fundraiser) {
      return NextResponse.json({ error: 'Fundraiser not found' }, { status: 404 })
    }

    // Get completed donations for this fundraiser (public info only)
    const { data: donations } = await supabase
      .from('wolfrun_donations')
      .select('donor_name, amount, gift_aid, message, created_at')
      .eq('fundraiser_id', fundraiser.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20)

    const { count: donationCount } = await supabase
      .from('wolfrun_donations')
      .select('id', { count: 'exact', head: true })
      .eq('fundraiser_id', fundraiser.id)
      .eq('status', 'completed')

    return NextResponse.json({
      fundraiser: {
        first_name: fundraiser.first_name,
        last_name: fundraiser.last_name,
        pack: fundraiser.pack,
        slug: fundraiser.slug,
        fundraising_goal: fundraiser.fundraising_goal,
        total_raised: fundraiser.total_raised,
        profile_message: fundraiser.profile_message,
        created_at: fundraiser.created_at,
        donation_count: donationCount || 0,
      },
      donations: (donations || []).map((d) => ({
        donor_name: d.donor_name,
        amount: d.amount,
        gift_aid: d.gift_aid,
        message: d.message,
        created_at: d.created_at,
      })),
    })
  } catch (error) {
    console.error('[Wolf Run Fundraiser] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

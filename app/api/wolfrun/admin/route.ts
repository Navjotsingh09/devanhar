import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceRole() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createServiceClient(url, key)
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401, supabase: null }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403, supabase: null }
  }

  return { error: null, status: 200, supabase }
}

// PATCH — edit a fundraiser
export async function PATCH(request: NextRequest) {
  try {
    const { error, status, supabase } = await requireAdmin()
    if (error || !supabase) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { id, first_name, last_name, pack, fundraising_goal, profile_message, status: fundraiserStatus } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing fundraiser id' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (first_name !== undefined) updates.first_name = String(first_name).trim()
    if (last_name !== undefined) updates.last_name = String(last_name).trim()
    if (pack !== undefined && ['singhs', 'kaurs'].includes(pack)) updates.pack = pack
    if (fundraising_goal !== undefined) {
      const goal = Number(fundraising_goal)
      if (goal >= 10 && goal <= 100000) updates.fundraising_goal = goal
    }
    if (profile_message !== undefined) updates.profile_message = String(profile_message).trim() || null
    if (fundraiserStatus !== undefined && ['active', 'inactive'].includes(fundraiserStatus)) {
      updates.status = fundraiserStatus
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error: updateError } = await supabase
      .from('wolfrun_fundraisers')
      .update(updates)
      .eq('id', id)
      .select('id, first_name, last_name, email, pack, slug, fundraising_goal, total_raised, profile_message, status')
      .single()

    if (updateError) {
      console.error('[WolfRun Admin] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update fundraiser' }, { status: 500 })
    }

    return NextResponse.json({ success: true, fundraiser: data })
  } catch (err) {
    console.error('[WolfRun Admin] PATCH error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE — permanently delete a fundraiser and their donations
export async function DELETE(request: NextRequest) {
  try {
    const { error, status, supabase } = await requireAdmin()
    if (error || !supabase) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing fundraiser id' }, { status: 400 })
    }

    // Use service role to bypass RLS on wolfrun_donations / wolfrun_fundraisers
    const admin = getServiceRole()

    const { error: donationsError } = await admin
      .from('wolfrun_donations')
      .delete()
      .eq('fundraiser_id', id)

    if (donationsError) {
      console.error('[WolfRun Admin] Delete donations error:', donationsError)
      return NextResponse.json({ error: 'Failed to delete donations' }, { status: 500 })
    }

    const { error: deleteError } = await admin
      .from('wolfrun_fundraisers')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[WolfRun Admin] Delete fundraiser error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete fundraiser' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[WolfRun Admin] DELETE error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getOpenRegistrationOpportunities } from '@/lib/open-registration-opportunities'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ opportunities: await getOpenRegistrationOpportunities() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Registration availability is temporarily unavailable', opportunities: [] }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}

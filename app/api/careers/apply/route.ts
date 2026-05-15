import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendApplicationConfirmation, sendStaffApplicationNotification } from '@/lib/careers-email'

const BUCKET = 'vacancy-cvs'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createServiceClient(url, key)
}

function tristate(v: unknown): boolean | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'boolean') return v
  const s = String(v).trim().toLowerCase()
  if (s === 'yes' || s === 'true' || s === 'on') return true
  if (s === 'no' || s === 'false') return false
  return null
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function strOrNull(v: unknown): string | null {
  const s = str(v)
  return s === '' ? null : s
}

async function verifyUploadedPath(
  admin: ReturnType<typeof getAdmin>,
  vacancyId: string,
  field: 'cv' | 'cover_letter' | 'portfolio',
  path: string,
): Promise<boolean> {
  const expectedPrefix = `${vacancyId}/${field}/`
  if (!path.startsWith(expectedPrefix)) return false
  const folder = path.substring(0, path.lastIndexOf('/'))
  const filename = path.substring(path.lastIndexOf('/') + 1)
  const { data, error } = await admin.storage
    .from(BUCKET)
    .list(folder, { search: filename, limit: 1 })
  if (error) {
    console.error('[Careers Apply] verify list failed:', error)
    return false
  }
  return Array.isArray(data) && data.some((o) => o.name === filename)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const vacancyId = str(body.vacancy_id)

    const firstName = str(body.first_name)
    const lastName = str(body.last_name)
    const fullNameInput = str(body.full_name)
    const fullName = (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : fullNameInput

    const email = str(body.email).toLowerCase()
    const phone = strOrNull(body.phone)
    const linkedin = strOrNull(body.linkedin_url)
    const dateOfBirth = strOrNull(body.date_of_birth)
    const coverLetter = str(body.cover_letter)
    const consent = body.consent === true || body.consent === 'on' || body.consent === 'true'

    const rightToWork = tristate(body.right_to_work_uk)
    const hasFilmingEquipment = tristate(body.has_filming_equipment)
    const canTravelEvents = tristate(body.can_travel_events)
    const canAttendInPerson = tristate(body.can_attend_in_person)

    const cvPath = strOrNull(body.cv_path)
    const coverLetterPath = strOrNull(body.cover_letter_path)
    const portfolioPath = strOrNull(body.portfolio_path)

    if (!vacancyId || !fullName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Consent is required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: vacancy, error: vErr } = await supabase
      .from('vacancies')
      .select('id, title, is_active, application_config')
      .eq('id', vacancyId)
      .maybeSingle()
    if (vErr || !vacancy || !vacancy.is_active) {
      return NextResponse.json({ error: 'Vacancy not available' }, { status: 404 })
    }

    const cfg = (vacancy.application_config || {}) as Record<string, unknown>
    if (cfg.ask_right_to_work && rightToWork === null) {
      return NextResponse.json({ error: 'Please answer the right to work question' }, { status: 400 })
    }
    if (cfg.require_portfolio && !portfolioPath) {
      return NextResponse.json(
        { error: 'Portfolio / examples of work are required for this role' },
        { status: 400 },
      )
    }

    const checks: Array<Promise<{ field: string; ok: boolean }>> = []
    if (cvPath) checks.push(verifyUploadedPath(supabase, vacancyId, 'cv', cvPath).then((ok) => ({ field: 'CV', ok })))
    if (coverLetterPath) checks.push(verifyUploadedPath(supabase, vacancyId, 'cover_letter', coverLetterPath).then((ok) => ({ field: 'cover letter', ok })))
    if (portfolioPath) checks.push(verifyUploadedPath(supabase, vacancyId, 'portfolio', portfolioPath).then((ok) => ({ field: 'portfolio', ok })))
    const results = await Promise.all(checks)
    const bad = results.find((r) => !r.ok)
    if (bad) {
      return NextResponse.json({ error: `Uploaded ${bad.field} could not be verified. Please re-upload.` }, { status: 400 })
    }

    const { data: app, error: insErr } = await supabase
      .from('vacancy_applications')
      .insert({
        vacancy_id: vacancyId,
        full_name: fullName,
        first_name: firstName || null,
        last_name: lastName || null,
        date_of_birth: dateOfBirth,
        email,
        phone,
        linkedin_url: linkedin,
        cover_letter: coverLetter || null,
        cv_url: cvPath,
        cover_letter_url: coverLetterPath,
        portfolio_url: portfolioPath,
        right_to_work_uk: rightToWork,
        has_filming_equipment: hasFilmingEquipment,
        can_travel_events: canTravelEvents,
        can_attend_in_person: canAttendInPerson,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insErr || !app) {
      console.error('[Careers Apply] Insert failed:', insErr)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    await Promise.allSettled([
      sendApplicationConfirmation({ to: email, applicantName: fullName, vacancyTitle: vacancy.title }),
      sendStaffApplicationNotification({
        applicantName: fullName,
        applicantEmail: email,
        vacancyTitle: vacancy.title,
        vacancyId,
        applicationId: app.id,
        hasCv: !!cvPath,
      }),
    ])

    return NextResponse.json({ success: true, id: app.id }, { status: 201 })
  } catch (e) {
    console.error('[Careers Apply] Error:', e)
    return NextResponse.json({ error: 'Application failed' }, { status: 500 })
  }
}

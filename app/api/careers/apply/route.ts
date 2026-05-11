import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendApplicationConfirmation, sendStaffApplicationNotification } from '@/lib/careers-email'

const ALLOWED_EXT = ['pdf', 'doc', 'docx']
const MAX_BYTES = 5 * 1024 * 1024
const BUCKET = 'vacancy-cvs'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createServiceClient(url, key)
}

function tristate(v: FormDataEntryValue | null): boolean | null {
  if (v === null) return null
  const s = String(v).trim().toLowerCase()
  if (s === 'yes' || s === 'true' || s === 'on') return true
  if (s === 'no' || s === 'false') return false
  return null
}

async function uploadFile(
  admin: ReturnType<typeof getAdmin>,
  vacancyId: string,
  field: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXT.includes(ext)) {
    return { ok: false, error: `${field} must be PDF, DOC or DOCX` }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `${field} must be under 5MB` }
  }
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${vacancyId}/${field}/${Date.now()}-${safe}`
  const buf = await file.arrayBuffer()
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(buf), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
  if (error) {
    console.error(`[Careers Apply] ${field} upload failed:`, error)
    return { ok: false, error: `Failed to upload ${field}` }
  }
  return { ok: true, path }
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData()
    const vacancyId = String(fd.get('vacancy_id') || '').trim()

    const firstName = String(fd.get('first_name') || '').trim()
    const lastName = String(fd.get('last_name') || '').trim()
    const fullNameInput = String(fd.get('full_name') || '').trim()
    const fullName = (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : fullNameInput

    const email = String(fd.get('email') || '').trim().toLowerCase()
    const phone = String(fd.get('phone') || '').trim() || null
    const linkedin = String(fd.get('linkedin_url') || '').trim() || null
    const dobRaw = String(fd.get('date_of_birth') || '').trim()
    const dateOfBirth = dobRaw || null
    const coverLetter = String(fd.get('cover_letter') || '').trim()
    const consent = fd.get('consent')

    const rightToWork = tristate(fd.get('right_to_work_uk'))
    const hasFilmingEquipment = tristate(fd.get('has_filming_equipment'))
    const canTravelEvents = tristate(fd.get('can_travel_events'))
    const canAttendInPerson = tristate(fd.get('can_attend_in_person'))

    const cvFile = fd.get('cv') as File | null
    const coverLetterFile = fd.get('cover_letter_file') as File | null
    const portfolioFile = fd.get('portfolio_file') as File | null

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
    if (cfg.require_portfolio && !(portfolioFile && portfolioFile.size > 0)) {
      return NextResponse.json(
        { error: 'Portfolio / examples of work are required for this role' },
        { status: 400 },
      )
    }

    let cvUrl: string | null = null
    let coverLetterUrl: string | null = null
    let portfolioUrl: string | null = null

    if (cvFile && cvFile.size > 0) {
      const r = await uploadFile(supabase, vacancyId, 'cv', cvFile)
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
      cvUrl = r.path
    }
    if (coverLetterFile && coverLetterFile.size > 0) {
      const r = await uploadFile(supabase, vacancyId, 'cover_letter', coverLetterFile)
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
      coverLetterUrl = r.path
    }
    if (portfolioFile && portfolioFile.size > 0) {
      const r = await uploadFile(supabase, vacancyId, 'portfolio', portfolioFile)
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
      portfolioUrl = r.path
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
        cv_url: cvUrl,
        cover_letter_url: coverLetterUrl,
        portfolio_url: portfolioUrl,
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
        hasCv: !!cvUrl,
      }),
    ])

    return NextResponse.json({ success: true, id: app.id }, { status: 201 })
  } catch (e) {
    console.error('[Careers Apply] Error:', e)
    return NextResponse.json({ error: 'Application failed' }, { status: 500 })
  }
}

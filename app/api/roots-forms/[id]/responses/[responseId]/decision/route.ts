import { NextResponse } from 'next/server'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { formsAdmin, readJson, sameOrigin } from '@/lib/roots-forms/server'
import { sendRootsDecisionEmail } from '@/lib/roots-forms/decision-email'

export async function POST(request: Request, {params}: {params: Promise<{id: string; responseId: string}>}) {
  if (!sameOrigin(request)) return NextResponse.json({error: 'Please use the response page.'}, {status: 403})
  let staff
  try { staff = await requireRootsStaff() } catch { return NextResponse.json({error: 'You do not have permission to review Roots applications.'}, {status: 403}) }
  const {data: {user}, error: authError} = await staff.auth.getUser()
  if (authError || !user) return NextResponse.json({error: 'Please sign in again.'}, {status: 401})
  const {id, responseId} = await params
  if (![id, responseId].every(value => /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value))) return NextResponse.json({error: 'Application not found.'}, {status: 404})
  let body
  try { body = await readJson(request, 4000) } catch { return NextResponse.json({error: 'Check the requested decision.'}, {status: 400}) }
  if (!body || typeof body !== 'object' || Array.isArray(body) || !['accepted', 'declined'].includes(body.decision) || !Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 0) return NextResponse.json({error: 'Check the requested decision.'}, {status: 400})
  if (!process.env.RESEND_API_KEY) return NextResponse.json({error: 'Email is not configured. No decision was saved or email sent.'}, {status: 503})

  const client = formsAdmin()
  const {data: form, error: formError} = await client.from('roots_forms').select('slug').eq('id', id).maybeSingle()
  if (formError) return NextResponse.json({error: 'The form could not be loaded.'}, {status: 503})
  if (form?.slug !== 'roots-residential-camp-registration') return NextResponse.json({error: 'This decision workflow is only for Roots Residential applications.'}, {status: 400})
  const {data: row, error: readError} = await client.from('roots_form_submissions')
    .select('id,answers,respondent_email,payment_state,record_state,decision_status,decision_revision,decision_email_state')
    .eq('form_id', id).eq('id', responseId).maybeSingle()
  if (readError) return NextResponse.json({error: 'Application decisions are unavailable. Check that the Roots application-decisions database setup is installed.'}, {status: 503})
  if (!row) return NextResponse.json({error: 'Application not found.'}, {status: 404})
  if (row.record_state !== 'active' || row.decision_revision !== body.expectedRevision) return NextResponse.json({error: 'This application changed. Reload before trying again.'}, {status: 409})
  if (body.decision === 'declined' && row.payment_state === 'paid') return NextResponse.json({error: 'This application is paid. Review its payment and contact the family before declining.'}, {status: 409})
  const email = row.answers?.parent_email
  const parentName = row.answers?.parent_name
  const childName = row.answers?.child_name
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof parentName !== 'string' || !parentName.trim() || typeof childName !== 'string' || !childName.trim()) return NextResponse.json({error: 'The saved application is missing valid parent or child details. No decision was changed.'}, {status: 400})
  if (row.decision_status === body.decision && row.decision_email_state === 'sent') return NextResponse.json({error: 'This decision email has already been sent.'}, {status: 409})
  // Retry the same provider idempotency key after delivery or network failures.
  const revision = row.decision_status === body.decision ? row.decision_revision : row.decision_revision + 1
  if (row.decision_email_state === 'pending' && row.decision_status !== body.decision) return NextResponse.json({error: 'A notification is pending. Retry that decision before changing it.'}, {status: 409})
  const {data: saved, error: saveError} = await client.from('roots_form_submissions')
    .update({decision_status: body.decision, decision_revision: revision, decision_at: new Date().toISOString(), decision_by: user.id, decision_email_state: 'pending', decision_email_id: null, decision_email_sent_at: null})
    .eq('form_id', id).eq('id', responseId).eq('record_state', 'active').eq('decision_revision', row.decision_revision).eq('decision_status', row.decision_status).eq('decision_email_state', row.decision_email_state).select('id').maybeSingle()
  if (saveError) return NextResponse.json({error: 'The decision could not be saved. No email was sent.'}, {status: 503})
  if (!saved) return NextResponse.json({error: 'This application changed. Reload before trying again.'}, {status: 409})
  let emailId: string
  try {
    emailId = await sendRootsDecisionEmail({reference: responseId, revision, to: email, parentName, childName, decision: body.decision, paid: row.payment_state === 'paid'})
  } catch {
    console.error('[roots/decision] Decision saved, but notification could not be confirmed')
    const {error: failureError} = await client.from('roots_form_submissions').update({decision_email_state: 'failed'})
      .eq('form_id', id).eq('id', responseId).eq('decision_revision', revision).eq('decision_email_state', 'pending')
    return NextResponse.json({error: failureError ? 'Decision saved, but email delivery and its failure status could not be confirmed. Contact an administrator before retrying.' : 'Decision saved, but email delivery was not confirmed. Reload and retry this decision to send the notification.'}, {status: 502})
  }
  const {data: recorded, error: emailError} = await client.from('roots_form_submissions').update({decision_email_state: 'sent', decision_email_id: emailId, decision_email_sent_at: new Date().toISOString()})
    .eq('form_id', id).eq('id', responseId).eq('decision_revision', revision).eq('decision_status', body.decision).select('id').maybeSingle()
  if (emailError || !recorded) return NextResponse.json({error: 'The email provider accepted the notification, but its status could not be saved. Reload before retrying.'}, {status: 503})
  return NextResponse.json({decision: body.decision, emailState: 'sent'})
}

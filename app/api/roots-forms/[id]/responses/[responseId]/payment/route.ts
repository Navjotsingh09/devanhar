import { NextResponse } from 'next/server'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { formsAdmin, readJson, sameOrigin } from '@/lib/roots-forms/server'
import { checkedPayment } from '@/lib/roots-forms/application-tracker'

export async function POST(request: Request, {params}: {params: Promise<{id: string; responseId: string}>}) {
  if (!sameOrigin(request)) return NextResponse.json({error: 'Please use the application page.'}, {status: 403})
  let client
  try { client = await requireRootsStaff() } catch { return NextResponse.json({error: 'You do not have permission to verify Roots payments.'}, {status: 403}) }
  const {data: {user}, error: authError} = await client.auth.getUser()
  if (authError || !user) return NextResponse.json({error: 'Please sign in again.'}, {status: 401})
  const {id, responseId} = await params
  if (![id, responseId].every(value => /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value))) return NextResponse.json({error: 'Application not found.'}, {status: 404})
  let payment
  try { payment = checkedPayment(await readJson(request, 4000)) } catch (error) { return NextResponse.json({error: error instanceof Error ? error.message : 'Check the payment details.'}, {status: 400}) }
  let error
  try {
    const result = await formsAdmin().rpc('record_roots_application_payment', {
      p_form_id: id, p_submission_id: responseId, p_reference: payment.reference,
      p_amount_pence: payment.amountPence, p_paid_on: payment.paidOn, p_actor: user.id,
    })
    error = result.error
  } catch {
    console.error('[roots/payment] Payment storage is unavailable')
    return NextResponse.json({error: 'Payment storage is unavailable. No payment verification was confirmed. Reload and contact an administrator before retrying.'}, {status: 503})
  }
  if (error) {
    if (error.code === '23505') return NextResponse.json({error: 'This application is already verified or that Donation Manager payment reference has already been used. Reload and check before trying again.'}, {status: 409})
    if (error.message.includes('application_not_payable')) return NextResponse.json({error: 'Only an active, accepted, unpaid application can be marked paid. Reload this application.'}, {status: 409})
    if (error.message.includes('application_not_found')) return NextResponse.json({error: 'Roots application not found.'}, {status: 404})
    if (error.message.includes('payment_before_application') || error.message.includes('invalid_payment')) return NextResponse.json({error: 'Check the payment amount, reference and date. The payment cannot be earlier than the application.'}, {status: 400})
    console.error('[roots/payment] Staff payment verification could not be saved', {code: error.code})
    return NextResponse.json({error: 'Payment verification could not be saved. Check that the Roots payment-tracker database setup is installed, then reload before retrying.'}, {status: 503})
  }
  return NextResponse.json({paymentState: 'paid', verification: 'staff'})
}

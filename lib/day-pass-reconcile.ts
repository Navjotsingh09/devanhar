import { createClient } from '@supabase/supabase-js'
import { sendDayPassConfirmationEmail, sendDayPassAdminNotification } from './day-pass-emails'

export async function reconcileDayPassBySession(sessionId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceKey || !process.env.STRIPE_SECRET_KEY) return

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

    // Find booking by client_reference_id, metadata, or payment_link match
    const bookingId = session.client_reference_id || session.metadata?.day_pass_booking_id
    let query = supabase.from('family_retreat_day_pass_bookings').select('*')
    if (bookingId) {
      query = query.eq('id', bookingId)
    } else if (session.payment_link) {
      query = query.eq('stripe_payment_link_id', session.payment_link)
    } else {
      return
    }

    const { data: bookings } = await query.limit(1)
    if (!bookings || bookings.length === 0) return
    const booking = bookings[0]
    if (booking.payment_status === 'paid') return // already reconciled

    const amountPaid = session.amount_total || booking.amount_due || 0
    const now = new Date().toISOString()

    await supabase.from('family_retreat_day_pass_bookings').update({
      payment_status: 'paid',
      amount_paid: amountPaid,
      paid_at: now,
      stripe_checkout_session_id: sessionId,
    }).eq('id', booking.id)

    // Send emails
    await sendDayPassConfirmationEmail({
      first_name: booking.first_name,
      email: booking.email,
      selected_date: booking.selected_date,
      num_adults: booking.num_adults,
      children_attending: booking.children_attending || [],
      amount_paid: amountPaid,
    })
    await sendDayPassAdminNotification({
      first_name: booking.first_name,
      last_name: booking.last_name,
      email: booking.email,
      phone: booking.phone,
      city: booking.city,
      selected_date: booking.selected_date,
      num_adults: booking.num_adults,
      children_attending: booking.children_attending || [],
      amount_paid: amountPaid,
    })
  } catch (err) {
    console.warn('[day-pass] reconcile error:', err)
  }
}

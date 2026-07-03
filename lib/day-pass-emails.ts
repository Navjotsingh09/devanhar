import { Resend } from 'resend'

const NOTIFICATION_EMAILS = ['TheSikhFI@devanhaar.com', 'SikhFI@devanhaar.com']

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export async function sendDayPassConfirmationEmail(booking: {
  first_name: string
  email: string
  selected_date: string
  num_adults: number
  children_attending: Array<{ first_name: string; last_name: string; date_of_birth: string }>
  amount_paid: number
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  const numChildren = booking.children_attending.length
  const dateStr = formatDate(booking.selected_date)
  const amountStr = (booking.amount_paid / 100).toFixed(2)

  const childrenText = numChildren > 0
    ? booking.children_attending.map((c, i) => `  Child ${i + 1}: ${c.first_name} ${c.last_name} (DOB: ${c.date_of_birth})`).join('\n')
    : '  None'

  await resend.emails.send({
    from: 'Sikh Family Retreat <noreply@devanhaar.com>',
    to: booking.email,
    subject: `Day Pass confirmed \u2014 ${dateStr}`,
    text: [
      `Dear ${booking.first_name},`,
      '',
      'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
      '',
      `Thank you \u2014 your payment of \u00a3${amountStr} has been received and your Sikh Family Retreat Day Pass is confirmed.`,
      '',
      'Booking summary:',
      `  Date: ${dateStr}`,
      `  Adults: ${booking.num_adults}`,
      `  Children/Young people: ${numChildren}`,
      childrenText !== '  None' ? `Children attending:\n${childrenText}` : '',
      `  Total paid: \u00a3${amountStr}`,
      '',
      'Please bring this confirmation email with you on the day. Further details about the programme, arrival times and directions will be shared closer to the event.',
      '',
      'We are really looking forward to welcoming you to the Sikh Family Retreat.',
      '',
      'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
      '',
      'Warm regards,',
      'The Sikh Family Initiative Team',
    ].filter(Boolean).join('\n'),
    html: [
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">',
      `<p>Dear ${booking.first_name},</p>`,
      '<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>',
      `<p>Thank you &mdash; your payment of <strong>&pound;${amountStr}</strong> has been received and your Sikh Family Retreat Day Pass is confirmed.</p>`,
      '<p><strong>Booking summary</strong><br>',
      `Date: ${dateStr}<br>`,
      `Adults: ${booking.num_adults}<br>`,
      `Children/Young people: ${numChildren}</p>`,
      numChildren > 0
        ? `<p><strong>Children attending</strong><br>${booking.children_attending.map((c, i) => `Child ${i + 1}: ${c.first_name} ${c.last_name} (DOB: ${c.date_of_birth})`).join('<br>')}</p>`
        : '',
      `<p><strong>Total paid: &pound;${amountStr}</strong></p>`,
      '<p>Please bring this confirmation email with you on the day. Further details about the programme, arrival times and directions will be shared closer to the event.</p>',
      '<p>We are really looking forward to welcoming you to the Sikh Family Retreat.</p>',
      '<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>',
      '<p>Warm regards,<br>The Sikh Family Initiative Team</p>',
      '</div>',
    ].join(''),
  })
}

export async function sendDayPassAdminNotification(booking: {
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  selected_date: string
  num_adults: number
  children_attending: Array<{ first_name: string; last_name: string; date_of_birth: string }>
  amount_paid: number
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  const dateStr = formatDate(booking.selected_date)
  const amountStr = (booking.amount_paid / 100).toFixed(2)
  const childrenText = booking.children_attending.map((c, i) => `  Child ${i + 1}: ${c.first_name} ${c.last_name} (DOB: ${c.date_of_birth})`).join('\n')

  await resend.emails.send({
    from: 'Sikh Family Retreat <noreply@devanhaar.com>',
    to: NOTIFICATION_EMAILS,
    subject: `New Day Pass booking \u2014 ${booking.first_name} ${booking.last_name} (${dateStr})`,
    text: [
      'New Sikh Family Retreat Day Pass booking received.',
      '',
      `Name: ${booking.first_name} ${booking.last_name}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone}`,
      `Location: ${booking.city}`,
      `Date: ${dateStr}`,
      `Adults: ${booking.num_adults}`,
      `Children: ${booking.children_attending.length}`,
      booking.children_attending.length > 0 ? `\nChildren:\n${childrenText}` : '',
      `Amount paid: \u00a3${amountStr}`,
      '',
      'View bookings at https://devanhaar.com/dashboard/family-retreat/day-pass',
    ].filter(Boolean).join('\n'),
    html: `<div style="font-family:Arial,sans-serif;font-size:14px">
      <p><strong>New Day Pass booking received.</strong></p>
      <p>Name: ${booking.first_name} ${booking.last_name}<br>
      Email: ${booking.email}<br>Phone: ${booking.phone}<br>
      Location: ${booking.city}<br>Date: ${dateStr}<br>
      Adults: ${booking.num_adults}<br>Children: ${booking.children_attending.length}<br>
      Amount paid: &pound;${amountStr}</p>
      <p><a href="https://devanhaar.com/dashboard/family-retreat/day-pass">View bookings dashboard</a></p></div>`,
  })
}

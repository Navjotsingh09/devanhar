import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
function load(path, modules, env = {}) {
  const source = fs.readFileSync(path, 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, { module, exports: module.exports, URL, Date, console, process: { env }, require: name => name in modules ? modules[name] : require(name) })
  return module.exports
}

function bookingSetup() {
  const saved = [], emails = []
  const details = load('lib/family-retreat-booking-details.ts', {}, { FAMILY_RETREAT_BOOKING_EVENTS: 'new-year-reset' })
  const route = load('app/api/family-retreat-bookings/route.ts', {
    '@/lib/family-retreat-booking-details': details,
    '@/lib/family-retreat-email-signature': { familyRetreatSignatureLines: [] },
    '@/lib/booking-device': { detectBookingDevice: () => 'desktop' },
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@supabase/supabase-js': { createClient: () => ({ from: table => ({
      insert: row => { saved.push({ table, row }); return { select: () => ({ single: async () => ({ data: { id: 'fixture', booking_number: 1, created_at: new Date().toISOString() }, error: null }) }) } },
    }) }) },
    resend: { Resend: class { emails = { send: async message => { emails.push(message) } } } },
  }, { NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'fixture', RESEND_API_KEY: 'fixture' })
  const body = {
    event: 'new-year-reset', age: '35', guardian: 'yes', parent_consent: true, transport_required: 'no',
    accommodation_preference: 'option-1', first_name: 'Test', last_name: 'Example', email: 'test@example.invalid',
    phone: '07000000000', address: 'Example Street', city: 'Example', postcode: 'TEST 1AA', country: 'UK',
    emergency_contact_name: 'Example Contact', emergency_contact_relationship: 'Friend', emergency_contact_phone: '07000000001',
    heard_about_retreat: 'Website', children: [{ first_name: 'Test', last_name: 'Example', date_of_birth: '2015-01-01' }],
    consent_privacy: true,
  }
  return { saved, emails, details, route, body }
}

test('a family booking saves every adult and separates infants in staff notification', async () => {
  const { saved, emails, route, body } = bookingSetup()
  const oneYearAgo = new Date()
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1)
  body.additional_adults = [{ first_name: 'Second', last_name: 'Adult', age: '32' }]
  body.children.push({ first_name: 'Infant', last_name: 'Example', date_of_birth: oneYearAgo.toISOString().slice(0, 10) })
  const response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(saved.length, 1)
  assert.equal(saved[0].table, 'family_retreat_bookings')
  assert.equal(saved[0].row.booking_details.event, 'new-year-reset')
  assert.equal(saved[0].row.status, 'pending')
  assert.equal(saved[0].row.adults_attending.length, 2)
  assert.equal(saved[0].row.adults_attending[0].first_name, body.first_name)
  assert.equal(saved[0].row.adults_attending[1].age, 32)
  assert.equal(saved[0].row.children_attending.length, 2)
  assert.equal(emails.length, 2)
  assert.match(emails[0].text, /Adults: 2/)
  assert.match(emails[0].text, /Additional adult 1: Second Adult · Age: 32/)
  assert.match(emails[0].text, /Children aged 2–17: 1; infants under 2: 1/)
  assert.equal(emails[1].to, body.email)
})

test('adult-only bookings do not require child consent or mention written permission', async () => {
  const { saved, emails, route, body } = bookingSetup()
  Object.assign(body, { children: [], additional_adults: [], guardian: '', parent_consent: false })
  const response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 200)
  assert.equal(saved[0].row.adults_attending.length, 1)
  assert.equal(saved[0].row.booking_details.guardian_of_all, null)
  assert.equal(saved[0].row.booking_details.parent_consent, null)
  assert.doesNotMatch(emails[0].text, /guardian consent|Written permission/)
  assert.doesNotMatch(emails[1].text, /written permission/)
})

test('invalid additional adults and missing child consent are rejected before saving', async () => {
  const { saved, route, body } = bookingSetup()
  body.additional_adults = [{ first_name: 'Second', last_name: 'Adult', age: '17' }]
  let response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 400)
  body.additional_adults = []
  body.parent_consent = false
  response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 400)
  body.parent_consent = true
  body.children[0].date_of_birth = '1900-01-01'
  response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 400)
  assert.equal(saved.length, 0)
})

test('in-flight old forms remain accepted without inventing additional adult totals', async () => {
  const { saved, emails, route, body } = bookingSetup()
  const response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 200)
  assert.equal(saved[0].row.adults_attending, undefined)
  assert.match(emails[0].text, /additional adults not recorded/)
})

test('infant classification uses the UK booking date and handles unknown ages', () => {
  const { details } = bookingSetup()
  const counts = details.retreatChildCounts([
    { date_of_birth: '2024-11-13' },
    { date_of_birth: '2024-11-12' },
    { date_of_birth: 'invalid' },
  ], new Date('2026-11-12T12:00:00Z'))
  assert.equal(counts.infants, 1)
  assert.equal(counts.children, 1)
  assert.equal(counts.unknown, 1)
  assert.equal(details.retreatChildCounts([{ date_of_birth: '2024-01-01' }], new Date('invalid')).unknown, 1)
})

test('dashboard shows saved adults and separates infant and child counts', () => {
  const { details } = bookingSetup()
  const element = ({ children }) => React.createElement(React.Fragment, null, children)
  const components = new Proxy({}, { get: (_, name) => typeof name === 'string' && name !== 'then' && name !== '__esModule' ? element : undefined })
  const table = load('components/family-retreat/family-retreat-bookings-table.tsx', {
    '@/lib/family-retreat-booking-details': details,
    '@/lib/family-retreat-tracker': { retreatProgress: () => ({ due: 0, received: 0, refundable: 0 }), retreatMoney: () => '£0' },
    './family-retreat-tracker': components,
    '@/lib/booking-device': { deviceLabel: () => 'Unknown' },
    'date-fns': { format: () => '2026-11-12' },
    'lucide-react': components,
    '@/components/ui/button': components,
    '@/components/ui/input': components,
    '@/components/ui/select': components,
    '@/components/ui/table': components,
    '@/components/ui/textarea': components,
    '@/components/dashboard/status-filter-pills': { statusFilterClass: () => '' },
    '@/app/dashboard/family-retreat/actions': {},
  }).FamilyRetreatBookingsTable
  const booking = {
    id: 'one', created_at: '2026-11-12T12:00:00Z', status: 'pending', first_name: 'Lead', last_name: 'Example',
    adults_attending: [{ first_name: 'Lead', last_name: 'Example', age: 35 }, { first_name: 'Second', last_name: 'Adult', age: 32 }],
    children_attending: [{ first_name: 'Young', last_name: 'Example', date_of_birth: '2025-11-12' }, { first_name: 'Older', last_name: 'Example', date_of_birth: '2024-11-12' }],
    booking_details: { event: 'new-year-reset', age: 35, guardian_of_all: true, parent_consent: true },
  }
  const html = renderToStaticMarkup(React.createElement(table, { bookings: [booking] }))
  assert.match(html, /Adult 2:.*Second.*Adult.*32/)
  assert.match(html, /Adults: 2.*Children 2–17: 1.*Infants under 2: 1.*Total: 4/)
  const oldHtml = renderToStaticMarkup(React.createElement(table, { bookings: [{ ...booking, adults_attending: null }] }))
  assert.match(oldHtml, /additional adults not recorded/)
})

test('public form offers additional adults and an explicit child or infant choice', () => {
  const { details } = bookingSetup()
  const element = ({ children }) => React.createElement(React.Fragment, null, children)
  const components = new Proxy({}, { get: (_, name) => typeof name === 'string' && name !== 'then' && name !== '__esModule' ? element : undefined })
  const form = load('components/family-retreat/family-retreat-booking-form.tsx', {
    '@/lib/family-retreat-booking-details': details,
    '@/components/ui/button': components,
    '@/components/ui/input': components,
    '@/components/ui/label': components,
    '@/components/ui/textarea': components,
    '@/components/ui/select': components,
    'lucide-react': components,
  }).FamilyRetreatBookingForm
  const html = renderToStaticMarkup(React.createElement(form, { event: 'new-year-reset' }))
  assert.match(html, /Additional adults attending/)
  assert.match(html, /Add an adult/)
  assert.match(html, /Are any children or infants attending/)
  assert.match(html, /Infants are counted separately based on their age when you submit/)
})

test('retreat dashboard shows bookings before interests and insights last', async () => {
  const query = { select() { return this }, ilike() { return this }, order() { return this }, limit() { return this }, lt() { return this }, then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve) } }
  const page = load('app/dashboard/family-initiative/retreat/page.tsx', {
    '@/lib/crm/request-staff': { getRequestStaff: async () => ({ profile: { data: { role: 'admin' } } }) },
    '@/lib/staff-programme-server': { requireProgramme: async () => ({ from: () => query }) },
    '@/lib/family-retreat-tracker': { retreatProgress: () => ({}) },
    '@/components/family-initiative/family-booking-insights': { FamilyBookingInsights: () => React.createElement('h2', null, 'Booking and device insights') },
    '@/components/family-retreat/family-retreat-bookings-table': { FamilyRetreatBookingsTable: () => null },
    '@/components/family-initiative/family-interest-table': { FamilyInterestTable: () => null },
    '@/components/dashboard/recovered-payment-section': { RecoveredPaymentSection: () => React.createElement('h2', null, 'Recovered Family Retreat Bookings') },
  }).default
  const html = renderToStaticMarkup(await page())
  const bookings = html.indexOf('Retreat bookings (')
  const recovered = html.indexOf('Recovered Family Retreat Bookings')
  const interests = html.indexOf('Interest registrations (')
  const insights = html.indexOf('Booking and device insights')
  assert.ok(bookings >= 0 && bookings < recovered && recovered < interests && interests < insights)
})

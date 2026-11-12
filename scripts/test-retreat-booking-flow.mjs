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

test('a valid public booking is saved and both notifications are sent', async () => {
  const saved = [], emails = []
  const details = load('lib/family-retreat-booking-details.ts', {}, { FAMILY_RETREAT_BOOKING_EVENTS: 'new-year-reset' })
  const route = load('app/api/family-retreat-bookings/route.ts', {
    '@/lib/family-retreat-booking-details': details,
    '@/lib/family-retreat-email-signature': { familyRetreatSignatureLines: [] },
    '@/lib/booking-device': { detectBookingDevice: () => 'desktop' },
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@supabase/supabase-js': { createClient: () => ({ from: table => ({
      insert: row => { saved.push({ table, row }); return { select: () => ({ single: async () => ({ data: { id: 'fixture', booking_number: 1, created_at: '2026-11-12T12:00:00Z' }, error: null }) }) } },
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
  const response = await route.POST({ json: async () => body, headers: new Headers() })
  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(saved.length, 1)
  assert.equal(saved[0].table, 'family_retreat_bookings')
  assert.equal(saved[0].row.booking_details.event, 'new-year-reset')
  assert.equal(saved[0].row.status, 'pending')
  assert.equal(emails.length, 2)
  assert.equal(emails[1].to, body.email)
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

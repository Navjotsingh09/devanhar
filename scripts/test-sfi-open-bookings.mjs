import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
function load(path, modules) {
  const source = fs.readFileSync(path, 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, { module, exports: module.exports, URL, Date, console, require: name => name in modules ? modules[name] : require(name) })
  return module.exports
}

const retreats = {
  RETREAT_BOOKING_EVENTS: { 'new-year-reset': { title: 'New Year Reset', date: '31 December 2026' }, spring: { title: 'Spring Retreat', date: '1 April 2027' } },
  isRetreatBookingOpen: event => event === 'new-year-reset',
}
const { getSfiOpenBookings } = load('lib/sfi-open-bookings.ts', { '@/lib/family-retreat-booking-details': retreats })
const projects = [{ id: 'sfi', slug: 'sikh-family-initiative' }, { id: 'other', slug: 'singhs-camp' }]
const event = (id, projectId, content) => ({ id, projectId, content: { kind: 'event', title: id, dateLabel: '2027', status: 'registration_open', comingSoon: false, registrationUrl: `/events/${id}`, endAt: '', ...content } })

test('only open SFI bookings appear, with duplicate retreat links removed', () => {
  const bookings = getSfiOpenBookings(projects, [
    event('fair', 'sfi'),
    event('closed', 'sfi', { status: 'sold_out' }),
    event('future', 'sfi', { comingSoon: true }),
    event('past', 'sfi', { endAt: '2020-01-01T00:00:00Z' }),
    event('external', 'other'),
    event('duplicate', 'sfi', { registrationUrl: 'https://devanhaar.com/sfr/book?event=new-year-reset' }),
  ], Date.parse('2026-11-12T00:00:00Z'))
  assert.deepEqual(Array.from(bookings, booking => booking.href), ['/sfr/book?event=new-year-reset', '/events/fair'])
})

const renderer = load('components/cms/sfi-page-content.tsx', {
  'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
  '@/components/navbar': { Navbar: () => null },
  '@/components/footer-section': { FooterSection: () => null },
  '@/components/ui/button': { Button: ({ children }) => children },
  '@/lib/family-retreat-booking-details': retreats,
}).SfiPageContent
const content = JSON.parse(fs.readFileSync('lib/cms/sfi-default.json', 'utf8'))

test('featured button adapts to zero, one or multiple open bookings', () => {
  const one = { title: 'New Year Reset', date: '2026', href: '/sfr/book?event=new-year-reset' }
  const two = { title: 'Wedding Fair', date: '2027', href: '/fair/book' }
  const render = openBookings => renderToStaticMarkup(React.createElement(renderer, { content, openBookings }))
  assert.match(render([]), /href="#upcoming">Explore upcoming events/)
  assert.match(render([one]), /href="\/sfr\/book\?event=new-year-reset">Book now/)
  const html = render([one, two])
  assert.match(html, /href="#open-bookings">Book now/)
  assert.match(html, /Bookings open now/)
  assert.match(html, /href="\/fair\/book"[^>]*>Book now/)
})

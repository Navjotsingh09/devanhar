import assert from 'node:assert/strict'
import test from 'node:test'
import { isRegistrationWindowOpen } from '../lib/registration-window-status.ts'

const window = { id: 'test', title: 'Test event', kind: 'application', href: '/test', is_open: true, opens_at: null, closes_at: null, event_date: null, sort_order: 1 }
const now = new Date('2026-10-14T09:00:00Z')

test('enabled ongoing forms are shown; explicitly closed forms are hidden', () => {
  assert.equal(isRegistrationWindowOpen(window, now), true)
  assert.equal(isRegistrationWindowOpen({ ...window, is_open: false }, now), false)
})
test('future openings are hidden, and the opening instant is included', () => {
  assert.equal(isRegistrationWindowOpen({ ...window, opens_at: '2026-10-14T09:01:00Z' }, now), false)
  assert.equal(isRegistrationWindowOpen({ ...window, opens_at: now.toISOString() }, now), true)
})
test('closing instant and expired windows are hidden', () => {
  assert.equal(isRegistrationWindowOpen({ ...window, closes_at: now.toISOString() }, now), false)
  assert.equal(isRegistrationWindowOpen({ ...window, closes_at: '2026-10-13T00:00:00Z' }, now), false)
})
test('past events expire even when their switch is left enabled', () => {
  assert.equal(isRegistrationWindowOpen({ ...window, event_date: '2026-07-31' }, now), false)
  assert.equal(isRegistrationWindowOpen({ ...window, event_date: '2026-11-28' }, now), true)
})
test('event expiry uses the UK calendar day', () => {
  assert.equal(isRegistrationWindowOpen({ ...window, event_date: '2026-10-13' }, new Date('2026-10-13T23:30:00Z')), false)
})
test('malformed times and unsafe links cannot be advertised', () => {
  assert.equal(isRegistrationWindowOpen({ ...window, opens_at: 'invalid' }, now), false)
  assert.equal(isRegistrationWindowOpen({ ...window, closes_at: 'invalid' }, now), false)
  for (const href of ['javascript:alert(1)', '//example.com', 'https://example.com']) assert.equal(isRegistrationWindowOpen({ ...window, href }, now), false)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript as load } from './helpers/load-typescript.mjs'
const { themeSchema, themeStyle } = load('lib/cms/theme.ts')
const { siteSettingsSchema, defaultSiteSettings } = load('lib/cms/site-settings.ts')

test('existing settings need no theme migration and do not change fonts or button shapes', () => {
  assert.equal(siteSettingsSchema.safeParse(defaultSiteSettings).success, true)
  const style = themeStyle(defaultSiteSettings.brand.accent)
  assert.equal(style['--primary'], '43 99% 50%')
  assert.equal(style.fontFamily, undefined)
  assert.equal(style['--cms-button-radius'], undefined)
  assert.equal(style['--radius'], undefined)
})

test('theme fields reject arbitrary CSS and invalid radius values', () => {
  for (const input of [{ font: 'url(evil)' }, { radius: -1 }, { radius: 33 }, { buttonStyle: 'expression()' }]) {
    assert.equal(themeSchema.safeParse(input).success, false)
  }
})

test('safe typography and button choices map to bounded CSS variables', () => {
  const theme = themeSchema.parse({ font: 'serif', radius: 16, buttonStyle: 'rounded' })
  const style = themeStyle('#000000', theme)
  assert.equal(style.fontFamily, 'Georgia, serif')
  assert.equal(style['--radius'], '16px')
  assert.equal(style['--cms-button-radius'], '16px')
  assert.equal(style['--primary'], '0 0% 0%')
  assert.equal(themeStyle('#ffffff', { ...theme, buttonStyle: 'pill' })['--cms-button-radius'], '9999px')
  assert.equal(themeStyle('#ffffff', { ...theme, buttonStyle: 'square' })['--cms-button-radius'], '0px')
})

test('theme survives settings schema without changing default navigation', () => {
  const settings = siteSettingsSchema.parse({ ...defaultSiteSettings, theme: themeSchema.parse({ font: 'inter' }) })
  assert.equal(settings.theme.font, 'inter')
  assert.equal(settings.navigation.links.length, defaultSiteSettings.navigation.links.length)
  assert.equal(settings.brand.darkLogo, defaultSiteSettings.brand.darkLogo)
})

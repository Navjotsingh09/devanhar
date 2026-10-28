import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript as load } from './helpers/load-typescript.mjs'

const { pageSeoSchema, pageMetadata } = load('lib/cms/seo.ts')
const original = { title: 'Page title', description: 'Page description', noIndex: false }

test('existing saved SEO remains valid without social fields', () => {
  assert.equal(pageSeoSchema.safeParse(original).success, true)
  assert.deepEqual(JSON.parse(JSON.stringify(pageSeoSchema.parse(original))), original)
})

test('social metadata defaults to search metadata and preserves fallback images', () => {
  const fallback = { openGraph: { images: ['/original.jpg'], type: 'website' }, twitter: { card: 'summary' } }
  const metadata = pageMetadata(original, fallback)
  assert.equal(metadata.openGraph.title, original.title)
  assert.equal(metadata.openGraph.description, original.description)
  assert.deepEqual(metadata.openGraph.images, fallback.openGraph.images)
  assert.equal(metadata.openGraph.type, 'website')
  assert.equal(metadata.twitter.card, 'summary')
  assert.equal(metadata.twitter.title, original.title)
})

test('saved social overrides affect Open Graph and Twitter without replacing search metadata', () => {
  const seo = { ...original, socialTitle: 'Share title', socialDescription: 'Share description', socialImage: '/wrestling/team-01.webp' }
  const metadata = pageMetadata(pageSeoSchema.parse(seo))
  assert.equal(metadata.title, original.title)
  assert.equal(metadata.description, original.description)
  for (const type of ['openGraph', 'twitter']) {
    assert.equal(metadata[type].title, seo.socialTitle)
    assert.equal(metadata[type].description, seo.socialDescription)
    assert.deepEqual(Array.from(metadata[type].images), [seo.socialImage])
  }
  assert.equal(metadata.twitter.card, 'summary_large_image')
})

test('private indexing preference is respected', () => {
  const metadata = pageMetadata({ ...original, noIndex: true })
  assert.equal(metadata.robots.index, false)
  assert.equal(metadata.robots.follow, false)
})

test('social image rejects unsafe or untrusted URLs and overlong metadata', () => {
  for (const socialImage of ['javascript:alert(1)', '//evil.test/image.jpg', 'https://evil.test/image.jpg', '/\\evil.test/image.jpg']) {
    assert.equal(pageSeoSchema.safeParse({ ...original, socialImage }).success, false)
  }
  assert.equal(pageSeoSchema.safeParse({ ...original, socialImage: 'https://example.supabase.co/storage/v1/object/public/site-images/library/file.jpg' }).success, true)
  assert.equal(pageSeoSchema.safeParse({ ...original, socialTitle: 'x'.repeat(161) }).success, false)
  assert.equal(pageSeoSchema.safeParse({ ...original, socialDescription: 'x'.repeat(321) }).success, false)
})

test('SFI and page bodies accept and preserve the same social SEO fields', () => {
  const { pageContentSchema, defaultHomeContent } = load('lib/cms/page-content.ts')
  const { sfiSchema, defaultSfiContent } = load('lib/cms/sfi-content.ts')
  const seo = { ...original, socialTitle: 'Share title', socialDescription: 'Share description', socialImage: '/wrestling/team-01.webp' }
  for (const [schema, content] of [[pageContentSchema, defaultHomeContent], [sfiSchema, defaultSfiContent]]) {
    const parsed = schema.parse({ ...content, seo })
    assert.equal(parsed.seo.socialImage, seo.socialImage)
    assert.equal(parsed.seo.socialTitle, seo.socialTitle)
  }
})

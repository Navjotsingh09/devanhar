import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { loadTypeScript as load } from './helpers/load-typescript.mjs'

const Link = ({ children, ...props }) => React.createElement('a', props, children)
const edited = '2026-10-23T12:00:00Z'
function fixture({ blogAllowed = false, failure, records = {} } = {}) {
  const calls = []
  const client = { from(table) {
    calls.push(table)
    const result = { data: records[table] ?? [], count: (records[table] ?? []).length, error: failure === table ? new Error('Test lookup failure') : null }
    const query = { then: resolve => Promise.resolve(result).then(resolve) }
    for (const method of ['select', 'not', 'order', 'limit', 'eq', 'is', 'in']) query[method] = () => query
    return query
  } }
  const mocks = {
    'next/link': { __esModule: true, default: Link },
    '@/lib/crm/request-staff': { getRequestStaff: async () => ({ client }) },
    '@/lib/blog-staff-server': { getBlogStaff: async () => ({ allowed: blogAllowed }) },
  }
  return { calls, mocks }
}

test('draft inbox does not read articles without verified blog access', async () => {
  const { calls, mocks } = fixture({ records: {
    cms_pages: [{ slug: 'sfi', updated_at: edited, draft_revision_id: 'draft' }],
    cms_entries: [{ slug: 'wrestling', kind: 'project', updated_at: edited, draft_revision_id: 'draft' }],
  } })
  const Page = load('app/dashboard/website/drafts/page.tsx', mocks).default
  const html = renderToStaticMarkup(await Page())
  assert.ok(!calls.includes('blog_posts'))
  assert.ok(html.includes('href="/dashboard/website/sfi"'))
  assert.ok(html.includes('href="/dashboard/website/content/project/wrestling"'))
})

test('draft inbox opens authorized article drafts in the existing edit route', async () => {
  const { calls, mocks } = fixture({ blogAllowed: true, records: {
    blog_posts: [{ slug: 'sample-article', updated_at: edited, draft_revision_id: 'draft' }],
  } })
  const Page = load('app/dashboard/website/drafts/page.tsx', mocks).default
  const html = renderToStaticMarkup(await Page())
  assert.ok(calls.includes('blog_posts'))
  assert.ok(html.includes('href="/dashboard/blog/sample-article/edit"'))
})

test('draft lookup errors do not become an empty success screen', async () => {
  const { mocks } = fixture({ failure: 'cms_entries' })
  const Page = load('app/dashboard/website/drafts/page.tsx', mocks).default
  await assert.rejects(Page(), /draft inbox could not be loaded/)
})

test('structured overview shows accessible counts and current saved revision titles', async () => {
  const { mocks } = fixture({ records: {
    cms_entries: [{ id: 'project-id', kind: 'project', slug: 'wrestling', updated_at: edited, draft_revision_id: 'draft-id', published_revision_id: 'live-id' }],
    cms_entry_revisions: [{ id: 'draft-id', title: 'Wrestling Academy' }],
  } })
  const Summary = load('components/cms/structured-summary.tsx', mocks).StructuredSummary
  const html = renderToStaticMarkup(await Summary())
  assert.ok(html.includes('Wrestling Academy'))
  assert.ok(html.includes('Live with draft changes'))
  assert.ok(html.includes('href="/dashboard/website/drafts"'))
})

test('structured overview explicitly reports query failure', async () => {
  const { mocks } = fixture({ failure: 'cms_entries' })
  const Summary = load('components/cms/structured-summary.tsx', mocks).StructuredSummary
  const html = renderToStaticMarkup(await Summary())
  assert.ok(html.includes('role="alert"'))
  assert.ok(html.includes('could not be loaded'))
})

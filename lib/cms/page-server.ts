import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { type SfiHead } from './sfi-content'
import { cmsSlugSchema, defaultHomeContent, newPageContent, parsePageBody, type PageContent } from './page-content'

export class CmsError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new CmsError('Website editing is temporarily unavailable.', 503)
  return createServiceClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function pageContext(slug: string, action: 'view' | 'edit' | 'publish' = 'view') {
  if (!cmsSlugSchema.safeParse(slug).success) throw new CmsError('Unknown website page.', 404)
  const session = await createClient()
  const { data: { user }, error } = await session.auth.getUser()
  if (error || !user) throw new CmsError('Please sign in again.', 401)
  const [profile, grants] = await Promise.all([
    session.from('admin_profiles').select('role').eq('id', user.id).maybeSingle(),
    session.from('staff_programme_access').select('programme').eq('user_id', user.id),
  ])
  if (profile.error || grants.error || !profile.data || !Array.isArray(grants.data)) {
    throw new CmsError('Unable to verify website editing access.', 403)
  }
  // CMS roles are explicit. Content Managers still need a page assignment;
  // legacy operational grants neither confer CMS access nor override that role.
  if (!['admin', 'super_admin', 'content_manager'].includes(profile.data.role)) {
    throw new CmsError('This account is not assigned to edit this website page.', 403)
  }
  const pageResult = await session.from('cms_pages').select('id, draft_revision_id, published_revision_id, updated_at').eq('slug', slug).maybeSingle()
  if (pageResult.error) throw new CmsError('Website content could not be loaded. Please retry.', 503)
  const page = pageResult.data
  const isAdmin = ['admin', 'super_admin'].includes(profile.data.role)
  let permissions = { view: isAdmin, edit: isAdmin, publish: isAdmin }
  if (!isAdmin) {
    if (!page) throw new CmsError('This page is not assigned to you.', 403)
    const { data: assignment, error: assignmentError } = await session.from('cms_page_assignments')
      .select('can_view, can_edit, can_publish').eq('page_id', page.id).eq('user_id', user.id).maybeSingle()
    if (assignmentError || !assignment) throw new CmsError('This page is not assigned to you.', 403)
    permissions = {
      view: assignment.can_view === true,
      edit: assignment.can_view === true && assignment.can_edit === true,
      publish: assignment.can_view === true && assignment.can_edit === true && assignment.can_publish === true,
    }
  }
  if (!permissions[action]) throw new CmsError(`You do not have permission to ${action} this page.`, 403)
  return { user, page, permissions, session, db: serviceClient() }
}

export async function getPageEditorState(slug: string) {
  const context = await pageContext(slug)
  const { page, db, permissions } = context
  let content = slug === 'home' ? defaultHomeContent : newPageContent()
  const revisionId = page?.draft_revision_id || page?.published_revision_id
  if (revisionId) {
    const { data, error } = await db.from('cms_page_revisions').select('body').eq('page_id', page!.id).eq('id', revisionId).single()
    const parsed = data && parsePageBody(data.body)
    if (error || !parsed) throw new CmsError('This revision could not be read. Nothing has been changed.', 503)
    content = parsed
  }
  const head: SfiHead = { pageId: page?.id ?? null, draftId: page?.draft_revision_id ?? null, publishedId: page?.published_revision_id ?? null }
  const { data: history, error: historyError } = page
    ? await db.from('cms_page_revisions').select('id, revision_number, created_at, created_by').eq('page_id', page.id).order('revision_number', { ascending: false }).limit(20)
    : { data: [], error: null }
  if (historyError) throw new CmsError('Revision history could not be loaded.', 503)
  return { content, head, permissions, history: history ?? [], updatedAt: page?.updated_at ?? null }
}

export async function getPublishedPageContent(slug: string): Promise<PageContent | null> {
  try {
    if (!cmsSlugSchema.safeParse(slug).success) return null
    const db = serviceClient()
    // The published pointer is the ONLY source for a public read. Never fall
    // back to a draft, including for signed-in staff visiting the public URL.
    const { data: page, error } = await db.from('cms_pages').select('id, published_revision_id').eq('slug', slug).maybeSingle()
    if (error || !page?.published_revision_id) return (slug === 'home' ? defaultHomeContent : null)
    const { data: revision, error: revisionError } = await db.from('cms_page_revisions')
      .select('body').eq('page_id', page.id).eq('id', page.published_revision_id).single()
    return !revisionError && revision ? parsePageBody(revision.body) ?? (slug === 'home' ? defaultHomeContent : null) : (slug === 'home' ? defaultHomeContent : null)
  } catch { return (slug === 'home' ? defaultHomeContent : null) }
}

export function sameHead(page: { id: string; draft_revision_id: string | null; published_revision_id: string | null } | null, expected: SfiHead) {
  return (page?.id ?? null) === expected.pageId && (page?.draft_revision_id ?? null) === expected.draftId
    && (page?.published_revision_id ?? null) === expected.publishedId
}

export async function changePageContent(slug: string, action: 'save' | 'publish', content: PageContent, expected: SfiHead) {
  const { page, db, user, session } = await pageContext(slug, action === 'save' ? 'edit' : 'publish')
  if (!sameHead(page, expected)) throw new CmsError('Someone changed this page. Reload before saving or publishing.', 409)
  if (!page) {
    if (action !== 'save') throw new CmsError('Save a draft before publishing.', 409)
    const { error } = await session.rpc('cms_create_page', {
      p_slug: slug, p_title: content.title, p_summary: content.seo.description,
      p_body: JSON.stringify(content), p_hero_image: '',
      p_seo_title: content.seo.title, p_seo_description: content.seo.description, p_no_index: content.seo.noIndex,
    })
    if (error) throw new CmsError(error.code === '23505' ? 'Someone created this page. Reload before saving.' : 'Draft could not be saved.', error.code === '23505' ? 409 : 503)
    return
  }
  let draftId = page.draft_revision_id
  if (action === 'save') {
    const { data: latest, error: latestError } = await db.from('cms_page_revisions').select('revision_number').eq('page_id', page.id).order('revision_number', { ascending: false }).limit(1).maybeSingle()
    if (latestError) throw new CmsError('Draft could not be saved.', 503)
    const { data: revision, error } = await db.from('cms_page_revisions').insert({
      page_id: page.id, revision_number: (latest?.revision_number ?? 0) + 1,
      title: content.title, summary: content.seo.description, body: JSON.stringify(content), hero_image: '',
      seo_title: content.seo.title, seo_description: content.seo.description, no_index: content.seo.noIndex,
      status: 'draft', created_by: user.id,
    }).select('id').single()
    if (error || !revision) throw new CmsError(error?.code === '23505' ? 'Another editor saved first. Reload this page.' : 'Draft could not be saved.', error?.code === '23505' ? 409 : 503)
    draftId = revision.id
  } else {
    if (!draftId) throw new CmsError('Save a draft before publishing.', 409)
    const { data: revision, error } = await db.from('cms_page_revisions').select('body').eq('page_id', page.id).eq('id', draftId).single()
    if (error || !revision || !parsePageBody(revision.body)) throw new CmsError('The saved draft is invalid. Nothing was published.', 409)
    // The publish button publishes the reviewed saved snapshot, never new text
    // supplied in the request or an arbitrary revision ID.
    if (JSON.stringify(parsePageBody(revision.body)) !== JSON.stringify(content)) throw new CmsError('Save and preview your latest changes before publishing.', 409)
  }
  const changes = action === 'save'
    ? { draft_revision_id: draftId }
    : { published_revision_id: draftId, draft_revision_id: null }
  let query = db.from('cms_pages').update({ ...changes, updated_by: user.id, updated_at: new Date().toISOString() }).eq('id', page.id)
  query = expected.draftId ? query.eq('draft_revision_id', expected.draftId) : query.is('draft_revision_id', null)
  query = expected.publishedId ? query.eq('published_revision_id', expected.publishedId) : query.is('published_revision_id', null)
  const { data: updated, error: updateError } = await query.select('id').maybeSingle()
  if (updateError) throw new CmsError('Content could not be updated. Reload to check its status.', 503)
  if (!updated) throw new CmsError('Someone changed this page. Reload before continuing.', 409)
  // Immutable revisions and the current pointers remain authoritative even if
  // the auxiliary activity log is temporarily unavailable.
  const { error: logError } = await db.from('activity_log').insert({
    admin_id: user.id, action: action === 'save' ? 'Saved website page draft' : 'Published website page',
    entity_type: 'cms_page', entity_id: page.id, metadata: { revision_id: draftId },
  })
  if (logError) console.error('[cms/pages] activity log write failed', logError.code)
}

/** Restoring creates a new private draft; a previous live revision is never overwritten. */
export async function restorePageRevision(slug: string, revisionId: string, expected: SfiHead) {
  const { page, db } = await pageContext(slug, 'edit')
  if (!page || !sameHead(page, expected)) throw new CmsError('Someone changed this page. Reload before restoring.', 409)
  const { data, error } = await db.from('cms_page_revisions').select('body').eq('page_id', page.id).eq('id', revisionId).single()
  const content = data && parsePageBody(data.body)
  if (error || !content) throw new CmsError('This revision cannot be restored.', 404)
  await changePageContent(slug, 'save', content, expected)
}

import Link from 'next/link'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { kindSchema } from '@/lib/cms/entries/content'

const kinds = ['project', 'event', 'announcement', 'notification', 'faq'] as const

export async function StructuredSummary() {
  const { client } = await getRequestStaff()
  const [counts, recent] = await Promise.all([
    Promise.all(kinds.map(kind => client.from('cms_entries').select('id', { count: 'exact', head: true }).eq('kind', kind).eq('archived', false))),
    client.from('cms_entries').select('id,kind,slug,updated_at,draft_revision_id,published_revision_id').eq('archived', false).order('updated_at', { ascending: false }).limit(6),
  ])
  if (recent.error || counts.some(result => result.error)) return <p role="alert" className="rounded-xl border p-5 text-sm">The structured-content overview could not be loaded. Open the relevant content manager to retry.</p>
  const entries = (recent.data ?? []).filter(entry => kindSchema.safeParse(entry.kind).success)
  const revisionIds = entries.flatMap(entry => entry.draft_revision_id || entry.published_revision_id ? [entry.draft_revision_id || entry.published_revision_id] : [])
  const revisions = revisionIds.length
    ? await client.from('cms_entry_revisions').select('id,title:body->>title').in('id', revisionIds)
    : { data: [], error: null }
  if (revisions.error) return <p role="alert" className="rounded-xl border p-5 text-sm">Recent content titles could not be loaded. Please retry.</p>
  return <section aria-label="Structured content overview" className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{kinds.map((kind, index) => <Link key={kind} href={`/dashboard/website/content/${kind}`} className="rounded-xl border bg-card p-5"><h2 className="text-sm capitalize text-muted-foreground">{kind === 'faq' ? 'FAQs' : `${kind}s`}</h2><p className="mt-2 text-3xl font-semibold">{counts[index].count ?? 0}</p><p className="mt-2 text-xs text-muted-foreground">Accessible, non-archived records</p></Link>)}</div>
    <div className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Recently edited content</h2><Link href="/dashboard/website/drafts" className="text-sm underline">All content drafts</Link></div>
      <ul className="mt-3 divide-y">{entries.map(entry => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><Link href={`/dashboard/website/content/${entry.kind}/${entry.slug}`} className="text-sm font-medium underline">{revisions.data?.find(revision => revision.id === (entry.draft_revision_id || entry.published_revision_id))?.title || entry.slug.replace(/-/g, ' ')}</Link><p className="mt-1 text-xs capitalize text-muted-foreground">{entry.kind} · {entry.draft_revision_id ? entry.published_revision_id ? 'Live with draft changes' : 'Draft only' : entry.published_revision_id ? 'Published' : 'Unpublished'}</p></div><time className="text-xs text-muted-foreground" dateTime={entry.updated_at}>{new Date(entry.updated_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })}</time></li>)}</ul>
      {!entries.length && <p className="mt-3 text-sm text-muted-foreground">No structured content is available to this account.</p>}
    </div>
  </section>
}

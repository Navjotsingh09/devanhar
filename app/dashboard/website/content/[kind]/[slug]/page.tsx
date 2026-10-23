import {redirect,notFound} from 'next/navigation'
import {kindSchema,entrySlugSchema} from '@/lib/cms/entries/content'
import {getEntryState,EntryError} from '@/lib/cms/entries/server'
import {EntryEditor} from '@/components/cms/entry-editor'
export const dynamic='force-dynamic'
export default async function Editor({params}:{params:Promise<{kind:string;slug:string}>}){const{kind:rawKind,slug}=await params,kind=kindSchema.safeParse(rawKind);if(!kind.success||!entrySlugSchema.safeParse(slug).success)notFound();let initial;try{initial=await getEntryState(kind.data,slug)}catch(e){if(e instanceof EntryError&&e.status===401)redirect('/auth/login');return <p role="alert" className="rounded-xl border p-6">{e instanceof EntryError?e.message:'This editor could not be loaded.'}</p>}return <EntryEditor kind={kind.data} slug={slug} initial={initial}/>}

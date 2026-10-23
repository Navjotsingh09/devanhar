import {notFound,redirect} from 'next/navigation'
import {kindSchema} from '@/lib/cms/entries/content'
import {getEntryState,getPublishedEntries,EntryError} from '@/lib/cms/entries/server'
import {EntryDetail} from '@/components/cms/entry-detail'
export const dynamic='force-dynamic'
export const metadata={title:'Saved content preview',robots:{index:false,follow:false}}
export default async function Preview({params}:{params:Promise<{kind:string;slug:string}>}){const{kind:rawKind,slug}=await params,kind=kindSchema.safeParse(rawKind);if(!kind.success)notFound();let state;try{state=await getEntryState(kind.data,slug)}catch(e){if(e instanceof EntryError&&e.status===401)redirect('/auth/login');notFound()}const events=kind.data==='project'?await getPublishedEntries('event'):[];return <EntryDetail content={state.content} slug={slug} relatedEvents={(events??[]).filter(e=>e.projectId===state.entry?.id&&e.content.kind==='event').map(e=>({slug:e.slug,title:e.content.title,date:e.content.kind==='event'?e.content.dateLabel:''}))}/>}

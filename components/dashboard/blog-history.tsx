'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {toast} from 'sonner'
export type ArticleRevision={id:string;title:string;createdAt:string;isCurrentDraft:boolean}
export function BlogHistory({slug,revisions,expectedDraft,expectedUpdated,disabled}:{slug:string;revisions:ArticleRevision[];expectedDraft:string|null;expectedUpdated:string;disabled:boolean}){
 const router=useRouter(),[restoring,setRestoring]=useState<string|null>(null)
 async function restore(revision:ArticleRevision){
  if(!window.confirm(`Restore “${revision.title}” as a new draft? The live article will stay unchanged.`))return
  setRestoring(revision.id)
  try{
   const response=await fetch(`/api/blog/${slug}/history`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revisionId:revision.id,expectedDraft,expectedUpdated})})
   const result=await response.json()
   if(!response.ok)throw new Error(result.error||'The revision could not be restored.')
   toast.success('Revision restored as a draft. Preview it before publishing.')
   router.refresh()
  }catch(error){toast.error(error instanceof Error?error.message:'The revision could not be restored.')}
  finally{setRestoring(null)}
 }
 return <details className="rounded-xl border bg-card p-5"><summary className="cursor-pointer font-semibold">Article history <span className="font-normal text-muted-foreground">· latest {revisions.length} revisions</span></summary><p className="mt-3 text-sm text-muted-foreground">Restore an earlier version as a draft, then preview and publish when ready. Save any unsaved changes first.</p><ul className="mt-4 divide-y">{revisions.map(revision=><li key={revision.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{revision.title}{revision.isCurrentDraft?' · Current draft':''}</p><p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/London'}).format(new Date(revision.createdAt))} UK</p></div><Button variant="outline" disabled={disabled||!!restoring||revision.isCurrentDraft} onClick={()=>void restore(revision)}>{restoring===revision.id?'Restoring…':'Restore as draft'}</Button></li>)}</ul>{!revisions.length&&<p className="mt-4 text-sm text-muted-foreground">History appears after the first saved draft.</p>}</details>
}

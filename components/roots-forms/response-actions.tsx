'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, ArchiveRestore, Loader2, MoreHorizontal, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import type { ResponseAction, ResponseState } from '@/lib/roots-forms/response-actions'

export function ResponseActions({formId,responseId,name,state}:{formId:string;responseId:string;name:string;state:ResponseState}) {
  const router=useRouter(),[action,setAction]=useState<ResponseAction|null>(null),[pending,setPending]=useState(false),[error,setError]=useState('')
  async function confirm() {
    if(!action||pending)return
    setPending(true);setError('')
    try {
      const response=await fetch(`/api/roots-forms/${formId}/responses/${responseId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,expectedState:state})})
      const data=await response.json();if(!response.ok)throw new Error(data.error||'The response could not be updated.')
      setAction(null);router.refresh()
    }catch(e){setError(e instanceof Error?e.message:'The response could not be updated.')}finally{setPending(false)}
  }
  return <>
    <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border hover:bg-muted focus-visible:outline focus-visible:outline-2" aria-label={`More actions for ${name}`}><MoreHorizontal className="h-4 w-4" /></button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {state==='active'&&<DropdownMenuItem onSelect={()=>{setError('');setAction('archive')}}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>}
        {state!=='active'&&<DropdownMenuItem onSelect={()=>{setError('');setAction('restore')}}><ArchiveRestore className="mr-2 h-4 w-4" />Restore to active</DropdownMenuItem>}
        {state!=='deleted'&&<DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={()=>{setError('');setAction('delete')}}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialog open={action!==null} onOpenChange={open=>{if(!open&&!pending)setAction(null)}}><AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>{action==='delete'?'Delete this response?':action==='archive'?'Archive this response?':'Restore this response?'}</AlertDialogTitle><AlertDialogDescription>{name}. {action==='delete'?'It will move to Deleted, where you can restore it. Saved answers and payment history are retained.':action==='archive'?'It will move out of Active and into Archived. You can restore it later.':'It will return to the Active list.'}</AlertDialogDescription></AlertDialogHeader>
      {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <AlertDialogFooter><AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={pending} className={action==='delete'?'bg-red-700 text-white hover:bg-red-800':''} onClick={event=>{event.preventDefault();void confirm()}}>{pending&&<Loader2 className="mr-2 h-4 w-4 animate-spin" />}{pending?'Saving…':action==='delete'?'Move to Deleted':action==='archive'?'Archive response':'Restore response'}</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent></AlertDialog>
  </>
}

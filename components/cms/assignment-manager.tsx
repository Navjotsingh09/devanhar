'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveContentAssignment } from '@/app/dashboard/website/assignments/actions'
import { Button } from '@/components/ui/button'
interface Props { pages: {id:string;slug:string}[]; users: {id:string;full_name:string|null}[]; assignments: {page_id:string;user_id:string;can_view:boolean;can_edit:boolean;can_publish:boolean}[] }
export function AssignmentManager({pages,users,assignments}:Props) {
 const router=useRouter(); const [pending,startTransition]=useTransition(); const [message,setMessage]=useState(''); const [error,setError]=useState('')
 function change(input:Parameters<typeof saveContentAssignment>[0]) { setError('');setMessage('');startTransition(async()=>{try {const result=await saveContentAssignment(input);if(result.error)setError(result.error);else{setMessage('Content access updated.');router.refresh()}}catch{setError('Access could not be updated. Please retry.')}}) }
 return <div className="space-y-6">
  <form className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-2" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);change({pageId:data.get('page'),userId:data.get('user'),view:data.has('view'),edit:data.has('edit'),publish:data.has('publish')})}}>
   <label className="text-sm font-medium">Website page<select required name="page" className="mt-2 h-10 w-full rounded-md border bg-background px-3"><option value="">Choose a page</option>{pages.map(page=><option key={page.id} value={page.id}>{page.slug.toUpperCase()}</option>)}</select></label>
   <label className="text-sm font-medium">Content Manager<select required name="user" className="mt-2 h-10 w-full rounded-md border bg-background px-3"><option value="">Choose a person</option>{users.map(user=><option key={user.id} value={user.id}>{user.full_name || 'Unnamed Content Manager'}</option>)}</select></label>
   <fieldset className="flex flex-wrap gap-5 text-sm md:col-span-2"><legend className="mb-3 font-medium">Permissions</legend>{['view','edit','publish'].map(key=><label key={key} className="flex items-center gap-2 capitalize"><input type="checkbox" name={key} defaultChecked={key==='view'} />{key}</label>)}</fieldset>
   <Button type="submit" disabled={pending || !pages.length || !users.length} className="w-fit">{pending?'Saving…':'Save assignment'}</Button>
  </form>
  {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message&&<p role="status" className="text-sm text-green-700">{message}</p>}
  {!users.length&&<p className="text-sm text-muted-foreground">A Super Admin must first give the person the Content Manager role in User Management.</p>}
  {!pages.length&&<p className="text-sm text-muted-foreground">Save the first draft of a website page before assigning it.</p>}
  <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><caption className="sr-only">Current content assignments</caption><thead className="bg-muted"><tr>{['Person','Page','Permissions','Action'].map(text=><th key={text} className="px-4 py-3">{text}</th>)}</tr></thead><tbody>{assignments.map(row=><tr key={row.page_id+row.user_id} className="border-t"><td className="px-4 py-4">{users.find(user=>user.id===row.user_id)?.full_name || 'Content Manager'}</td><td className="px-4 py-4">{pages.find(page=>page.id===row.page_id)?.slug.toUpperCase() || 'Page'}</td><td className="px-4 py-4">{[row.can_view&&'View',row.can_edit&&'Edit',row.can_publish&&'Publish'].filter(Boolean).join(' · ')}</td><td className="px-4 py-4"><Button variant="outline" size="sm" disabled={pending} onClick={()=>{if(window.confirm('Remove this person’s access to this page?'))change({pageId:row.page_id,userId:row.user_id,view:false,edit:false,publish:false})}}>Remove access</Button></td></tr>)}{!assignments.length&&<tr><td colSpan={4} className="px-4 py-6 text-muted-foreground">No content assignments yet.</td></tr>}</tbody></table></div>
 </div>
}

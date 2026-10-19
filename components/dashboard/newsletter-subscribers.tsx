'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Search } from 'lucide-react'
type Subscriber = { id:string;email:string;created_at:string }
export function NewsletterSubscribers({subscribers}:{subscribers:Subscriber[]}) {
 const [query,setQuery] = useState('')
 const rows = subscribers.filter(row=>row.email.toLowerCase().includes(query.trim().toLowerCase()))
 function download() {
  const cell = (value:string) => '"' + (/^[=+@\\-]/.test(value) ? "'" + value : value).replace(/"/g,'""') + '"'
  const csv = ['Email,Subscribed',...rows.map(row=>[row.email,row.created_at].map(cell).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}))
  const link = document.createElement('a');link.href=url;link.download='devanhaar-monthly-newsletter.csv';link.click();URL.revokeObjectURL(url)
 }
 return <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <label className="flex items-center gap-2"><Search className="h-4 w-4" aria-hidden="true"/><Input aria-label="Search newsletter subscribers" placeholder="Search by email" value={query} onChange={event=>setQuery(event.target.value)}/></label>
  <Button variant="outline" onClick={download} disabled={!rows.length}><Download className="mr-2 h-4 w-4" aria-hidden="true"/>Export CSV</Button>
 </div><p className="text-sm text-muted-foreground">{rows.length} subscribers</p>
 <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-muted/50"><tr><th className="p-3">Email</th><th className="p-3">Subscribed</th></tr></thead><tbody>{rows.map(row=><tr className="border-t" key={row.id}><td className="p-3">{row.email}</td><td className="p-3">{new Date(row.created_at).toLocaleDateString('en-GB')}</td></tr>)}</tbody></table>{!rows.length ? <p className="p-6 text-muted-foreground">No subscribers match your search.</p> : null}</div></section>
}

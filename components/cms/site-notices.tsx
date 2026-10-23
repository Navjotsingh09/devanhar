'use client'
import {useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
import {X,Info,CheckCircle,TriangleAlert,Bell} from 'lucide-react'
import {isEntryVisible} from '@/lib/cms/entries/content'
import type {EntryContent} from '@/lib/cms/entries/content'
export type SiteNotice={id:string;revision:string;content:EntryContent}
export function SiteNotices({items,force=false}:{items:SiteNotice[];force?:boolean}){
 const pathname=usePathname(),[dismissed,setDismissed]=useState<string[]>([]),[now,setNow]=useState(()=>Date.now())
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(timer)},[])
 useEffect(()=>{try{setDismissed(items.filter(item=>sessionStorage.getItem(`notice:${item.id}:${item.revision}`)==='dismissed').map(item=>item.id))}catch{}},[items])
 if(!force&&['/dashboard','/auth','/cms-preview','/spa-admin'].some(path=>pathname.startsWith(path)))return null
 const visible=items.filter(item=>!dismissed.includes(item.id)&&(force||isEntryVisible(item.content,pathname,now)))
 if(!visible.length)return null
 return <aside aria-label="Website notices" className="fixed bottom-5 left-4 right-4 z-40 mx-auto max-w-3xl space-y-3 md:left-8 md:right-8">{visible.map(item=>{const c=item.content;if(c.kind!=='announcement'&&c.kind!=='notification')return null;const type=c.kind==='notification'?c.type:'information',Icon={information:Info,success:CheckCircle,warning:TriangleAlert,important:Bell}[type];return <div key={item.id} className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${type==='warning'?'border-amber-300 bg-amber-50 text-amber-950':type==='important'?'border-red-300 bg-red-50 text-red-950':type==='success'?'border-emerald-300 bg-emerald-50 text-emerald-950':'border-slate-700 bg-slate-950 text-white'}`}><Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0"/><div className="min-w-0 flex-1"><p className="font-semibold">{c.title}</p><p className="mt-1 text-sm">{c.message}</p>{c.kind==='announcement'&&c.buttonUrl&&<Link href={c.buttonUrl} className="mt-2 inline-block text-sm font-semibold underline">{c.buttonLabel||'Find out more'} →</Link>}</div>{(c.kind==='announcement'||c.dismissible)&&<button type="button" aria-label={`Dismiss ${c.title}`} onClick={()=>{setDismissed(prev=>[...prev,item.id]);try{sessionStorage.setItem(`notice:${item.id}:${item.revision}`,'dismissed')}catch{}}} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4"/></button>}</div>})}</aside>
}

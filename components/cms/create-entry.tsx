'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
export function CreateEntry({kind}:{kind:string}){const[slug,setSlug]=useState(''),router=useRouter();return <form id="new-content" className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-5" onSubmit={e=>{e.preventDefault();if(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))router.push(`/dashboard/website/content/${kind}/${slug}`)}}><label className="space-y-2 text-sm font-medium"><span className="block">New {kind} address</span><Input required value={slug} onChange={e=>setSlug(e.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} placeholder="summer-community-day"/></label><Button type="submit">Create {kind}</Button><p className="w-full text-xs text-muted-foreground">Use lowercase letters, numbers and hyphens. Content stays private until published.</p></form>}

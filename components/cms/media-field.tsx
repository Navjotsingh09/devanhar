"use client"
import {useState} from 'react'
import {Dialog,DialogContent,DialogTitle} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {MediaLibrary} from './media-library'
export function MediaField({label,value,onChange,kind}:{label:string;value:string;onChange:(value:string)=>void;kind?:string}){const[open,setOpen]=useState(false);return <div className="space-y-2"><label className="block space-y-2 text-sm font-medium"><span>{label}</span><Input value={value} onChange={e=>onChange(e.target.value)}/></label><Button type="button" variant="outline" size="sm" onClick={()=>setOpen(true)}>Choose from media library</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto"><DialogTitle>Choose a media file</DialogTitle><MediaLibrary kinds={[kind||'image']} onSelect={asset=>{onChange(asset.url);setOpen(false)}}/></DialogContent></Dialog></div>}

'use client'
import {createContext,useContext} from 'react'
import {usePathname} from 'next/navigation'
import type {EntryContent} from '@/lib/cms/entries/content'
const FaqContext=createContext<EntryContent[]>([])
export function SiteContentProvider({faqs,children}:{faqs:EntryContent[];children:React.ReactNode}){return <FaqContext.Provider value={faqs}>{children}</FaqContext.Provider>}
export function useSiteFaqs(local:{question:string;answer:string}[]){const pathname=usePathname(),faqs=useContext(FaqContext),items=new Map(local.map(faq=>[faq.question,faq]));for(const faq of (['/dashboard','/auth','/cms-preview','/spa-admin'].some(path=>pathname.startsWith(path))?[]:faqs))if(faq.kind==='faq'&&faq.visible&&(!faq.pages.length||faq.pages.includes(pathname)))items.set(faq.question,{question:faq.question,answer:faq.answer});return[...items.values()]}

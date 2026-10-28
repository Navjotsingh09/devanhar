"use client"
import {createContext,useContext} from 'react'
import type {PageCopy} from '@/lib/cms/copy-schema'
const Additions=createContext<React.ReactNode>(null)
export function useNativePageSections(){return useContext(Additions)}
const Context=createContext<PageCopy>({})
export function PageCopyProvider({copy,children,additions=null}:{copy:PageCopy;children:React.ReactNode;additions?:React.ReactNode}){return <Context.Provider value={copy}><Additions.Provider value={additions}>{children}</Additions.Provider></Context.Provider>}
export function usePageCopy(){return useContext(Context)}

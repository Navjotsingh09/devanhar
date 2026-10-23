"use client"
import {createContext,useContext} from 'react'
import type {PageCopy} from '@/lib/cms/copy-schema'
const Context=createContext<PageCopy>({})
export function PageCopyProvider({copy,children}:{copy:PageCopy;children:React.ReactNode}){return <Context.Provider value={copy}>{children}</Context.Provider>}
export function usePageCopy(){return useContext(Context)}

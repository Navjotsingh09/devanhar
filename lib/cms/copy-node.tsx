import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type {PageCopy} from './copy-schema'
const components=new WeakSet<object>()
export function registerCopyComponent(component:object){components.add(component)}
/** Replace approved copy in the React tree, preserving components, event handlers,
 * form values, classes, styles and element keys. There is no DOM mutation or HTML injection. */
export function applyPageCopy<T>(node:T,copy:PageCopy):T {
 if(!Object.keys(copy).length)return node
 function transform(value:unknown):unknown{
  if(typeof value==='string')return copy[value.replace(/\s+/g,' ').trim()]??value
  if(Array.isArray(value))return value.map(transform)
  if(React.isValidElement<Record<string,unknown>>(value)){
   const props:Record<string,unknown>={}
   if('children' in value.props)props.children=transform(value.props.children)
   // Data props stay original until their owning component renders. This avoids
   // applying the same replacement twice across nested components.
   if(typeof value.type==='string'||value.type===Link||value.type===Image)for(const key of ['href','src','alt','title','aria-label','placeholder'])if(typeof value.props[key]==='string')props[key]=transform(value.props[key])
   if(value.type===Image&&String(props.src??value.props.src).startsWith('/media/file/'))props.unoptimized=true
   if((typeof value.type==='function'||typeof value.type==='object')&&components.has(value.type as object))props.cmsCopy=copy
   return React.cloneElement(value,props)
  }
  return value
 }
 return transform(node) as T
}

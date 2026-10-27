import type {PageContent,PageSection} from './page-content'
import {z} from 'zod'
import {assetSchema} from './site-settings'
import {isSafeContentLink} from './sfi-content'
export const nativeSectionSchema=z.object({id:z.string().regex(/^[a-f0-9]{16}$/),group:z.string().regex(/^[a-f0-9]{16}$/),label:z.string().max(200),locked:z.boolean(),hidden:z.boolean()}).strict()
export type NativeSection=z.infer<typeof nativeSectionSchema>
export const pageCopySchema=z.object({fields:z.array(z.object({key:z.string().regex(/^[a-f0-9]{16}$/),kind:z.enum(['text','link','asset']),source:z.string().min(1).max(10000),value:z.string().max(10000)}).strict().superRefine((field,ctx)=>{if(field.value===field.source)return;if(field.kind==='asset'&&!assetSchema.safeParse(field.value).success)ctx.addIssue({code:'custom',path:['value'],message:'Choose a website asset or an uploaded media URL'});if(field.kind==='link'&&!isSafeContentLink(field.value)&&!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$|^tel:\+?[0-9 ()-]{7,25}$/.test(field.value))ctx.addIssue({code:'custom',path:['value'],message:'Use a website link, HTTPS URL, email or telephone link'})})).max(3000),nativeSections:z.array(nativeSectionSchema).max(500).default([])}).strict()
export type PageCopyEnvelope={__cms:true;replacements:Record<string,string>;nativeSections:NativeSection[];additions:PageSection[]}
export type PageCopy=Record<string,string>|PageCopyEnvelope
export function isPageCopyEnvelope(copy:PageCopy):copy is PageCopyEnvelope{return copy.__cms===true}
export function pageContentCopy(content:PageContent):PageCopy{const section=content.sections.find(s=>s.type==='pageCopy');if(section?.type!=='pageCopy')return{};const replacements=copyValues(section.data.fields),nativeSections=section.data.nativeSections??[],additions=content.sections.filter(s=>s.type!=='pageCopy'&&s.type!=='siteSettings'&&!s.hidden);return nativeSections.length||additions.length?{__cms:true,replacements:replacements as Record<string,string>,nativeSections,additions}:replacements}
export function copyValues(fields:{source:string;value:string}[]):PageCopy{return Object.fromEntries(fields.filter(f=>f.source!==f.value).map(f=>[f.source.replace(/\s+/g,' ').trim(),f.value]))}

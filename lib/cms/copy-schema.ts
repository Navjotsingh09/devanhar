import {z} from 'zod'
import {assetSchema} from './site-settings'
import {isSafeContentLink} from './sfi-content'
export const pageCopySchema=z.object({fields:z.array(z.object({key:z.string().regex(/^[a-f0-9]{16}$/),kind:z.enum(['text','link','asset']),source:z.string().min(1).max(10000),value:z.string().max(10000)}).strict().superRefine((field,ctx)=>{if(field.value===field.source)return;if(field.kind==='asset'&&!assetSchema.safeParse(field.value).success)ctx.addIssue({code:'custom',path:['value'],message:'Choose a website asset or an uploaded media URL'});if(field.kind==='link'&&!isSafeContentLink(field.value)&&!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$|^tel:\+?[0-9 ()-]{7,25}$/.test(field.value))ctx.addIssue({code:'custom',path:['value'],message:'Use a website link, HTTPS URL, email or telephone link'})})).max(3000)}).strict()
export type PageCopy=Record<string,string>
export function copyValues(fields:{source:string;value:string}[]):PageCopy{return Object.fromEntries(fields.filter(f=>f.source!==f.value).map(f=>[f.source.replace(/\s+/g,' ').trim(),f.value]))}

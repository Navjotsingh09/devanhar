import { z } from 'zod'

export const fieldTypes = ['text','textarea','email','tel','date','number','select','radio','checkbox','repeat'] as const
const id = z.string().regex(/^[a-z][a-z0-9_]{1,48}$/).refine(v => !['constructor','prototype','__proto__'].includes(v))
const child = z.object({ id, label:z.string().trim().min(1).max(160), type:z.enum(['text','email','tel']), required:z.boolean().default(false) })
const safeUrl = z.string().max(1500).refine(v => !v || (() => { try { const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password } catch{return false} })(), 'Use a public HTTPS document link')
export const fieldSchema = z.object({ id, label:z.string().trim().min(1).max(200), type:z.enum(fieldTypes), required:z.boolean().default(false), help:z.string().max(700).default(''), options:z.array(z.string().trim().min(1).max(100)).max(40).default([]), documentUrl:safeUrl.default(''), needsDocument:z.boolean().default(false), pastOnly:z.boolean().default(false), condition:z.object({ field:id, equals:z.string().max(100) }).optional(), children:z.array(child).max(8).default([]) })
export const formSchema = z.object({ title:z.string().trim().min(1).max(160), description:z.string().max(2000).default(''), fields:z.array(fieldSchema).min(1).max(60), payment:z.object({ enabled:z.boolean(), amountPence:z.number().int().min(0).max(1000000), currency:z.literal('gbp') }), confirmation:z.string().max(1000).default('Thank you. Your submission has been received.') }).superRefine((s,c)=>{
  const seen=new Set<string>()
  s.fields.forEach((f,i)=>{
    if(seen.has(f.id)) c.addIssue({code:'custom',message:'Question identifiers must be unique',path:['fields',i,'id']})
    if(f.condition && !seen.has(f.condition.field)) c.addIssue({code:'custom',message:'A condition must refer to an earlier question',path:['fields',i,'condition']})
    if(f.condition){const parent=s.fields.slice(0,i).find(p=>p.id===f.condition!.field);if(parent&&(!['checkbox','radio','select'].includes(parent.type)||!(parent.type==='checkbox'?['true','false']:parent.options).includes(f.condition.equals)))c.addIssue({code:'custom',message:'Choose a valid answer for the condition',path:['fields',i,'condition']})}
    seen.add(f.id)
    if(['select','radio'].includes(f.type)&&(!f.options.length||new Set(f.options).size!==f.options.length)) c.addIssue({code:'custom',message:'Choices must be present and unique',path:['fields',i,'options']})
    if(f.type==='repeat'&&(!f.children.length||new Set(f.children.map(x=>x.id)).size!==f.children.length)) c.addIssue({code:'custom',message:'Repeated rows need unique subquestions',path:['fields',i,'children']})
  })
  if(s.payment.enabled&&s.payment.amountPence<30) c.addIssue({code:'custom',message:'Set a payment of at least £0.30',path:['payment']})
})
export type FormDefinition=z.infer<typeof formSchema>
export type FormField=FormDefinition['fields'][number]
export function visible(field:FormField,answers:Record<string,unknown>,fields:FormField[]=[]):boolean {if(!field.condition)return true;const parent=fields.find(f=>f.id===field.condition!.field);if(parent&&!visible(parent,answers,fields))return false;return String(answers[field.condition.field]??(parent?.type==='checkbox'?false:''))===field.condition.equals}
export function validateAnswers(schema:FormDefinition,input:unknown){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Please complete the form.')
  const raw=input as Record<string,unknown>, answers:Record<string,unknown>={}
  const text=(v:unknown,label:string,required:boolean,type:string,pastOnly=false)=>{
    if(typeof v!=='string'&&typeof v!=='number'&&v!=null)throw new Error(`Check ${label}.`)
    const s=String(v??'').trim();if(required&&!s)throw new Error(`Complete ${label}.`);if(s.length>4000)throw new Error(`${label} is too long.`)
    if(s&&type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))throw new Error(`Enter a valid email for ${label}.`)
    if(s&&type==='number'&&(!Number.isFinite(Number(s))||Math.abs(Number(s))>1000000))throw new Error(`Enter a valid number for ${label}.`)
    if(s&&type==='date'){const date=new Date(s+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==s||(pastOnly&&s>new Date().toISOString().slice(0,10)))throw new Error(`Enter a valid date for ${label}.`)}
    return s
  }
  for(const f of schema.fields){if(!visible(f,answers,schema.fields))continue
    const v=Object.hasOwn(raw,f.id)?raw[f.id]:undefined
    if(f.type==='checkbox'){if(f.required&&v!==true)throw new Error(`Please confirm ${f.label}.`);answers[f.id]=v===true}
    else if(f.type==='repeat'){
      if(v!=null&&!Array.isArray(v))throw new Error(`Check ${f.label}.`)
      const rows=(v||[]) as unknown[];if(rows.length>10||(f.required&&!rows.length))throw new Error(`Check ${f.label} (up to 10 rows).`)
      answers[f.id]=rows.map((r,i)=>{if(!r||typeof r!=='object'||Array.isArray(r))throw new Error(`Check ${f.label}.`);return Object.fromEntries(f.children.map(ch=>[ch.id,text((r as Record<string,unknown>)[ch.id],`${f.label}, row ${i+1}: ${ch.label}`,ch.required,ch.type)]))})
    }else{const value=text(v,f.label,f.required,f.type,f.pastOnly);if(value&&['radio','select'].includes(f.type)&&!f.options.includes(value))throw new Error(`Choose an option for ${f.label}.`);answers[f.id]=value}
  }
  return answers
}
export function publishable(schema:FormDefinition){if(schema.fields.some(f=>f.needsDocument&&!f.documentUrl))throw new Error('Attach the required PDF documents before publishing.')}
export function validSlug(value:string){return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)&&value.length>=3&&value.length<=80}
export function formSummary(schema:FormDefinition,answers:Record<string,unknown>){
  const email=schema.fields.find(f=>f.type==='email'&&typeof answers[f.id]==='string')
  const name=schema.fields.find(f=>f.type==='text'&&/name/i.test(f.label)&&typeof answers[f.id]==='string')
  return {name:name?String(answers[name.id]).slice(0,160):'Submission',email:email?String(answers[email.id]).slice(0,254):null}
}

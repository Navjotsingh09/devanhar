import {z} from 'zod'
import {isSafeContentLink} from '../sfi-content'
const title=z.string().trim().min(1).max(240),text=z.string().trim().max(10000)
const link=z.string().max(2000).refine(v=>!v||isSafeContentLink(v),'Use a website path or HTTPS URL')
const cover=link.refine(v=>!!v,'Choose a cover image')
const date=z.string().refine(v=>!v||/T.*(Z|[+-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v)),'Choose a valid date and time')
const faq=z.object({question:title,answer:z.string().trim().min(1).max(10000)}).strict()
const seo=z.object({title:text.max(160),description:text.max(320),socialTitle:text.max(160),socialDescription:text.max(320),socialImage:link,noIndex:z.boolean()}).strict()
const priority=z.number().int().min(0).max(10000),pages=z.array(z.string().regex(/^\/(?!\/)[^\s\\]*$/)).max(100)
export const projectSchema=z.object({kind:z.literal('project'),title,seo,description:text,category:text.max(160),lead:text.max(160),audience:text.max(500),location:text.max(500),logo:link,image:cover,imageAlt:text.max(500),websitePath:link,colour:z.string().regex(/^#[0-9a-fA-F]{6}$/),socialLinks:z.array(z.object({label:title,href:link}).strict()).max(12),gallery:z.array(z.object({image:cover,imageAlt:title}).strict()).max(40),faqs:z.array(faq).max(40),comingSoon:z.boolean(),priority}).strict()
export const eventSchema=z.object({kind:z.literal('event'),title,seo,description:text,category:text.max(160),dateLabel:text.max(240),startAt:date,endAt:date,location:text.max(500),image:cover,imageAlt:text.max(500),registrationUrl:link,capacity:z.number().int().min(0).max(1000000),ageRequirements:text.max(500),priceLabel:text.max(240),status:z.enum(['upcoming','registration_open','sold_out','completed','cancelled']),comingSoon:z.boolean(),publishAt:date,unpublishAt:date,priority}).strict().refine(v=>!v.startAt||!v.endAt||Date.parse(v.endAt)>=Date.parse(v.startAt),'Event end must follow its start').refine(v=>!v.publishAt||!v.unpublishAt||Date.parse(v.unpublishAt)>Date.parse(v.publishAt),'Visibility end must follow its start')
export const announcementSchema=z.object({kind:z.literal('announcement'),title,message:title,buttonLabel:text.max(160),buttonUrl:link,priority,startAt:date,endAt:date,active:z.boolean(),pages}).strict().refine(v=>!v.startAt||!v.endAt||Date.parse(v.endAt)>Date.parse(v.startAt),'End must follow start')
export const notificationSchema=z.object({kind:z.literal('notification'),title,message:z.string().trim().min(1).max(2000),type:z.enum(['information','success','warning','important']),startAt:date,endAt:date,dismissible:z.boolean(),active:z.boolean(),pages}).strict().refine(v=>!v.startAt||!v.endAt||Date.parse(v.endAt)>Date.parse(v.startAt),'End must follow start')
export const faqSchema=z.object({kind:z.literal('faq'),title,question:title,answer:z.string().trim().min(1).max(10000),category:text.max(160),pages,priority,visible:z.boolean()}).strict()
export const entrySchemas={project:projectSchema,event:eventSchema,announcement:announcementSchema,notification:notificationSchema,faq:faqSchema}
export const kindSchema=z.enum(['project','event','announcement','notification','faq'])
export const entrySlugSchema=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120)
export type EntryKind=keyof typeof entrySchemas
export type EntryContent=z.infer<(typeof entrySchemas)[EntryKind]>
export type ProjectContent=z.infer<typeof projectSchema>
export type EventContent=z.infer<typeof eventSchema>
const defaultSeo={title:'',description:'',socialTitle:'',socialDescription:'',socialImage:'',noIndex:false}
export function entryTemplate(kind:EntryKind):EntryContent{
 const title='New '+kind
 if(kind==='project')return{kind,title,seo:defaultSeo,description:'',category:'Community',lead:'',audience:'',location:'',logo:'',image:'/hero-slide-1.jpg',imageAlt:'Devanhaar community',websitePath:'',colour:'#b8860b',socialLinks:[],gallery:[],faqs:[],comingSoon:false,priority:100}
 if(kind==='event')return{kind,title,seo:defaultSeo,description:'',category:'Community',dateLabel:'Coming soon',startAt:'',endAt:'',location:'',image:'/hero-slide-1.jpg',imageAlt:'Devanhaar community',registrationUrl:'',capacity:0,ageRequirements:'',priceLabel:'',status:'upcoming',comingSoon:true,publishAt:'',unpublishAt:'',priority:100}
 if(kind==='announcement')return{kind,title,message:'New announcement',buttonLabel:'Find out more',buttonUrl:'/contact',priority:100,startAt:'',endAt:'',active:false,pages:[]}
 if(kind==='notification')return{kind,title,message:'New notification',type:'information',startAt:'',endAt:'',dismissible:true,active:false,pages:[]}
 return{kind,title,question:'New question',answer:'Add the answer.',category:'General',pages:[],priority:100,visible:true}
}
export function parseEntry(kind:EntryKind,body:unknown):EntryContent|null{const result=entrySchemas[kind].safeParse(body);return result.success?result.data:null}
export function isInWindow(start:string,end:string,now=Date.now()){return(!start||Date.parse(start)<=now)&&(!end||Date.parse(end)>now)}
export function isEntryVisible(content:EntryContent,path?:string,now=Date.now()){
 if(content.kind==='event')return isInWindow(content.publishAt,content.unpublishAt,now)
 if(content.kind==='announcement'||content.kind==='notification')return content.active&&isInWindow(content.startAt,content.endAt,now)&&(!path||!content.pages.length||content.pages.includes(path))
 if(content.kind==='faq')return content.visible&&(!path||!content.pages.length||content.pages.includes(path))
 return true
}
export function entryPublicPath(kind:EntryKind,slug:string){return kind==='project'?`/projects/${slug}`:kind==='event'?`/events/info/${slug}`:'/'}

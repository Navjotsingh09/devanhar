import {z} from 'zod'
export const mediaTypes = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','video/mp4':'mp4','video/webm':'webm','application/pdf':'pdf'} as const
export const mediaMetadata=z.object({label:z.string().trim().min(1).max(200),alt_text:z.string().trim().max(500),category:z.string().trim().max(80).regex(/^[a-z0-9-]*$/)}).strict()
export const mediaStart=mediaMetadata.extend({mime:z.enum(Object.keys(mediaTypes) as [keyof typeof mediaTypes,...(keyof typeof mediaTypes)[]]),size:z.number().int().positive().max(50*1024*1024)})
export function mediaKind(url:string){return /\.(mp4|webm)(?:$|\?)/i.test(url)?'video':/\.pdf(?:$|\?)/i.test(url)?'document':'image'}
export type MediaAsset={id:string;url:string;storage_path:string;section:string;category:string|null;label:string|null;alt_text:string|null;archived_at:string|null;updated_at:string;uploaded_by:string|null}

import {z} from 'zod'
import {isSafeContentLink,isSafeAssetLink} from './cms/sfi-content'
const text=z.string().trim(),link=text.max(2000).refine(v=>!v||isSafeContentLink(v),'Use a website path or HTTPS URL')
export const articleMetadataSchema=z.object({projectId:z.string().uuid().nullable().default(null),subtitle:text.max(500).default(''),category:text.max(160).default(''),seoTitle:text.max(160).default(''),seoDescription:text.max(320).default(''),socialTitle:text.max(160).default(''),socialDescription:text.max(320).default(''),socialImage:text.max(2000).refine(v=>!v||isSafeAssetLink(v),'Choose a website image').default(''),noIndex:z.boolean().default(false),featured:z.boolean().default(false),relatedLinks:z.array(z.object({label:text.min(1).max(160),href:link.refine(v=>v.startsWith('/')&&!v.startsWith('//'),'Choose a page on this website')}).strict()).max(12).default([])}).strict()
export type ArticleMetadata=z.infer<typeof articleMetadataSchema>
export const defaultArticleMetadata=articleMetadataSchema.parse({})
export function parseArticleMetadata(raw:unknown):ArticleMetadata{const value=articleMetadataSchema.safeParse(raw);return value.success?value.data:defaultArticleMetadata}

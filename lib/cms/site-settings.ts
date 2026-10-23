import { z } from 'zod'
import defaults from './site-settings-default.json'
import { isSafeContentLink,isSafeAssetLink } from './sfi-content'
const text = z.string().trim().min(1).max(500)
const link = z.string().max(2000).refine(isSafeContentLink, 'Use a website path or HTTPS URL')
export const assetSchema = z.string().max(2000).refine(isSafeAssetLink, 'Choose a website asset or an uploaded media URL')
const colour=z.string().regex(/^#[0-9a-fA-F]{6}$/)
const design=z.object({primary:colour,secondary:colour,accent:colour,background:colour,text:colour,mutedBackground:colour,mutedText:colour,font:z.enum(['System','Inter','Georgia']),buttonStyle:z.enum(['pill','rounded','square']),borderRadius:z.number().int().min(0).max(48)}).strict()
const item = z.object({label:text,href:link}).strict()
export const siteSettingsSchema = z.object({
 brand:z.object({favicon:assetSchema.default(defaults.brand.favicon),design:design.default(defaults.brand.design as z.infer<typeof design>),name:text,darkLogo:assetSchema,lightLogo:assetSchema,accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),contactEmail:z.string().email().max(254),address:text,charityNumber:text}).strict(),
 navigation:z.object({
  links:z.array(item.extend({children:z.array(item.extend({description:text.optional()})).max(20).optional()})).min(1).max(12),
  projects:z.array(z.object({title:text,description:text,image:assetSchema,href:link,tag:text}).strict()).min(1).max(30),
  comingSoon:z.array(z.object({title:text,href:link}).strict()).max(30),
 }).strict(),
 defaultSeo:z.object({title:text,description:text,socialTitle:z.string().max(240),socialDescription:z.string().max(500),socialImage:z.union([z.literal(''),assetSchema])}).strict().default(defaults.defaultSeo),
 footer:z.object({navigate:z.array(item).max(20),projects:z.array(item).max(20),social:z.array(item).max(12)}).strict(),
}).strict()
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export const defaultSiteSettings = siteSettingsSchema.parse(defaults)
export const defaultSettingsPage = {schemaVersion:1 as const,visibility:'public' as const,title:'Navigation & branding',seo:{title:'Navigation & branding',description:'Shared navigation, branding, contact details and footer links.',socialTitle:'',socialDescription:'',socialImage:'',noIndex:true},sections:[{id:'site-settings',type:'siteSettings' as const,hidden:false,data:defaultSiteSettings}]}

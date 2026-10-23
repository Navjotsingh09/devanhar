import { z } from 'zod'
import defaults from './site-settings-default.json'
import { isSafeContentLink,isSafeAssetLink } from './sfi-content'
const text = z.string().trim().min(1).max(500)
const link = z.string().max(2000).refine(isSafeContentLink, 'Use a website path or HTTPS URL')
export const assetSchema = z.string().max(2000).refine(isSafeAssetLink, 'Choose a website asset or an uploaded media URL')
const item = z.object({label:text,href:link}).strict()
export const siteSettingsSchema = z.object({
 brand:z.object({name:text,darkLogo:assetSchema,lightLogo:assetSchema,accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),contactEmail:z.string().email().max(254),address:text,charityNumber:text}).strict(),
 navigation:z.object({
  links:z.array(item.extend({children:z.array(item.extend({description:text.optional()})).max(20).optional()})).min(1).max(12),
  projects:z.array(z.object({title:text,description:text,image:assetSchema,href:link,tag:text}).strict()).min(1).max(30),
  comingSoon:z.array(z.object({title:text,href:link}).strict()).max(30),
 }).strict(),
 footer:z.object({navigate:z.array(item).max(20),projects:z.array(item).max(20),social:z.array(item).max(12)}).strict(),
}).strict()
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export const defaultSiteSettings = siteSettingsSchema.parse(defaults)
export const defaultSettingsPage = {schemaVersion:1 as const,title:'Navigation & branding',seo:{title:'Navigation & branding',description:'Shared navigation, branding, contact details and footer links.',noIndex:true},sections:[{id:'site-settings',type:'siteSettings' as const,hidden:false,data:defaultSiteSettings}]}

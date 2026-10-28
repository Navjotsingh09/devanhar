import type { Metadata } from 'next'
import { z } from 'zod'
import { isSafeAssetLink } from './content-links'

export const pageSeoSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(320),
  noIndex: z.boolean(),
  socialTitle: z.string().trim().max(160).optional(),
  socialDescription: z.string().trim().max(320).optional(),
  socialImage: z.string().max(2000).refine(value => !value || isSafeAssetLink(value), 'Choose a website image or an uploaded media URL').optional(),
}).strict()

export type PageSeo = z.infer<typeof pageSeoSchema>

export function pageMetadata(seo: PageSeo, fallback: Metadata = {}): Metadata {
  const title = seo.socialTitle || seo.title
  const description = seo.socialDescription || seo.description
  const images = seo.socialImage ? [seo.socialImage] : undefined
  return {
    ...fallback,
    title: seo.title,
    description: seo.description,
    robots: { index: !seo.noIndex, follow: !seo.noIndex },
    openGraph: { ...fallback.openGraph, title, description, ...(images ? { images } : {}) },
    twitter: { ...fallback.twitter, title, description, ...(images ? { card: 'summary_large_image', images } : {}) },
  }
}

import {z} from 'zod'
export const subscriberEmail=z.string().trim().toLowerCase().max(254).email().refine(value=>value.split('@')[1]?.includes('.'),'Enter a complete email address')
export const subscribeSchema=z.object({email:subscriberEmail,name:z.string().trim().max(200).optional(),consent:z.literal(true),website:z.string().max(0).optional()}).strict()

import {z} from 'zod'
export const enquiryWorkflowSchema=z.object({id:z.string().uuid(),status:z.enum(['new','in_progress','resolved']),assignedTo:z.string().uuid().nullable(),notes:z.string().trim().max(10000),expectedUpdated:z.string().datetime()}).strict()

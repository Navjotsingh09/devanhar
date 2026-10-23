'use server'
import {z} from 'zod'
import {entrySession} from '@/lib/cms/entries/server'
import {revalidatePath} from 'next/cache'
const schema=z.object({entryId:z.string().uuid(),userId:z.string().uuid(),view:z.boolean(),edit:z.boolean(),create:z.boolean(),publish:z.boolean()}).refine(v=>(!v.edit||v.view)&&(!v.create||v.edit)&&(!v.publish||v.edit),'Edit requires View; Create and Publish require Edit.')
export async function saveEntryAssignment(input:unknown){const result=schema.safeParse(input);if(!result.success)return{error:result.error.issues[0].message};const{client,isAdmin}=await entrySession();if(!isAdmin)return{error:'Administrator permission required.'};const v=result.data,{error}=await client.rpc('cms_assign_entry',{p_entry:v.entryId,p_user:v.userId,p_view:v.view,p_edit:v.edit,p_create:v.create,p_publish:v.publish});if(error)return{error:'Assignment could not be saved. Check the person and permissions.'};revalidatePath('/dashboard/website/assignments');return{success:true}}

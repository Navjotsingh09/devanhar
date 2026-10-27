'use server'
import {z} from 'zod'
import {getRequestStaff} from '@/lib/crm/request-staff'
import {revalidatePath} from 'next/cache'
const schema=z.object({postId:z.string().uuid(),userId:z.string().uuid(),view:z.boolean(),edit:z.boolean(),publish:z.boolean()}).strict()
export async function saveArticleAssignment(raw:unknown){const parsed=schema.safeParse(raw);if(!parsed.success)return{error:'Choose an article and Content Manager.'};const value=parsed.data;if(value.edit&&!value.view||value.publish&&!value.edit)return{error:'Edit requires View; Publish also requires Edit.'};const{client,user,authError,profile,grants}=await getRequestStaff();if(authError||!user||profile.error||grants.error||!Array.isArray(grants.data)||!['admin','super_admin'].includes(profile.data?.role||''))return{error:'Administrator access is required.'};const{error}=await client.rpc('blog_assign_post',{p_post:value.postId,p_user:value.userId,p_view:value.view,p_edit:value.edit,p_publish:value.publish});if(error)return{error:'Article access could not be saved. Verify the delegation migration is installed.'};revalidatePath('/dashboard/website/assignments');revalidatePath('/dashboard/blog');return{success:true}}

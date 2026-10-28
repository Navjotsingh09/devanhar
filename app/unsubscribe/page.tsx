import {Unsubscribe} from '@/components/newsletter-unsubscribe'
import {Navbar} from '@/components/navbar'
import {FooterSection} from '@/components/footer-section'
export const metadata={title:'Newsletter preferences | Devanhaar',robots:{index:false,follow:false}}
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const{token}=await searchParams;return <><Navbar/><main className="px-6 pb-20 pt-36"><Unsubscribe token={typeof token==='string'?token.slice(0,1001):''}/></main><FooterSection hideContact/></>}

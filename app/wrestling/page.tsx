import type {Metadata} from 'next'
import {WrestlingPage} from '@/components/wrestling/wrestling-page'
export const metadata:Metadata={
 title:'Devanhaar Wrestling Academy | Freestyle Wrestling & Sikh Heritage',
 description:'A community-led freestyle wrestling academy carrying forward Sikh and Punjabi wrestling heritage through discipline, wellbeing and connection within the sangat.',
 alternates:{canonical:'https://devanhaar.com/wrestling'},
 openGraph:{title:'Devanhaar Wrestling Academy',description:'Strength in our roots. Freestyle wrestling, Sikh heritage and community.',url:'https://devanhaar.com/wrestling',type:'website'},
}
export default function Page(){return <WrestlingPage/>}

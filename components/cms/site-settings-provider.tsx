"use client"
import {createContext,useContext} from 'react'
import {usePathname} from 'next/navigation'
import {defaultSiteSettings,type SiteSettings} from '@/lib/cms/site-settings'
import './site-theme.css'
const Context=createContext<SiteSettings>(defaultSiteSettings)
export function SiteSettingsProvider({settings,children}:{settings:SiteSettings;children:React.ReactNode}) {
 const pathname=usePathname(),preview=pathname==='/cms-preview/pages/site-settings',publicPage=preview||!['/dashboard','/auth','/spa-admin','/cms-preview'].some(p=>pathname.startsWith(p)),design=settings.brand.design,original=defaultSiteSettings.brand.design,style:Record<string,string>={display:'contents'}
 if(publicPage){const variables={primary:'primary',secondary:'secondary',accent:'accent',background:'background',text:'foreground',mutedBackground:'muted',mutedText:'muted-foreground'} as const;for(const[key,variable]of Object.entries(variables))if(design[key as keyof typeof variables]!==original[key as keyof typeof variables])style['--'+variable]=hexHsl(design[key as keyof typeof variables]);if(settings.brand.accent!==defaultSiteSettings.brand.accent)style['--primary']=hexHsl(settings.brand.accent);if(design.font!=='System')style.fontFamily=design.font==='Inter'?'var(--font-inter), sans-serif':'Georgia, serif';style['--cms-radius']=design.borderRadius+'px';style['--cms-button-radius']=design.buttonStyle==='pill'?'9999px':design.buttonStyle==='rounded'?design.borderRadius+'px':'0px'}
 return <Context.Provider value={settings}><div className={publicPage?'cms-public-theme':undefined} data-custom-radius={publicPage&&design.borderRadius!==original.borderRadius?'true':undefined} data-custom-buttons={publicPage&&design.buttonStyle!==original.buttonStyle?'true':undefined} style={style as React.CSSProperties}>{children}</div></Context.Provider>
}
function hexHsl(hex:string){const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...values),min=Math.min(...values),d=max-min,l=(max+min)/2;let h=0;if(d){const[r,g,b]=values;h=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4;h*=60}const s=d?d/(1-Math.abs(2*l-1)):0;return `${h} ${s*100}% ${l*100}%`}
export function useSiteSettings(){return useContext(Context)}

"use client"
import {createContext,useContext} from 'react'
import {defaultSiteSettings,type SiteSettings} from '@/lib/cms/site-settings'
const Context=createContext<SiteSettings>(defaultSiteSettings)
export function SiteSettingsProvider({settings,children}:{settings:SiteSettings;children:React.ReactNode}) {
 return <Context.Provider value={settings}><div style={{display:'contents','--primary':settings.brand.accent===defaultSiteSettings.brand.accent?'43 99% 50%':hexHsl(settings.brand.accent)} as React.CSSProperties}>{children}</div></Context.Provider>
}
function hexHsl(hex:string){const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...values),min=Math.min(...values),d=max-min,l=(max+min)/2;let h=0;if(d){const[r,g,b]=values;h=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4;h*=60}const s=d?d/(1-Math.abs(2*l-1)):0;return `${h} ${s*100}% ${l*100}%`}
export function useSiteSettings(){return useContext(Context)}

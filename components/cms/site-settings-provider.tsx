"use client"
import {createContext,useContext} from 'react'
import {defaultSiteSettings,type SiteSettings} from '@/lib/cms/site-settings'
import {themeStyle} from '@/lib/cms/theme'
const Context=createContext<SiteSettings>(defaultSiteSettings)
export function SiteSettingsProvider({settings,children}:{settings:SiteSettings;children:React.ReactNode}) {
 return <Context.Provider value={settings}><div data-cms-buttons={settings.theme && settings.theme.buttonStyle !== 'current' ? settings.theme.buttonStyle : undefined} data-cms-theme={settings.theme?.font && settings.theme.font !== 'current' ? settings.theme.font : undefined} style={themeStyle(settings.brand.accent,settings.theme)}>{children}</div></Context.Provider>
}
export function useSiteSettings(){return useContext(Context)}

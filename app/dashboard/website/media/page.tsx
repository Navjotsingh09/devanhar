import {EntryError} from '@/lib/cms/entries/server'
import {mediaContext} from '@/lib/cms/media-server'
import {MediaLibrary} from '@/components/cms/media-library'
import {redirect} from 'next/navigation'
export const dynamic='force-dynamic'
export default async function MediaPage(){try{await mediaContext()}catch(e){if(e instanceof EntryError&&e.status===401)redirect('/auth/login');return <p role="alert">Your account is not assigned to website media.</p>}return <div className="space-y-6"><header><h1 className="text-3xl font-semibold tracking-tight">Media library</h1><p className="mt-2 text-sm text-muted-foreground">Upload and reuse website images, videos and PDF documents. Manage titles, descriptions and folders.</p></header><MediaLibrary/></div>}

import { headers } from 'next/headers'

export async function getPadelAdminBasePath() {
  const pathname = (await headers()).get('x-pathname') || ''
  return pathname.startsWith('/spa-admin') ? '/spa-admin' : '/dashboard/padel'
}

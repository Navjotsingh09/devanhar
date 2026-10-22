import { NextResponse } from 'next/server'
import { getBlogStaff } from '@/lib/blog-staff-server'
/** Cover changes belong to a saved article draft. Never delete shared storage from the editor. */
export async function DELETE() {
  const { user, allowed } = await getBlogStaff()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ error: 'Remove the image in the article editor, then save and publish that draft.' }, { status: 409 })
}

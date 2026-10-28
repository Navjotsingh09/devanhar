export function isSafeContentLink(value: string) {
  if (/[\\\u0000-\u0020\u007f]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  if (/^#[a-zA-Z0-9_-]+$/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch { return false }
}

export function isSafeAssetLink(value: string) {
  return isSafeContentLink(value) && (value.startsWith('/') || /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/site-images\//.test(value))
}

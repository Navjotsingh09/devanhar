/** Only return to local dashboard routes after authentication. */
export function dashboardReturnPath(value: string | null | undefined): string {
  if (!value || /[\\\r\n]/.test(value)) return '/dashboard'
  try {
    const url = new URL(value, 'https://dashboard.invalid')
    if (url.origin !== 'https://dashboard.invalid' || !(url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/'))) return '/dashboard'
    return url.pathname + url.search
  } catch { return '/dashboard' }
}

export const loginErrors: Record<string, string> = {
  session_expired: 'Your session has expired. Please sign in again.',
  access_check_failed: 'We could not verify your account access. Please try again. If this continues, contact your administrator.',
  access_denied: 'Your account does not have an active staff profile. Please use another staff account or contact your administrator.',
}

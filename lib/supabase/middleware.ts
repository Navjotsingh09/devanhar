import { canVisitDashboard, programmeHome, type StaffProgramme } from "@/lib/staff-programme-access"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export async function updateSession(request: NextRequest) {
  // Forward pathname to layout via request header for role-based route protection
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  })

  // Also expose on the response for any downstream consumers
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)

  if (!supabaseUrl || !supabaseKey) return supabaseResponse

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request: {
              headers: forwardedHeaders,
            },
          })
          supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const pathname = request.nextUrl.pathname
  // Public pages do not need session refresh or account queries. Private routes
  // authenticate the token before using its user ID for any authorization read.
  const privateRequest = pathname.startsWith('/dashboard') || pathname.startsWith('/spa-admin') || pathname.startsWith('/api/') || pathname.startsWith('/auth')
  if (!privateRequest) return supabaseResponse
  const { data: { user: verifiedUser }, error: authError } = await supabase.auth.getUser()
  const user = authError ? null : verifiedUser
  if (authError && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone(); url.pathname = '/auth/login'; url.search = '?error=session_expired'
    return NextResponse.redirect(url)
  }

  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/spa-admin') || pathname.startsWith('/api/'))) {
    // Fresh database assignments apply to existing sessions; never trust editable metadata.
    const [grantResult, profileResult] = await Promise.all([
      supabase.from('staff_programme_access').select('programme').eq('user_id', user.id),
      supabase.from('admin_profiles').select('role').eq('id', user.id).maybeSingle(),
    ])
    const { data: grants, error } = grantResult
    if (error || profileResult.error || !Array.isArray(grants)) return NextResponse.json({ error: 'Unable to verify account access' }, { status: 503 })
    const role = profileResult.data?.role
    const programmes = ['admin','super_admin'].includes(role || '') ? [] : grants.map(row => row.programme) as StaffProgramme[]
    if (role === 'vacancies_only' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/vacancies')) {
      if (!['GET','HEAD'].includes(request.method)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const url = request.nextUrl.clone(); url.pathname = '/dashboard/vacancies'; url.search = ''; return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/dashboard') && !canVisitDashboard(pathname, programmes, role)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const url = request.nextUrl.clone(); url.pathname = programmeHome(programmes); url.search = ''
      return NextResponse.redirect(url)
    }
    if (programmes.length && (pathname.startsWith('/spa-admin') || (pathname.startsWith('/api/') && !['/api/camp-applications/view-id','/api/reply'].includes(pathname)))) {
      return NextResponse.json({ error: 'Your account is limited to your assigned programmes.' }, { status: 403 })
    }
  }

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Domain restriction: only @devanhaar.com emails may access the dashboard
  if (pathname.startsWith("/dashboard") && user && !user.email?.toLowerCase().endsWith("@devanhaar.com")) {
    const url = request.nextUrl.clone()
    url.pathname = "/spa-admin"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/auth") && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

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

  // Keep refreshed session cookies on redirects as well as normal responses.
  const finish = (response: NextResponse) => {
    for (const cookie of supabaseResponse.cookies.getAll()) response.cookies.set(cookie)
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

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
          forwardedHeaders.set('cookie', request.cookies.toString())
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

  // Use getSession (no network call) — getUser() causes MIDDLEWARE_INVOCATION_TIMEOUT on Vercel Edge
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const pathname = request.nextUrl.pathname
  const isSpaAuth = ['/spa-admin/login', '/spa-admin/forgot-password', '/spa-admin/update-password'].includes(pathname)
  const isSpaPortal = pathname.startsWith('/spa-admin') && !isSpaAuth
  const isReadNavigation = request.method === 'GET' || request.method === 'HEAD'

  if (user && (pathname.startsWith('/dashboard') || isSpaPortal || pathname.startsWith('/api/'))) {
    // Fresh database assignments apply to existing sessions; never trust editable metadata.
    const { data: grants, error } = await supabase.from('staff_programme_access').select('programme').eq('user_id',user.id)
    if (error) {
      if (pathname.startsWith('/dashboard') && ['GET', 'HEAD'].includes(request.method)) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.search = ''
        url.searchParams.set('error', 'access_check_failed')
        url.searchParams.set('next', pathname + request.nextUrl.search)
        return finish(NextResponse.redirect(url))
      }
      if (isSpaPortal && isReadNavigation) {
        const url = request.nextUrl.clone(); url.pathname = '/auth/spa-access'; url.search = ''
        return finish(NextResponse.redirect(url))
      }
      return finish(NextResponse.json({ error: 'Unable to verify account access' }, { status: 503 }))
    }
    const programmes = (grants || []).map(row => row.programme) as StaffProgramme[]
    if (pathname.startsWith('/dashboard') && !canVisitDashboard(pathname, programmes)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const url = request.nextUrl.clone(); url.pathname = programmeHome(programmes); url.search = ''
      return finish(NextResponse.redirect(url))
    }
    if (programmes.length && isSpaPortal && isReadNavigation) {
      const url = request.nextUrl.clone(); url.pathname = '/auth/spa-access'; url.search = ''
      return finish(NextResponse.redirect(url))
    }
    if (programmes.length && (isSpaPortal || (pathname.startsWith('/api/') && !['/api/camp-applications/view-id','/api/reply'].includes(pathname)))) {
      return finish(NextResponse.json({ error: 'Your account is limited to your assigned programmes.' }, { status: 403 }))
    }
  }

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.search = ""
    url.searchParams.set("next", pathname + request.nextUrl.search)
    return finish(NextResponse.redirect(url))
  }

  // Domain restriction: only @devanhaar.com emails may access the dashboard
  if (pathname.startsWith("/dashboard") && user && !user.email?.toLowerCase().endsWith("@devanhaar.com")) {
    const url = request.nextUrl.clone()
    url.pathname = "/spa-admin"
    return finish(NextResponse.redirect(url))
  }

  // Login and password recovery must remain reachable even with a rejected session.

  // Vacancies-only role: can only access /dashboard/vacancies
  if (user && pathname.startsWith("/dashboard")) {
    const appRole = (user.app_metadata as Record<string, string>)?.role
    if (appRole === "vacancies_only" && !pathname.startsWith("/dashboard/vacancies")) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/vacancies"
      return finish(NextResponse.redirect(url))
    }
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth')) supabaseResponse.headers.set('Cache-Control', 'private, no-store')
  return supabaseResponse
}

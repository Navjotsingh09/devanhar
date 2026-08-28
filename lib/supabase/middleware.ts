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

  // Use getSession (no network call) — getUser() causes MIDDLEWARE_INVOCATION_TIMEOUT on Vercel Edge
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Domain restriction: only @devanhaar.com emails may access the dashboard
  if (pathname.startsWith("/dashboard") && user && !user.email?.toLowerCase().endsWith("@devanhaar.com")) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("error", "access_denied")
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/auth") && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Vacancies-only role: can only access /dashboard/vacancies
  if (user && pathname.startsWith("/dashboard")) {
    const appRole = (user.app_metadata as Record<string, string>)?.role
    if (appRole === "vacancies_only" && !pathname.startsWith("/dashboard/vacancies")) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/vacancies"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

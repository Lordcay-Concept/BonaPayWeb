import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user role if logged in
  let userRole = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role
  }

  // Protected routes that require authentication AND admin role
  const adminOnlyRoutes = ['/admin', '/dashboard', '/transfer', '/transactions', '/profile', '/cards', '/bills', '/savings', '/security']
  const isAdminRoute = adminOnlyRoutes.some((route: string) => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes (redirect to dashboard if already logged in as admin)
  const authRoutes = ['/login', '/signup', '/forgot-password']
  const isAuthRoute = authRoutes.some((route: string) => 
    request.nextUrl.pathname === route
  )

  // Block regular users from accessing web routes
  if (isAdminRoute && user) {
    if (userRole !== 'admin') {
      // Regular user trying to access web - redirect to download page
      const downloadUrl = new URL('/download-app', request.url)
      downloadUrl.searchParams.set('message', 'web_access_denied')
      return NextResponse.redirect(downloadUrl)
    }
  }

  // Redirect to login if not authenticated on admin routes
  if (isAdminRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect admin to dashboard if trying to access auth routes
  if (isAuthRoute && user && userRole === 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
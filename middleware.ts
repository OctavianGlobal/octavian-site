// ============================================================
// middleware.ts (project root — next to src/)
// Octavian Global — Session refresh middleware
// Required by @supabase/ssr to keep auth cookies fresh
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)

  // Refresh session — this is required by @supabase/ssr
  // Do not remove: without this, sessions expire and users get logged out
  await supabase.auth.getUser()

  // ── Protected routes ──────────────────────────────────────
  const { pathname } = request.nextUrl

  // Dashboard and account routes require auth
  const protectedPaths = ['/dashboard', '/account', '/archive']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

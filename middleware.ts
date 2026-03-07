// File: middleware.ts
// FINAL, DEFINITIVE VERSION
// Now explicitly skips all auth and api routes to prevent conflicts.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. EXPLICITLY SKIP /auth and /api routes
  if (request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    // 2. Create the client and manage session
    const { supabase, response } = createClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    // Define routes
    const adminRoutes = ['/admin'];
    const protectedUserRoutes = ['/dashboard', '/preferences', '/chat', '/forum', '/likes-you', '/seeker-results', '/roommate-results'];

    // --- Scenario 1: User is NOT Logged In ---
    if (!user) {
      const isProtectedRoute = protectedUserRoutes.some(prefix => pathname.startsWith(prefix)) || adminRoutes.some(prefix => pathname.startsWith(prefix));
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return response;
    }

    // --- Scenario 2: User IS Logged In ---
    const isAdminByEmail = user.email === process.env.SUPABASE_ADMIN_EMAIL;
    const is_admin = isAdminByEmail ? true : undefined;
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    // 2a. User is an ADMIN
    if (profile?.is_admin || is_admin === true) {
      if (protectedUserRoutes.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return response;
    }

    // 2b. User is a REGULAR USER
    if (!profile?.is_admin) {
      if (adminRoutes.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return response;
    }

    return response;
  } catch (error) {
    // If middleware fails (e.g. Supabase unreachable), let the request through
    // rather than crashing the entire site with MIDDLEWARE_INVOCATION_FAILED
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
// File: middleware.ts
// FINAL, DEFINITIVE VERSION
// Now explicitly skips all auth and api routes to prevent conflicts.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. EXPLICITLY SKIP /auth and /api routes
  // This prevents the middleware from interfering with login callbacks and API actions.
  if (request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Create the client and manage session
  const { supabase, response } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Define routes
  const adminRoutes = ['/admin'];
  const protectedUserRoutes = ['/dashboard', '/preferences', '/chat', '/forum', '/likes-you', '/seeker-results', '/roommate-results'];

  // --- Scenario 1: User is NOT Logged In ---
  if (!session) {
    const isProtectedRoute = protectedUserRoutes.some(prefix => pathname.startsWith(prefix)) || adminRoutes.some(prefix => pathname.startsWith(prefix));
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // --- Scenario 2: User IS Logged In ---
  const isAdminByEmail = session.user.email === process.env.SUPABASE_ADMIN_EMAIL;
  const is_admin = isAdminByEmail ? true : undefined;
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  // 2a. User is an ADMIN
  if (profile?.is_admin || is_admin === true) {
    // If admin tries to access a user page, force them to admin dashboard
    if (protectedUserRoutes.some(prefix => pathname.startsWith(prefix))) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // If admin is on homepage, force them to admin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return response;
  }

  // 2b. User is a REGULAR USER
  if (!profile?.is_admin) {
    // If regular user tries to access admin page, force them to user dashboard
    if (adminRoutes.some(prefix => pathname.startsWith(prefix))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If regular user is on homepage, force them to user dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  return response;
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
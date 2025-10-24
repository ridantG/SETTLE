// File: middleware.ts
// FINAL, DEFINITIVE, AND SECURE VERSION

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // This line is crucial for keeping the user's session refreshed.
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // --- Admin Route Protection ---
  // This logic protects all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    // If no one is logged in, redirect to the admin login page.
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If someone is logged in, check if they are an admin.
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    // If they are NOT an admin, sign them out and redirect to the main page for security.
    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- Regular User Logic ---
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', session.user.id)
      .single();
      
    // If a logged-in user is an admin, always ensure they are in the admin area.
    // This prevents them from being redirected to the user dashboard.
    if (profile?.is_admin && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
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
     * - api/ (API routes)
     * - auth/ (Supabase callback route)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
};
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const protectedRoutes = [ '/dashboard', '/preferences', '/seeker-results', '/roommate-results', '/chat', '/forum', '/likes-you', '/tiffin' ];

  // If the user is not logged in and is trying to access a protected route, redirect to landing.
  if (!session && protectedRoutes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // THE FIX IS HERE: The new "Onboarding Gatekeeper" logic
  if (session) {
    // Fetch the user's profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // If the user is logged in but has NOT completed onboarding (no role),
    // and they are not already on the onboarding page, force them to it.
    if (!profile?.role && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)', ],
};
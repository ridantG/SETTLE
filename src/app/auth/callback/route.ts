// File: app/auth/callback/route.ts
// SECURITY FIX: Validates the 'next' parameter to prevent open redirect attacks.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Validate redirect path: must start with "/" and must NOT contain "//"
// This prevents redirects to external domains (e.g., "//evil.com")
function getSafeRedirectPath(next: string | null): string {
  const fallback = "/dashboard";
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
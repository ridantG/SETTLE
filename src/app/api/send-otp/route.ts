// src/app/api/send-otp/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { phone } = await request.json();

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  // FIX: cookies() must be awaited in Next.js 14.2+/15
  const cookieStore = await cookies();

  // Create a Supabase client specifically for this Route Handler
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This can be ignored in Route Handlers
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // This can be ignored in Route Handlers
          }
        },
      },
    }
  );

  // Perform the OTP sign-in request
  const { error } = await supabase.auth.signInWithOtp({ phone });

  if (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'OTP sent successfully!' });
}

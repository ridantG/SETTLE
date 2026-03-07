// File: src/lib/supabase/server.ts
// FINAL, DEFINITIVE VERSION for Next.js 15
// This keeps the function synchronous but handles the async cookies internally.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  // We do NOT await cookies() here, so this function remains synchronous.
  // This ensures we don't break your other files (like dashboard/page.tsx).

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        // We handle the async nature of cookies() Next.js 15 INSIDE these methods.
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The 'setAll' method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
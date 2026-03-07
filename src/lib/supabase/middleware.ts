// File: src/lib/supabase/middleware.ts
// FINAL, DEFINITIVE VERSION
// This file connects the Middleware "Guard" to the Supabase Auth system.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const createClient = (request: NextRequest) => {
  // 1. Create an initial response.
  // We need this because Supabase might want to write cookies to it.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        // Middleware works with request.cookies (synchronous)
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies (so the immediate request sees them)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Update the response cookies (so the browser saves them)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => 
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}
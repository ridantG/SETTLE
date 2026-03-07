// File: lib/supabase/client.ts
// The definitive client for "use client" components.
// Uses fallback values during Vercel static prerendering (where env vars
// aren't available yet). The real values are injected at runtime in the browser.

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  )
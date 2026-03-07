// File: lib/supabase/admin.ts
// Server-side admin client with service role privileges.
// Uses fallback values during Vercel static prerendering.

import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    { auth: { persistSession: false } }
  );
};
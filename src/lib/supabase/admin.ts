// File: lib/supabase/admin.ts
// FINAL, DEFINITIVE VERSION

import { createClient } from '@supabase/supabase-js';

// This function creates the secure, server-side-only admin client.
// It correctly reads the environment variables from process.env.
export const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL or Service Role Key is not defined in environment variables.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
};
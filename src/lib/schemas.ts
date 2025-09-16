// File: lib/schemas.ts
// This is the single, definitive source of truth for the Profile data structure.

import { User } from '@supabase/supabase-js';
import { z } from 'zod';

// We define the rules for a user's profile using Zod. This is our master blueprint.
export const profileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['seeker', 'lister']).nullable(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).nullable(),
  age: z.coerce.number().min(18, { message: "You must be at least 18." }).nullable(),
  gender: z.string().nullable(),
  city: z.string().nullable(),
  status: z.string().nullable(),
  organization: z.string().nullable(),
  diet: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  drinks: z.boolean().nullable(),
  smokes: z.boolean().nullable(),
  has_pets: z.boolean().nullable(),
  flat_image_urls: z.array(z.string().url()).nullable(),
  preferences: z.any().nullable(),
  email: z.string().email().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  flags: z.number().optional() // Include the flags column
});

// We INFER the TypeScript type directly from the Zod schema.
// They are now architecturally guaranteed to be in sync, forever.
export type Profile = z.infer<typeof profileSchema>;
export type OnboardingFormProps = {

  user: User;

  profileData: Profile;

  onSave: (data: Profile) => Promise<void>;

  isSaving: boolean;

}
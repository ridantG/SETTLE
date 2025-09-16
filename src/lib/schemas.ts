// This file is the single, definitive source of truth for the Profile data structure
// and its validation rules. All other files will import from here.

import { z } from 'zod';
import { type User } from "@supabase/supabase-js";

// This is the master blueprint for a user profile.
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
});

// We INFER the TypeScript type directly from the Zod schema.
// They are now architecturally guaranteed to be in sync, forever.
export type Profile = z.infer<typeof profileSchema>;

// This defines the props for the OnboardingForm to ensure type safety.
export type OnboardingFormProps = {
    user: User;
    profileData: Profile;
    onSave: (data: Profile) => Promise<void>;
    isSaving: boolean;
};

// File: lib/schemas.ts
// This is the single, definitive source of truth for the Profile data structure.
import { z } from 'zod';

// Zod schema for the multi-step form's data
export const profileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['seeker', 'lister']).nullable(),
  name: z.string().min(2, "Name is required").nullable(),
  age: z.coerce.number().min(18, "Must be 18+").nullable(),
  gender: z.enum(['male', 'female']).nullable(),
  city: z.string().min(2, "City is required").nullable(),
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
  agreed_to_conduct: z.boolean().optional(),
});

// We infer the TypeScript type directly from the schema.
export type Profile = z.infer<typeof profileSchema>;

// A simpler schema for the initial, basic onboarding
export const onboardingSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  age: z.coerce.number().min(18, { message: "You must be at least 18." }),
  gender: z.enum(['male', 'female']), // Simple, correct enum
  city: z.string().min(2, { message: "City is required." }),
});
export type OnboardingSchema = z.infer<typeof onboardingSchema>;
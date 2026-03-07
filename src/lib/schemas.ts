// File: lib/schemas.ts
import { z } from "zod";

// ---- PROFILE SCHEMA ----
export const profileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["seeker", "lister"]).nullable(),
  name: z.string().min(2, "Name is required").nullable(),
  age: z.coerce.number().min(18, "Must be 18+").nullable(),
  gender: z.enum(["Male", "Female", "Non-binary", "Other"]).nullable(),
  city: z.string().min(2, "City is required").nullable(),
  status: z.string().nullable(),
  organization: z.string().nullable(),
  diet: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  avatar_url: z.string().optional().nullable(),
  drinks: z.boolean().nullable(),
  smokes: z.boolean().nullable(),
  has_pets: z.boolean().nullable(),
  flat_image_urls: z.array(z.string().url()).nullable(),
  preferences: z.any().nullable(),
  email: z.string().email().nullable(),
  bio: z.string().max(300).optional().nullable(),
  smoking_habit: z.enum(["Non-smoker", "Smoker", "Social smoker"]).optional().nullable(),
  drinking_habit: z.enum(["Non-drinker", "Social drinker", "Regular drinker"]).optional().nullable(),
  dietary_preference: z.enum(["Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian"]).optional().nullable(),
  pets_description: z.string().max(100).optional().nullable(),
  occupation: z.enum(["Student", "Working Professional", "Other"]).optional().nullable(),
  employer_college: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  flags: z.number().optional(),
  is_admin: z.boolean().optional(),
  is_suspended: z.boolean().optional(),
  agreed_to_conduct: z.boolean().optional(),
});

export type Profile = z.infer<typeof profileSchema>;


// ---- ONBOARDING SCHEMA ----
export const onboardingSchema = z.object({
  age: z.coerce.number().min(18, { message: "You must be at least 18." }).max(100),
  gender: z.enum(["Male", "Female", "Non-binary", "Other"], {
    message: "Please select a gender.",
  }),
  city: z.string().min(2, { message: "City is required." }),
  smoking_habit: z.enum(["Non-smoker", "Smoker", "Social smoker"], {
    message: "Select smoking habit.",
  }),
  drinking_habit: z.enum(["Non-drinker", "Social drinker", "Regular drinker"], {
    message: "Select drinking habit.",
  }),
  dietary_preference: z.enum(["Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian"], {
    message: "Select diet.",
  }),
  pets_description: z.string().max(100).optional(),
  occupation: z.enum(["Student", "Working Professional", "Other"], {
    message: "Select occupation.",
  }),
  employer_college: z.string().min(2, { message: "Please enter your college or company name." }),
  bio: z.string().max(300).optional(),
  avatar_url: z.string().optional(),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;


// ---- RENTAL SCHEMA ----
export const rentalSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).nullable(),
  category: z.string().nonempty({ message: "Please select a category." }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1." }),
  city: z.string().min(2, { message: "City is required." }),
  image_urls: z.array(z.string().url()).min(1, { message: "Please upload at least one photo." }),
});

export type RentalSchema = z.infer<typeof rentalSchema>;

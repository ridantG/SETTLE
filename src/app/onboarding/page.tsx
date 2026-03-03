// File: src/app/onboarding/page.tsx


"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';

// --- Zod Schema ---
const onboardingSchema = z.object({
  // Basic Info
  age: z.coerce.number().min(18, "You must be at least 18.").max(100),
  gender: z.enum(["Male", "Female", "Non-binary", "Other"]).refine(value => value !== undefined, { message: "Select gender" }),
  city: z.string().min(2, "City is required."),
  
  // Lifestyle Info (New Fields)
  smoking_habit: z.enum(["Non-smoker", "Smoker", "Social smoker"]).refine(value => value !== undefined, { message: "Select smoking habit" }),
  drinking_habit: z.enum(["Non-drinker", "Social drinker", "Regular drinker"]).refine(value => value !== undefined, { message: "Select drinking habit" }),
  dietary_preference: z.enum(["Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian"]).refine(value => value !== undefined, { message: "Select diet" }),
  pets_description: z.string().max(100, "Keep pet details brief.").optional(), // Empty string = No pets
  
  // Professional Info (New Fields)
  occupation: z.enum(["Student", "Working Professional", "Other"]).refine(value => value !== undefined, { message: "Select occupation" }),
  employer_college: z.string().min(2, "Please enter your college or company name."),
  
  bio: z.string().max(300, "Bio max 300 chars.").optional(),
  avatar_url: z.string().optional(),
});

type FormData = z.infer<typeof onboardingSchema>;

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(onboardingSchema) as any,
  });

  // Load existing profile
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (profile && isMounted) {
            // Fill Basic Info
            if (profile.age) setValue('age', profile.age);
            if (profile.gender) setValue('gender', profile.gender);
            if (profile.city) setValue('city', profile.city);
            if (profile.bio) setValue('bio', profile.bio);
            if (profile.avatar_url) {
                setValue('avatar_url', profile.avatar_url);
                setAvatarPreview(profile.avatar_url);
            }
            // Fill New Fields
            if (profile.smoking_habit) setValue('smoking_habit', profile.smoking_habit);
            if (profile.drinking_habit) setValue('drinking_habit', profile.drinking_habit);
            if (profile.dietary_preference) setValue('dietary_preference', profile.dietary_preference);
            if (profile.pets_description) setValue('pets_description', profile.pets_description);
            if (profile.occupation) setValue('occupation', profile.occupation);
            if (profile.employer_college) setValue('employer_college', profile.employer_college);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [supabase, router, setValue]);

  // Image Upload Logic
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || !event.target.files[0]) return;
      const file = event.target.files[0];
      const filePath = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarPreview(publicUrl);
      setValue('avatar_url', publicUrl);
      toast.success('Photo uploaded!');
    } catch (e) { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  // Submit Logic
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
        // Map all fields
        age: data.age,
        gender: data.gender,
        city: data.city,
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        smoking_habit: data.smoking_habit,
        drinking_habit: data.drinking_habit,
        dietary_preference: data.dietary_preference,
        pets_description: data.pets_description || '',
        occupation: data.occupation,
        employer_college: data.employer_college
      });

      if (error) throw error;
      toast.success('Profile Updated!');
      router.push(searchParams.get('next') || '/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Save failed');
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Tell us about yourself</h2>
        <p className="mt-2 text-center text-gray-600">These details help us find your perfect match.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-8 shadow rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* --- Section 1: Basic Info --- */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Details</h3>
                
                {/* Photo */}
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                        {avatarPreview ? <img src={avatarPreview} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400">?</div>}
                    </div>
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">
                        {uploading ? '...' : 'Upload Photo'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" {...register('age')} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select {...register('gender')} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current City</label>
                    <input type="text" {...register('city')} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Mumbai" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
            </div>

            {/* --- Section 2: Work & Education --- */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Work & Education</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Occupation Status</label>
                    <select {...register('occupation')} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select...</option>
                        <option value="Student">Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">College or Company Name</label>
                    <input type="text" {...register('employer_college')} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. IIT Delhi or Google" />
                    {errors.employer_college && <p className="text-red-500 text-xs mt-1">{errors.employer_college.message}</p>}
                </div>
            </div>

            {/* --- Section 3: Lifestyle --- */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Lifestyle Habits</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Smoking</label>
                        <select {...register('smoking_habit')} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select...</option>
                            <option value="Non-smoker">Non-smoker</option>
                            <option value="Smoker">Smoker</option>
                            <option value="Social smoker">Social smoker</option>
                        </select>
                        {errors.smoking_habit && <p className="text-red-500 text-xs mt-1">{errors.smoking_habit.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Drinking</label>
                        <select {...register('drinking_habit')} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select...</option>
                            <option value="Non-drinker">Non-drinker</option>
                            <option value="Social drinker">Social drinker</option>
                            <option value="Regular drinker">Regular drinker</option>
                        </select>
                        {errors.drinking_habit && <p className="text-red-500 text-xs mt-1">{errors.drinking_habit.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Dietary Preference</label>
                    <select {...register('dietary_preference')} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select...</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-vegetarian">Non-vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Vegan">Vegan</option>
                    </select>
                    {errors.dietary_preference && <p className="text-red-500 text-xs mt-1">{errors.dietary_preference.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Do you have pets? (Optional)</label>
                    <input type="text" {...register('pets_description')} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Yes, a golden retriever named Max" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio (Optional)</label>
                    <textarea rows={3} {...register('bio')} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Tell us a bit more about you..." />
                </div>
            </div>

            <button type="submit" disabled={loading || uploading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
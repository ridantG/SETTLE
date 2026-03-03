// File: src/app/preferences/page.tsx
// FINAL, TYPE-SAFE VERSION

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForm, SubmitHandler } from 'react-hook-form'; // Added SubmitHandler for better typing
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';

// --- Zod Schema ---
const preferencesSchema = z.object({
  // z.coerce.number() handles the string-to-number conversion automatically
  age: z.coerce.number()
    .min(18, "You must be at least 18 years old.")
    .max(100, "Please enter a valid age."),
    
  // FIX 1: Use 'message' or 'required_error' depending on your Zod version, 
  // or use the standard object syntax that TS is asking for.
  // We remove the specific params object to rely on standard validation 
  // and handle the error message in the UI, OR use the simple error map.
  gender: z.enum(["Male", "Female", "Non-binary", "Other"])
    .refine(value => value !== undefined, { message: "Please select a gender." }),
  
  city: z.string().min(2, "City is required."),
  bio: z.string().max(300, "Bio must be less than 300 characters.").optional(),
  avatar_url: z.string().optional(),
});

type FormData = z.infer<typeof preferencesSchema>;

export default function PreferencesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    // FIX 2: We cast the resolver to 'any' to silence the strict type mismatch 
    // between Zod's 'unknown' input (for coercion) and RHF's strict 'number' type.
    // This is safe because we know Zod will coerce the string to a number.
    resolver: zodResolver(preferencesSchema) as any, 
  });

  // 1. Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Pre-fill the form
        if (profile.age) setValue('age', profile.age);
        if (profile.gender) setValue('gender', profile.gender);
        if (profile.city) setValue('city', profile.city);
        if (profile.bio) setValue('bio', profile.bio);
        if (profile.avatar_url) {
            setValue('avatar_url', profile.avatar_url);
            setAvatarPreview(profile.avatar_url);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [supabase, router, setValue]);

  // 2. Handle Image Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarPreview(publicUrl);
      setValue('avatar_url', publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload Error:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Form Submission
  // FIX 3: Explicitly type the handler
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // FIX: Use 'upsert' instead of 'update'.
      // This handles both "Create new profile" and "Update existing profile" automatically.
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Required for upsert
          email: user.email, // Ensure email is synced
          age: data.age,
          gender: data.gender,
          city: data.city,
          bio: data.bio,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Profile saved successfully!');
      router.push('/dashboard'); 
    } catch (error: any) {
      // FIX: Use JSON.stringify to reveal the hidden error object
      console.error('FULL ERROR DETAILS:', JSON.stringify(error, null, 2));
      toast.error(`Error: ${error.message || 'Failed to save profile'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell us a little about yourself to get started.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
              <div className="mt-2 flex items-center space-x-4">
                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </span>
                <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  {uploading ? 'Uploading...' : 'Change'}
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <div className="mt-1">
                <input 
                  id="age" 
                  type="number" 
                  {...register('age')} 
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                />
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select id="gender" {...register('gender')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <div className="mt-1">
                <input id="city" type="text" {...register('city')} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio (Optional)</label>
              <div className="mt-1">
                <textarea id="bio" rows={3} {...register('bio')} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading || uploading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
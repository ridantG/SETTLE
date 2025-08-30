// src/app/account/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LoggedInHeader from '@/components/LoggedInHeader';
import ImageUpload from '@/components/ImageUpload';
import toast from 'react-hot-toast';

// Define a type for the profile data to handle null values from the database
type Profile = {
  name: string | null;
  age: number | null;
  status: string | null;
  organization: string | null;
  diet: string | null;
  description: string | null;
  image_url: string | null;
  user_role: string | null;
};

// Create a default blank state for the form
const blankProfile: Profile = {
  name: '',
  age: null,
  status: '',
  organization: '',
  diet: '',
  description: '',
  image_url: null,
  user_role: null,
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>(blankProfile); // Initialize with a blank, non-null object
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);

  // Fetches the user's profile from the database
  const getProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      // If a profile exists, load its data into the form
      setProfile(data);
    } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      toast.error('Could not load profile data.');
    }
    // If no profile is found (new user), the form will simply remain in its blank state.
    // This prevents the page from getting stuck.
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Handles changes in form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  // Handles the form submission to update the profile
  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Saving profile...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let publicImageUrl = profile.image_url;
    if (profileImagePath) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(profileImagePath);
      publicImageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('profiles').update({
      name: profile.name,
      age: profile.age,
      status: profile.status,
      organization: profile.organization,
      diet: profile.diet,
      description: profile.description,
      image_url: publicImageUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    toast.dismiss(toastId);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Profile updated successfully!');
    }
    setIsSaving(false);
  };

  // Handles resetting the user's role
  const handleChangeRole = async () => {
    const confirmation = window.confirm("Are you sure? This will reset your role and allow you to choose again from the dashboard.");
    if (!confirmation) return;

    const toastId = toast.loading('Resetting your role...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ user_role: null })
      .eq('id', user.id);
    
    toast.dismiss(toastId);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Your role has been reset.');
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50">
            <LoggedInHeader />
            <main className="text-center py-20"><p>Loading Your Profile...</p></main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="flex justify-center items-start py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Your Profile</h1>
          <form onSubmit={handleUpdate}>
            <fieldset disabled={isSaving} className="space-y-6">
              <ImageUpload
                label="Your Photograph"
                onUpload={(path) => setProfileImagePath(path)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" id="name" value={profile.name || ''} onChange={handleChange} className="w-full p-3 bg-gray-100 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input type="number" id="age" value={profile.age || ''} onChange={handleChange} className="w-full p-3 bg-gray-100 rounded-lg" />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Are you a...?</label>
                <select id="status" value={profile.status || ''} onChange={handleChange} className="w-full p-3 bg-gray-100 rounded-lg">
                  <option value="" disabled>Select Status</option>
                  <option value="Student">Student</option>
                  <option value="Professional">Working Professional</option>
                </select>
              </div>
              {profile.status && (
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                    {profile.status === 'Student' ? 'Institute' : 'Company'}
                  </label>
                  <input type="text" id="organization" value={profile.organization || ''} onChange={handleChange} className="w-full p-3 bg-gray-100 rounded-lg" />
                </div>
              )}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">About Yourself</label>
                <textarea id="description" rows={4} value={profile.description || ''} onChange={handleChange} className="w-full p-3 bg-gray-100 rounded-lg"></textarea>
              </div>
              <div className="pt-4">
                 <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50">
                   {isSaving ? 'Saving...' : 'Update Profile'}
                 </button>
              </div>
            </fieldset>
          </form>

          <div className="mt-12 pt-8 border-t border-dashed">
            <h2 className="text-xl font-bold text-gray-800">Change Your Goal</h2>
            <p className="text-gray-500 mt-2">
              Want to switch from looking for a room to listing one, or vice-versa? Reset your choice here.
            </p>
            <button 
              onClick={handleChangeRole}
              className="mt-4 w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition"
            >
              Reset My Choice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
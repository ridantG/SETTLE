// src/app/preferences/page.tsx

"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LoggedInHeader from '@/components/LoggedInHeader';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';
import toast from 'react-hot-toast';
import { FaUser, FaBirthdayCake, FaBriefcase, FaUniversity, FaUtensils } from 'react-icons/fa';

type Profile = { name: string; age: string; status: string; organization: string; diet: string; description: string; image_url: string | null; drinks: boolean | null; smokes: boolean | null; flat_image_urls: string[] | null; };
const blankProfile: Profile = { name: '', age: '', status: '', organization: '', diet: '', description: '', image_url: null, drinks: null, smokes: null, flat_image_urls: [], };

export default function PreferencesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>(blankProfile);
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);
  const [flatImagePaths, setFlatImagePaths] = useState<string[]>([]);

  const getProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) { setProfile(data); }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { getProfile(); }, [getProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleHabitChange = (habit: 'drinks' | 'smokes', value: boolean) => {
    setProfile(prev => ({ ...prev, [habit]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
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

    const flatPublicUrls = flatImagePaths.map(path => {
      const { data } = supabase.storage.from('flat-photos').getPublicUrl(path);
      return data.publicUrl;
    });

    const { error } = await supabase.from('profiles').upsert({
      id: user.id, user_role: 'lister', name: profile.name, age: parseInt(profile.age) || null,
      status: profile.status, organization: profile.organization, diet: profile.diet,
      description: profile.description, image_url: publicImageUrl, drinks: profile.drinks,
      smokes: profile.smokes, flat_image_urls: flatPublicUrls, updated_at: new Date().toISOString(),
    });

    toast.dismiss(toastId);
    if (error) { toast.error(`Error: ${error.message}`);
    } else { toast.success('Profile saved!'); router.push('/seeker-results'); }
    setIsSaving(false);
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
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div className="hidden md:block text-left pr-8">
            <h1 className="text-5xl font-extrabold text-gray-800 leading-tight">
              List Your Space & <span className="text-green-600">Find a Roommate.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Create a detailed profile of yourself and your space. This helps potential roommates understand if you&apos;d be a great fit to live with.
            </p>
            
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
             <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:hidden">Your Profile & Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset disabled={isSaving}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" id="name" value={profile.name || ''} onChange={handleChange} placeholder="Full Name" required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
                  </div>
                   <div className="relative">
                    <FaBirthdayCake className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input type="number" id="age" value={profile.age || ''} onChange={handleChange} placeholder="Age" required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
                  </div>
                </div>

                <ImageUpload label="Your Photograph" onUpload={(path) => setProfileImagePath(path)} />
                <MultiImageUpload label="Photos of your Room/Flat (Max 6)" onUpload={(paths) => setFlatImagePaths(paths)} />
            
                <div className="relative">
                  <FaBriefcase className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                  <select id="status" value={profile.status || ''} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg appearance-none">
                    <option value="" disabled>Select Your Status (Student/Professional)</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Working Professional</option>
                  </select>
                </div>

                {profile.status && (
                  <div className="relative">
                     <FaUniversity className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                     <input type="text" id="organization" value={profile.organization || ''} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" placeholder={profile.status === 'Student' ? 'Institute Name' : 'Company Name'} required />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you drink?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleHabitChange('drinks', true)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${profile.drinks === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Yes</button>
                      <button type="button" onClick={() => handleHabitChange('drinks', false)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${profile.drinks === false ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>No</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you smoke?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleHabitChange('smokes', true)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${profile.smokes === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Yes</button>
                      <button type="button" onClick={() => handleHabitChange('smokes', false)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${profile.smokes === false ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>No</button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <FaUtensils className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                  <select id="diet" value={profile.diet || ''} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg appearance-none">
                    <option value="" disabled>Select Dietary Preference</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">About Yourself & Your Place</label>
                  <textarea id="description" rows={4} value={profile.description || ''} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-lg" placeholder="Tell potential roommates about yourself, your lifestyle..."></textarea>
                </div>
                
                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className="w-full bg-green-500 text-white font-bold py-3 px-5 rounded-lg text-lg hover:bg-green-600 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg">
                    {isSaving ? 'Saving...' : 'Save Profile & Find a Roommate'}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
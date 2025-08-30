// src/app/find-a-room/page.tsx

"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LoggedInHeader from '@/components/LoggedInHeader';
import ImageUpload from '@/components/ImageUpload';
import toast from 'react-hot-toast';
import { FaUser, FaCity, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';

// THIS IS THE FIX: The helper component is now defined outside the main component.
// It will not be recreated on every keystroke, which solves the focus issue.
const InputField = ({ id, icon, placeholder, type = "text", value, onChange }: any) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
      {icon}
    </div>
    <input 
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
    />
  </div>
);


export default function FindARoomPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    city: '',
    drinks: null as boolean | null,
    smokes: null as boolean | null,
  });
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleHabitChange = (habit: 'drinks' | 'smokes', value: boolean) => {
    setFormData(prev => ({ ...prev, [habit]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Saving your details...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to continue.");
      setLoading(false);
      return;
    }
    
    let publicImageUrl = null;
    if (profileImagePath) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(profileImagePath);
      publicImageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      user_role: 'seeker',
      name: formData.name,
      age: parseInt(formData.age) || null,
      gender: formData.gender,
      city: formData.city,
      drinks: formData.drinks,
      smokes: formData.smokes,
      image_url: publicImageUrl,
      updated_at: new Date().toISOString(),
    });

    toast.dismiss(loadingToast);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Profile saved!');
      router.push('/roommate-results');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div className="hidden md:block text-left">
            <h1 className="text-5xl font-extrabold text-gray-800 leading-tight">
              Let&apos;s Find Your <span className="text-green-600">Perfect Match.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Tell us a bit about yourself. The more details you provide, the better we can match you with the right roommates and places.
            </p>
            
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:hidden">Your Search Profile</h2>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={loading} className="space-y-5">
                <InputField id="name" icon={<FaUser />} placeholder="Full Name" value={formData.name} onChange={handleChange} />
                <InputField id="age" icon={<FaBirthdayCake />} placeholder="Age" type="number" value={formData.age} onChange={handleChange} />
                
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaVenusMars /></div>
                   <select id="gender" value={formData.gender} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                       <option value="" disabled>Select Gender</option>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                   </select>
                </div>

                <InputField id="city" icon={<FaCity />} placeholder="City you're searching in" value={formData.city} onChange={handleChange} />

                <ImageUpload
                  label="Your Photograph"
                  onUpload={(path) => setProfileImagePath(path)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you drink?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleHabitChange('drinks', true)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${formData.drinks === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Yes</button>
                      <button type="button" onClick={() => handleHabitChange('drinks', false)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${formData.drinks === false ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>No</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you smoke?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleHabitChange('smokes', true)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${formData.smokes === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Yes</button>
                      <button type="button" onClick={() => handleHabitChange('smokes', false)} className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${formData.smokes === false ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>No</button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full bg-green-500 text-white font-bold py-3 px-5 rounded-lg text-lg hover:bg-green-600 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg">
                    {loading ? 'Saving...' : 'Find Roommates'}
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
// src/app/roommate-results/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from "@/components/LoggedInHeader";
import Image from 'next/image';
import { FaCity, FaBriefcase, FaUniversity, FaGlassCheers, FaSmoking, FaUtensils } from 'react-icons/fa';

// This is the crucial fix that solves the params and cookies errors
export const dynamic = 'force-dynamic';

export default async function ProfileDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoggedInHeader />
        <main className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-700">Profile not found.</h1>
        </main>
      </div>
    );
  }

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | boolean | null }) => (
    <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg">
      <div className="text-green-600 text-xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value ?? 'N/A')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* --- Profile Header --- */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1 p-8 flex flex-col items-center justify-center bg-gray-50">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                <Image 
                  src={profile.image_url || '/images/person1.jpg'} 
                  alt={profile.name || 'Profile picture'}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mt-4">{profile.name}</h1>
              <p className="text-lg text-gray-500">{profile.age ? `${profile.age} years old` : 'Age N/A'}</p>
            </div>
            <div className="md:col-span-2 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={<FaCity />} label="City" value={profile.city} />
                <DetailItem 
                  icon={profile.status === 'Student' ? <FaUniversity /> : <FaBriefcase />}
                  label={profile.status || 'Status'}
                  value={profile.organization}
                />
                <DetailItem icon={<FaGlassCheers />} label="Drinks" value={profile.drinks} />
                <DetailItem icon={<FaSmoking />} label="Smokes" value={profile.smokes} />
                <DetailItem icon={<FaUtensils />} label="Diet" value={profile.diet} />
              </div>
            </div>
          </div>

          {/* --- Flat Photos Section --- */}
          {profile.flat_image_urls && profile.flat_image_urls.length > 0 && (
            <div className="p-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">The Space</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.flat_image_urls.map((url: string, index: number) => (
                  <div key={index} className="relative w-full h-40 rounded-lg overflow-hidden shadow-sm">
                    <Image 
                      src={url} 
                      alt={`Flat photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Description Section --- */}
          {profile.description && (
             <div className="p-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{profile.description}</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
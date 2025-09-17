// File: app/likes-you/page.tsx
// FINAL, CORRECTED VERSION: With corrected TypeScript types and data handling.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import EmptyState from '@/components/EmptyState';
import { type User } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// This is the correct type for a user profile.
type Profile = {
    id: string;
    name: string | null;
    image_url: string | null;
    city: string | null;
    role: 'seeker' | 'lister' | null;
};

// A simple, strongly-typed card for the grid
const LikedYouCard = ({ profile }: { profile: Profile }) => (
    <Link href={profile.role === 'seeker' ? `/roommate-results/${profile.id}` : `/seeker-results/${profile.id}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-transform duration-300 hover:scale-105">
            <img 
                src={profile.image_url || 'https://placehold.co/200x200'} 
                alt={profile.name || 'User'} 
                className="w-full h-40 object-cover" 
            />
            <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{profile.name || 'User'}</h3>
                <p className="text-sm text-gray-500">{profile.city || 'Location N/A'}</p>
            </div>
        </div>
    </Link>
);

// This function now correctly fetches and types the data.
async function fetchLikers(userId: string): Promise<Profile[]> {
    const supabase = createClient();
    
    // THE FIX IS HERE: The Supabase join returns the related profile inside an array.
    // The previous code did not handle this correctly.
    const { data, error } = await supabase
        .from('likes')
        .select('liker:profiles!likes_liker_id_fkey(id, name, image_url, city, role)')
        .eq('liked_id', userId);

    if (error) {
        console.error("Fetch Likers Error:", error);
        return [];
    }

    // This correctly extracts and flattens the nested profile data.
    return data
        .map(item => item.liker) // Extracts the 'liker' property, which is an array
        .flat() // Flattens the array of arrays into a single array
        .filter((p): p is Profile => p !== null); // Ensures type safety
}

export default async function LikesYouPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const likers = await fetchLikers(user.id);

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-7xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Who's Interested In You</h1>
                {likers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {likers.map(profile => (
                            <LikedYouCard key={profile.id} profile={profile} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No New Likes Yet"
                        message="When someone shows interest in you, they will appear here. Keep your profile updated to attract more matches!"
                        actionText="Edit My Profile"
                        actionHref="/preferences"
                    />
                )}
            </main>
        </div>
    );
}
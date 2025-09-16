// File: app/likes-you/page.tsx
// FINAL VERSION: A powerful engagement tool for users to see who is interested in them.

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import { useRouter } from "next/navigation";

// A small card for the "Likes You" grid
const LikedYouCard = ({ profile, onMatch }: { profile: any, onMatch: () => void }) => (
    <div className="bg-white rounded-lg shadow-md text-center relative overflow-hidden group">
        <img src={profile.image_url || 'https://placehold.co/200x200'} alt={profile.name} className="w-full h-32 object-cover" />
        <div className="p-3">
            <h3 className="font-bold text-gray-800 truncate">{profile.name}</h3>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                <button onClick={onMatch} className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-green-500 text-white font-semibold rounded-full transition-opacity transform group-hover:scale-110">
                    Match!
                </button>
            </div>
        </div>
    </div>
);

export default function LikesYouPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [likers, setLikers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // This fetches the profiles of users who have liked the current user
    const fetchLikers = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('likes')
            .select('profiles_liker:profiles!likes_liker_id_fkey(*)') // Correctly fetches the full profile of the liker
            .eq('liked_id', userId);

        if (error) {
            toast.error("Could not load users who liked you.");
        } else {
            // Extract the profile data from the nested structure
            const profilesWhoLiked = data?.map(like => like.profiles_liker).filter(Boolean) || [];
            setLikers(profilesWhoLiked);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const fetchUserAndLikers = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                fetchLikers(user.id);
            } else {
                router.push('/login');
            }
        };
        fetchUserAndLikers();
    }, [supabase, fetchLikers, router]);
    
    const handleMatch = async (likerId: string) => {
        if (!user) return;
        
        const { data, error } = await supabase.rpc('create_like_and_check_match', {
            liker_id_param: user.id,
            liked_id_param: likerId
        });
        
        if (error) {
            toast.error("Could not create match.");
        } else if (data) {
            toast.success("It's a Match! You can now chat.");
            setLikers(prev => prev.filter(l => l.id !== likerId));
        }
    };
    
    if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading your admirers...</p></div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-7xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Interested In You</h1>
                {likers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {likers.map(profile => (
                            <LikedYouCard 
                                key={profile.id} 
                                profile={profile} 
                                onMatch={() => handleMatch(profile.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                         <p className="text-gray-500">No new likes right now. Check back soon!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
// src/app/results/page.tsx

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

// A simple display card for a potential roommate profile
const ProfileCard = ({ profile, onLike, onDismiss }: { profile: any, onLike: () => void, onDismiss: () => void }) => (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-green-500 w-full max-w-sm">
        <img src={profile.image_url || 'https://placehold.co/128x128/EFEFEF/CCCCCC?text=User'} alt={profile.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200" />
        <h2 className="text-3xl font-bold">{profile.name || 'User'}, {profile.age || 'N/A'}</h2>
        <p className="text-gray-500 capitalize">{profile.role}</p>
        <div className="flex justify-center gap-4 mt-8">
            <button onClick={onDismiss} className="px-8 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-transform transform hover:scale-105">Not Interested</button>
            <button onClick={onLike} className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-transform transform hover:scale-105">Interested</button>
        </div>
    </div>
);


export default function ResultsPage() {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPotentials = useCallback(async (role: string, userId: string) => {
        const targetRole = role === 'seeker' ? 'lister' : 'seeker';
        
        // In a real app, this should be a secure API route call.
        // This RPC call would fetch profiles NOT liked by the current user.
        const { data, error } = await supabase
            .rpc('get_potential_matches', { current_user_id: userId, target_role: targetRole });

        if (error) {
            toast.error("Could not load potential matches.");
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const fetchUserAndProfiles = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile?.role) {
                    fetchPotentials(profile.role, user.id);
                } else {
                    setLoading(false); // No role set, stop loading
                }
            } else {
                setLoading(false); // No user, stop loading
            }
        };
        fetchUserAndProfiles();
    }, [supabase, fetchPotentials]);

    const handleLike = async (likedUserId: string) => {
        if (!user) return;
        
        // This should be a secure API route: POST /api/like
        // The RPC function atomically creates a like and checks for a match.
        const { data: isMatch, error } = await supabase.rpc('create_like_and_check_match', {
            liker_id_param: user.id,
            liked_id_param: likedUserId
        });

        if (error) {
            toast.error("Something went wrong. Please try again.");
        } else if (isMatch) {
            toast.success("It's a Match! You can now chat.");
        } else {
            toast.success("Interest sent!");
        }
        
        // Move to the next profile regardless of outcome
        setCurrentIndex(prev => prev + 1);
    };
    
    const handleDismiss = () => {
        // SOLUTION: This only increments the local index. It's not a permanent action.
        toast("Skipped for now.", { icon: '👍' });
        setCurrentIndex(prev => prev + 1);
    };

    const currentProfile = profiles.length > 0 && currentIndex < profiles.length ? profiles[currentIndex] : null;

    if (loading) {
        return <p className="text-center p-10">Finding potential matches...</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <Toaster position="top-center" />
            {currentProfile ? (
                <ProfileCard 
                    profile={currentProfile}
                    onLike={() => handleLike(currentProfile.id)}
                    onDismiss={handleDismiss}
                />
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold">All caught up!</h2>
                    <p className="text-gray-600 mt-2">No more profiles to show right now. Check back later!</p>
                </div>
            )}
        </div>
    );
}
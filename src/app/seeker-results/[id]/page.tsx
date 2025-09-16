// File: app/seeker-results/[id]/page.tsx
// FINAL, DEFINITIVE VERSION: A detailed view of a Lister's profile, now with
// a functional "Interested" button and the "Compatibility Score".

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import { useParams, useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";

// A new UI component for the compatibility score
const CompatibilityScore = ({ score }: { score: number }) => {
    const color = score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';
    const ringColor = score > 70 ? 'ring-green-500' : score > 40 ? 'ring-yellow-500' : 'ring-red-500';
    return (
        <div className={`relative h-24 w-24 rounded-full flex flex-col items-center justify-center bg-gray-50 shadow-inner ring-4 ring-offset-4 ring-offset-gray-50 ${ringColor}`}>
            <span className={`font-bold text-4xl ${color}`}>{score}</span>
            <span className="text-xs text-gray-500 font-semibold -mt-1">% Match</span>
        </div>
    );
};

export default function ListerDetailPage() {
    const supabase = useMemo(() => createClient(), []);
    const params = useParams();
    const router = useRouter();
    const profileId = params.id as string;
    
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [compatibilityScore, setCompatibilityScore] = useState<number>(0);

    const getProfileData = useCallback(async (currentUserId: string) => {
        if (!profileId || !currentUserId) return;
        
        // Fetch the profile and the compatibility score in parallel for performance
        const [profilePromise, scorePromise] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', profileId).single(),
            supabase.rpc('calculate_compatibility', {
                user1_id: currentUserId,
                user2_id: profileId,
            })
        ]);

        if (profilePromise.error) {
            toast.error("Could not load this profile.");
            console.error("Profile Fetch Error:", profilePromise.error);
        } else {
            setProfile(profilePromise.data);
        }

        if (scorePromise.error) {
            console.error("Score Calculation Error:", scorePromise.error);
        } else {
            setCompatibilityScore(scorePromise.data);
        }
        
        setLoading(false);
    }, [supabase, profileId]);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                getProfileData(user.id);
            } else {
                router.push('/login');
            }
        };
        fetchInitialData();
    }, [getProfileData, router, supabase.auth]);

    const handleReportUser = async () => {
        const toastId = toast.loading("Submitting report...");
        const response = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reported_user_id: profileId }) });
        const data = await response.json();
        toast.dismiss(toastId);
        if (response.ok) toast.success(data.message || "Report submitted.");
        else toast.error(data.error || "Failed to submit report.");
    };

    const handleLike = async () => {
        const toastId = toast.loading("Sending interest...");
        const response = await fetch('/api/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liked_id: profileId }) });
        toast.dismiss(toastId);
        if (response.ok) {
            const { matchCreated } = await response.json();
            if (matchCreated) {
                toast.success("It's a Match! You can now chat.");
            } else {
                toast.success("Interest sent!");
            }
        } else {
            toast.error("Could not send interest.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center"><p>Profile not found.</p></div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-4xl mx-auto py-12 px-4">
                 <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-8 md:col-span-1 flex flex-col items-center justify-around bg-gray-50 space-y-6">
                            <div className="text-center">
                                <img src={profile.image_url || 'https://placehold.co/150x150'} alt={profile.name || 'User profile'} className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"/>
                                <h1 className="text-3xl font-bold text-gray-800 mt-4">{profile.name}, {profile.age}</h1>
                                <p className="text-gray-500 text-md mt-1">{profile.organization}</p>
                            </div>
                            <CompatibilityScore score={compatibilityScore} />
                        </div>
                        <div className="p-8 md:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-800">About Me</h2>
                            <p className="text-gray-600 mt-2 whitespace-pre-wrap">{profile.description || "No description provided."}</p>
                            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                                <p><strong className="text-gray-500 block">Diet:</strong> {profile.diet || 'N/A'}</p>
                                <p><strong className="text-gray-500 block">Drinks:</strong> {profile.drinks ? 'Yes' : 'No'}</p>
                                <p><strong className="text-gray-500 block">Smokes:</strong> {profile.smokes ? 'Yes' : 'No'}</p>
                                <p><strong className="text-gray-500 block">Pets:</strong> {profile.has_pets ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                    {profile.flat_image_urls && profile.flat_image_urls.length > 0 && (
                        <div className="p-8 border-t border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">The Space</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.flat_image_urls.map((url: string, index: number) => (
                                    <img key={index} src={url} alt={`Flat photo ${index + 1}`} className="w-full h-40 object-cover rounded-lg shadow-md"/>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                         <button onClick={handleLike} className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors">
                            Show Interest
                         </button>
                         <button onClick={handleReportUser} className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                            Report this user
                         </button>
                    </div>
                 </div>
            </main>
        </div>
    );
}
// File: app/roommate-results/page.tsx
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import SeekerProfileCard from "@/components/seekerProfileCard";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";

export default function RoommateResultsPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRankedSeekers = useCallback(async (currentUserId: string) => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_ranked_profiles', { current_user_id: currentUserId });
        if (error) {
            toast.error("Could not load roommates.");
            console.error("RPC Error:", error);
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                fetchRankedSeekers(user.id);
            } else {
                router.push('/');
            }
        };
        fetchUser();
    }, [supabase, router, fetchRankedSeekers]);

    const handleDismiss = async (dismissedUserId: string) => {
        setProcessingId(dismissedUserId);
        setProfiles(prev => prev.filter(p => p.id !== dismissedUserId));
        await fetch('/api/dismiss', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dismissed_id: dismissedUserId }) });
        setProcessingId(null);
    };
    
    const handleLike = async (likedUserId: string) => {
        setProcessingId(likedUserId);
        const response = await fetch('/api/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liked_id: likedUserId }) });
        if (response.ok) {
            const { matchCreated } = await response.json();
            toast.success(matchCreated ? "It's a Match!" : "Interest sent!");
            setProfiles(prev => prev.filter(p => p.id !== likedUserId));
        } else { 
            toast.error("Something went wrong."); 
        }
        setProcessingId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-screen-xl mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Top Roommate Matches</h1>
                {loading ? <p>Finding roommates...</p> : profiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {profiles.map(profile => (<SeekerProfileCard key={profile.id} profile={profile} onLike={handleLike} onDismiss={handleDismiss} isProcessing={processingId === profile.id}/>))}
                    </div>
                ) : <EmptyState title="No Roommates Found" message="We couldn't find any compatible seekers right now." />}
            </main>
        </div>
    );
}
// File: app/roommate-results/page.tsx
// FINAL, COMPLETE, AND FUNCTIONAL VERSION.

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import SeekerProfileCard from "@/components/seekerProfileCard";
import EmptyState from "@/components/EmptyState";
import FilterSidebar, { type Filters } from "@/components/FilterSidebar";
import { useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";

export default function RoommateResultsPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Filters | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchSeekers = useCallback(async (currentUserId: string, filters: Filters) => {
        setLoading(true);
        let query = supabase.from('profiles').select('*').eq('role', 'seeker').neq('id', currentUserId);

        if (filters?.city && typeof filters.city === 'string' && filters.city.trim() !== '') {
            query = query.ilike('city', `%${filters.city.trim()}%`);
        }
        if (filters?.drinks !== null) query = query.eq('drinks', filters.drinks);
        if (filters?.smokes !== null) query = query.eq('smokes', filters.smokes);
        if (filters?.diet) query = query.eq('diet', filters.diet);
        if (filters?.has_pets !== null) query = query.eq('has_pets', filters.has_pets);
        
        query = query.order(filters?.sortBy || 'created_at', { 
            ascending: filters?.sortBy === 'preferences->>budget', 
            nullsFirst: false 
        });
        
        const { data, error } = await query;
        if (error) {
            toast.error("Could not load potential roommates.");
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
            } else { 
                router.push('/login'); 
            }
        };
        fetchUser();
    }, [supabase, router]);

    useEffect(() => {
        if (user && activeFilters) {
            fetchSeekers(user.id, activeFilters);
        }
    }, [user, activeFilters, fetchSeekers]);

    const handleApplyFilters = (filters: Filters) => {
        setActiveFilters(filters);
    };
    
    const handleDismiss = (profileId: string) => {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
    };
    
    const handleLike = async (likedUserId: string) => {
        setProcessingId(likedUserId);
        const response = await fetch('/api/like', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ liked_id: likedUserId }) 
        });
        if (response.ok) {
            const { matchCreated } = await response.json();
            toast.success(matchCreated ? "It's a Match! You can now chat." : "Interest sent!");
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
            <main className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar onApplyFilters={handleApplyFilters} isSeekerPage={false} />
                    <div className="w-full">
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">Potential Roommates</h1>
                        {loading ? (
                            <div className="text-center text-gray-500 py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4">Finding potential roommates...</p>
                            </div>
                        ) : profiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {profiles.map(profile => (
                                    <SeekerProfileCard 
                                        key={profile.id} 
                                        profile={profile} 
                                        onLike={handleLike} 
                                        onDismiss={handleDismiss} 
                                        isProcessing={processingId === profile.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                title="No Roommates Found" 
                                message="Try adjusting your filters or check back later for new seekers." 
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
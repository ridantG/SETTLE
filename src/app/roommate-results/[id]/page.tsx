// File: app/roommate-results/page.tsx
// FINAL, CORRECTED, AND COMPLETE VERSION
// This is the main results page for Listers. It correctly integrates the
// filter sidebar and displays a filterable grid of Seeker profiles.

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import SeekerProfileCard from "@/components/seekerProfileCard";
import EmptyState from "@/components/EmptyState";
import FilterSidebar, { type Filters } from "@/components/FilterSidebar"; // Correctly import your component
import { useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";

export default function RoommateResultsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSeekers = useCallback(async (currentUserId: string, filters: Filters) => {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('*, preferences (budget)')
            .eq('role', 'seeker')
            .neq('id', currentUserId);

        // Dynamically apply filters from the sidebar
        if (filters.city.trim()) query = query.ilike('city', `%${filters.city.trim()}%`);
        if (filters.drinks !== null) query = query.eq('drinks', filters.drinks);
        if (filters.smokes !== null) query = query.eq('smokes', filters.smokes);
        if (filters.diet) query = query.eq('diet', filters.diet);
        if (filters.has_pets !== null) query = query.eq('has_pets', filters.has_pets);
        
        // Apply sorting
        query = query.order(filters.sortBy, { 
            ascending: filters.sortBy === 'preferences->>budget', 
            nullsFirst: false 
        });
        
        const { data, error } = await query;
        if (error) {
            toast.error("Could not load potential roommates.");
            console.error("Fetch Error:", error);
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Initial fetch with no filters
                fetchSeekers(user.id, {} as Filters);
            } else {
                router.push('/login');
            }
        };
        fetchInitialData();
    }, [supabase, fetchSeekers, router]);

    const handleApplyFilters = (filters: Filters) => {
        if (user) {
            fetchSeekers(user.id, filters);
        }
    };
    
    const handleAction = (profileId: string) => setProfiles(prev => prev.filter(p => p.id !== profileId));
    
    const handleLike = async (likedUserId: string) => {
        const response = await fetch('/api/like', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ liked_id: likedUserId }) 
        });
        if (response.ok) {
            const { matchCreated } = await response.json();
            toast.success(matchCreated ? "It's a Match! You can now chat." : "Interest sent!");
        } else { 
            toast.error("Something went wrong."); 
        }
        handleAction(likedUserId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Column */}
                    <FilterSidebar onApplyFilters={handleApplyFilters} isSeekerPage={false} />
                    
                    {/* Results Column */}
                    <div className="w-full">
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">Potential Roommates</h1>
                        {loading ? (
                            <p className="text-center text-gray-500 py-20">Finding potential roommates...</p>
                        ) : profiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {profiles.map(profile => (
                                    <SeekerProfileCard 
                                        key={profile.id} 
                                        profile={profile} 
                                        onLike={handleLike} 
                                        onDismiss={handleAction} 
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
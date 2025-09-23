// File: app/seeker-results/SeekerResultsClient.tsx
// FINAL VERSION: This Client Component handles the UI and user interactions.

"use client";

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ListerProfileCard from "@/components/listerProfileCard";
import EmptyState from "@/components/EmptyState";
import FilterSidebar from "@/components/FilterSidebar";

export default function SeekerResultsClient({ initialProfiles }: { initialProfiles: any[] }) {
    const [profiles, setProfiles] = useState(initialProfiles);
    const [processingId, setProcessingId] = useState<string | null>(null);

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
            toast.success(matchCreated ? "It's a Match!" : "Interest sent!");
            handleDismiss(likedUserId);
        } else {
            toast.error("Something went wrong.");
        }
        setProcessingId(null);
    };

    return (
        <>
            <Toaster position="top-center" />
            <FilterSidebar isSeekerPage={true} />
            <div className="w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Listings</h1>
                {profiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {profiles.map(profile => (
                            <ListerProfileCard
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
                        title="No Listings Found"
                        message="Try adjusting your filters or check back later."
                    />
                )}
            </div>
        </>
    );
}
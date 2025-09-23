// File: src/components/seekerProfileCard.tsx
// FINAL VERSION: The entire card is now a correctly functioning link.

"use client";

import React from 'react';
import Link from 'next/link'; // Import Link

type Profile = { id: string; name: string | null; age: number | null; image_url: string | null; organization: string | null; status: string | null; description: string | null; preferences: { budget?: number; city?: string } | null; compatibility_score?: number; };
type CardProps = { profile: Profile; onLike: (profileId: string) => void; onDismiss: (profileId: string) => void; isProcessing: boolean; };

export default function SeekerProfileCard({ profile, onLike, onDismiss, isProcessing }: CardProps) {
    return (
        <Link href={`/roommate-results/${profile.id}`} className="block h-full">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full text-center group transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="p-6"><img src={profile.image_url || 'https://placehold.co/128x128'} alt={profile.name || 'User profile picture'} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-md"/></div>
                <div className="px-6 pb-6 flex-grow flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">{profile.name || 'User'}, {profile.age || 'N/A'}</h2>
                    <p className="text-md text-gray-600 capitalize">{profile.status} at {profile.organization}</p>
                    {profile.preferences?.budget && (<p className="text-lg font-semibold text-green-600 mt-4">Budget: ₹{profile.preferences.budget.toLocaleString()}</p>)}
                    <p className="text-gray-500 mt-4 flex-grow text-sm">{profile.description ? `"${profile.description.substring(0, 100)}..."` : 'No description provided.'}</p>
                    <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
                        <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDismiss(profile.id); }} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 disabled:opacity-50">Not Interested</button>
                        <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onLike(profile.id); }} className="px-8 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 disabled:opacity-50">{isProcessing ? '...' : 'Interested'}</button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
// File: src/components/ProfileCard.tsx
// A reusable, production-ready component for displaying user profiles.

"use client";

import React from 'react';

// Define the shape of the data this component expects
type Profile = {
    id: string;
    name: string | null;
    age: number | null;
    image_url: string | null;
    organization: string | null;
    status: string | null;
    description: string | null;
};

type ProfileCardProps = {
    profile: Profile;
    onLike: (profileId: string) => void;
    onDismiss: (profileId: string) => void;
};

export default function ProfileCard({ profile, onLike, onDismiss }: ProfileCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full">
            <img 
                src={profile.image_url || 'https://placehold.co/400x300/EFEFEF/CCCCCC?text=Settle'} 
                alt={profile.name || 'User profile picture'}
                className="w-full h-48 object-cover"
            />
            <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800">{profile.name || 'User'}, {profile.age || 'N/A'}</h2>
                <p className="text-md text-gray-600 capitalize">{profile.organization || profile.status || 'No details yet'}</p>
                <p className="text-gray-500 mt-4 flex-grow">
                    {profile.description ? `${profile.description.substring(0, 100)}...` : 'No description provided.'}
                </p>
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => onDismiss(profile.id)} 
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors"
                    >
                        Not Interested
                    </button>
                    <button 
                        onClick={() => onLike(profile.id)} 
                        className="px-8 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors"
                    >
                        Interested
                    </button>
                </div>
            </div>
        </div>
    );
}
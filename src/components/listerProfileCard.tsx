// File: src/components/listerProfileCard.tsx
// FINAL VERSION: The entire card is now a correctly functioning link.

"use client";

import React from 'react';
import Link from 'next/link'; // Import Link

type Profile = { id: string; name: string | null; age: number | null; image_url: string | null; organization: string | null; description: string | null; flat_image_urls: string[] | null; compatibility_score?: number; };
type CardProps = { profile: Profile; onLike: (profileId: string) => void; onDismiss: (profileId: string) => void; isProcessing: boolean; };

export default function ListerProfileCard({ profile, onLike, onDismiss, isProcessing }: CardProps) {
    const [currentImage, setCurrentImage] = React.useState(0);
    const images = profile.flat_image_urls?.length ? profile.flat_image_urls : ['https://placehold.co/400x300/EFEFEF/CCCCCC?text=Settle'];
    
    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation(); e.preventDefault(); // Prevent link navigation
        setCurrentImage((prev) => (prev + 1) % images.length);
    };

    return (
        // THE FIX IS HERE: The entire card is wrapped in a Link component.
        <Link href={`/seeker-results/${profile.id}`} className="block h-full">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full group transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="relative h-48" style={{ cursor: images.length > 1 ? 'pointer' : 'default' }}>
                    <img src={images[currentImage]} alt={profile.name ? `${profile.name}'s flat` : 'A flat available for rent'} className="w-full h-full object-cover"/>
                    {images.length > 1 && <div onClick={handleNextImage} className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">{`${currentImage + 1} / ${images.length}`}</div>}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center mb-4"><img src={profile.image_url || 'https://placehold.co/48x48'} alt={profile.name || 'User profile picture'} className="w-12 h-12 rounded-full object-cover mr-4" /><div><h2 className="text-xl font-bold text-gray-800">{profile.name}, {profile.age}</h2><p className="text-sm text-gray-600">{profile.organization}</p></div></div>
                    <p className="text-gray-500 mt-2 flex-grow text-sm">{profile.description ? `${profile.description.substring(0, 90)}...` : 'No description provided.'}</p>
                    <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
                        {/* The buttons now prevent the link from firing when clicked. */}
                        <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDismiss(profile.id); }} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 disabled:opacity-50">Not Interested</button>
                        <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onLike(profile.id); }} className="px-8 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 disabled:opacity-50">{isProcessing ? '...' : 'Interested'}</button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
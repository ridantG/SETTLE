// File: app/rentals/[id]/ContactSellerButton.tsx
// FINAL, CORRECTED VERSION: Now includes the missing 'Link' import.

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link'; // <-- THE FIX IS HERE

export default function ContactSellerButton({ ownerId, currentUserId }: { ownerId: string, currentUserId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // If the user is viewing their own ad, show a link to manage it.
    if (ownerId === currentUserId) {
        return (
            <Link href="/preferences" className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg text-center">
                Manage Your Listing
            </Link>
        );
    }

    const handleClick = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Connecting you to the seller...");

        const response = await fetch('/api/rentals/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner_id: ownerId })
        });

        toast.dismiss(toastId);
        if (!response.ok) {
            toast.error("Failed to start a chat. Please try again.");
            setIsLoading(false);
            return;
        }

        const { match_id } = await response.json();
        if (match_id) {
            toast.success("Chat created! Redirecting...");
            router.push(`/chat/${match_id}`);
        } else {
            toast.error("Could not find or create a chat room.");
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={isLoading}
            className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
            {isLoading ? "Connecting..." : "Contact Seller"}
        </button>
    );
}
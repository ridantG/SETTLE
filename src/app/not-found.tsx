// File: app/not-found.tsx
// FINAL, DEFINITIVE, AND INTELLIGENT VERSION
// This page now checks the user's auth status and provides a relevant link back to safety.

"use client";

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';

// A simple, inline SVG icon for the page
const NotFoundIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function NotFound() {
    const supabase = useMemo(() => createClient(), []);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // This effect runs on the client to check if the user is logged in.
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
            }
            setLoading(false);
        };
        checkSession();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-lg mx-auto">
                <NotFoundIcon />
                <h1 className="mt-8 text-6xl font-extrabold text-gray-800">404</h1>
                <h2 className="mt-4 text-3xl font-bold text-gray-800">Page Not Found</h2>
                <p className="mt-4 text-lg text-gray-600">
                    Sorry, we couldn't find the page you were looking for. It might have been moved, deleted, or you may have typed the address incorrectly.
                </p>
                <div className="mt-10">
                    {/* The "smart" button now directs the user to the correct location. */}
                    {!loading && (
                        <Link
                            href={isLoggedIn ? "/dashboard" : "/"}
                            className="inline-block px-8 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-lg"
                        >
                            {isLoggedIn ? "Go to My Dashboard" : "Go to Homepage"}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
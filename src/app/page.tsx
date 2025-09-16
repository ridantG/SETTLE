// File: app/page.tsx
// FINAL, CORRECTED VERSION: Now correctly imports the useEffect hook from React.

"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; // <-- THE FIX IS HERE

// A simple, inline SVG icon for the Google button.
const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.971,36.216,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

// Inline SVG icons for feature highlights
const SmartMatchingIcon = () => <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6a2 2 0 11-4 0 2 2 0 014 0zM12 18a2 2 0 11-4 0 2 2 0 014 0zM12 6V3m0 18v-3" /></svg>;
const VerifiedProfilesIcon = () => <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618z" /></svg>;
const SeamlessCommsIcon = () => <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;


export default function LandingPage() {
    const supabase = createClient();
    const router = useRouter();

    const handleGoogleAuth = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Google Auth Error:', error.message);
        }
    };

    // This effect listens for when a user successfully signs in
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                router.push('/dashboard');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-xl w-full text-center bg-white p-8 sm:p-12 rounded-2xl shadow-2xl">
                
                <h1 className="text-6xl font-extrabold text-gray-800 tracking-wider">
                    <span className="text-green-600">Set</span>tle
                </h1>
                
                <h2 className="mt-4 text-3xl font-bold text-gray-700">
                    Welcome to Settle
                </h2>
                <p className="mt-2 text-lg text-gray-500">
                    Find Your Place. Find Your People.
                </p>

                <div className="mt-10">
                    <button
                        onClick={handleGoogleAuth}
                        className="w-full flex items-center justify-center gap-4 bg-blue-500 text-white font-semibold py-4 px-6 rounded-lg text-lg hover:bg-blue-600 transition-colors"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <SmartMatchingIcon />
                    <h3 className="mt-4 font-bold text-lg">Smart Matching</h3>
                    <p className="mt-1 text-sm text-gray-600">Our algorithm helps you find roommates based on lifestyle and compatibility.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <VerifiedProfilesIcon />
                    <h3 className="mt-4 font-bold text-lg">Verified Profiles</h3>
                    <p className="mt-1 text-sm text-gray-600">Safety is our priority. Connect with users you can trust.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <SeamlessCommsIcon />
                    <h3 className="mt-4 font-bold text-lg">Seamless Communication</h3>
                    <p className="mt-1 text-sm text-gray-600">Chat with your matches directly on our secure platform.</p>
                </div>
            </div>
        </div>
    );
}
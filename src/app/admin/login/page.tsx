// File: app/admin/login/page.tsx
// The definitive, secure login page for the Settle Admin Panel.

"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// A simple, inline SVG icon for the Google button for self-containment.
const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.971,36.216,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export default function AdminLoginPage() {
    const supabase = createClient();
    const router = useRouter();

    const handleAdminGoogleAuth = async () => {
        // This function initiates the secure OAuth flow with Google.
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // After logging in with Google, the user is sent to a special callback URL.
                // The '?next=' parameter tells the callback where to send the user *after*
                // the session is finalized: our secure admin dashboard.
                redirectTo: `${location.origin}/auth/callback?next=/admin/dashboard`,
            },
        });

        if (error) {
            // In a real app, you would show a toast notification here.
            console.error('Admin Auth Error:', error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full text-center bg-white p-10 rounded-xl shadow-lg">
                <Link href="/" className="text-4xl font-bold text-gray-800 tracking-wider">
                    <span className="text-green-600">Set</span>tle
                </Link>
                <h2 className="mt-2 text-2xl font-semibold text-gray-600">Admin Portal</h2>
                <p className="mt-4 text-gray-500">
                    Please sign in with an authorized Google account to continue.
                </p>
                <div className="mt-8">
                    <button
                        onClick={handleAdminGoogleAuth}
                        className="w-full flex items-center justify-center gap-4 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg text-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <GoogleIcon />
                        Sign In with Google
                    </button>
                </div>
            </div>
        </div>
    );
}

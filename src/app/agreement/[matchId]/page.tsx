// File: app/agreement/[matchId]/page.tsx
// The final, complete page for the Settle Agreement questionnaire.

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import { useRouter, useParams } from "next/navigation";

// Define the shape of the agreement answers
type AgreementResponses = {
    cleaningScale: number;
    cleaningFrequency: string;
    guestPolicy: string;
    noiseLevel: string;
    sharedItems: string;
};

export default function AgreementPage() {
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();
    const matchId = params.matchId as string;

    const [user, setUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [responses, setResponses] = useState<AgreementResponses>({
        cleaningScale: 3,
        cleaningFrequency: '',
        guestPolicy: '',
        noiseLevel: '',
        sharedItems: ''
    });

    const isFormComplete = responses.cleaningFrequency && responses.guestPolicy && responses.noiseLevel && responses.sharedItems;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormComplete) {
            toast.error("Please answer all questions to proceed.");
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading("Submitting your agreement...");
        const response = await fetch(`/api/agreements/${matchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ responses }),
        });
        toast.dismiss(toastId);
        if (response.ok) {
            toast.success("Agreement submitted! Waiting for your match...");
            router.push('/chat'); // Redirect to the main chat list
        } else {
            toast.error("Failed to submit. Please try again.");
        }
        setIsSaving(false);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/login');
            setUser(user);
        };
        getUser();
    }, [supabase, router]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-2xl mx-auto py-12 px-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">The Settle Agreement</h1>
                    <p className="mt-3 text-lg text-gray-600">Let's align on a few key things to ensure a harmonious home. Answer honestly to finalize your match.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-10 bg-white p-8 rounded-2xl shadow-xl space-y-8">
                    {/* Cleaning Section */}
                    <div>
                        <h3 className="text-xl font-semibold">1. Cleaning Habits</h3>
                        <div className="mt-4 space-y-4">
                            <label className="block text-sm font-medium">On a scale of 1 (Relaxed) to 5 (Spotless), what is your definition of "clean"?</label>
                            <input type="range" min="1" max="5" value={responses.cleaningScale} onChange={(e) => setResponses(r => ({...r, cleaningScale: parseInt(e.target.value)}))} className="w-full" />
                            <div className="flex justify-between text-xs text-gray-500"><span>Relaxed</span><span>Spotless</span></div>
                            
                            <label className="block text-sm font-medium">How often should common areas (kitchen, living room) be cleaned?</label>
                            <select value={responses.cleaningFrequency} onChange={(e) => setResponses(r => ({...r, cleaningFrequency: e.target.value}))} className="w-full p-2 border rounded-md">
                                <option value="" disabled>Select frequency...</option>
                                <option>Daily Tidying</option>
                                <option>Weekly Deep Clean</option>
                                <option>Bi-weekly Deep Clean</option>
                            </select>
                        </div>
                    </div>
                     {/* Guests Section */}
                    <div>
                        <h3 className="text-xl font-semibold">2. Guest Policy</h3>
                        <label className="block text-sm font-medium mt-4">What's your policy on overnight guests?</label>
                        <select value={responses.guestPolicy} onChange={(e) => setResponses(r => ({...r, guestPolicy: e.target.value}))} className="w-full p-2 border rounded-md mt-2">
                            <option value="" disabled>Select policy...</option>
                            <option>Never</option>
                            <option>Weekends only, with notice</option>
                            <option>Anytime, with advance notice</option>
                            <option>Open door policy</option>
                        </select>
                    </div>
                     {/* Noise Level Section */}
                    <div>
                        <h3 className="text-xl font-semibold">3. Home Environment</h3>
                        <label className="block text-sm font-medium mt-4">What is your ideal home environment?</label>
                        <select value={responses.noiseLevel} onChange={(e) => setResponses(r => ({...r, noiseLevel: e.target.value}))} className="w-full p-2 border rounded-md mt-2">
                            <option value="" disabled>Select environment...</option>
                            <option>A quiet sanctuary</option>
                            <option>Occasional music/friends over</option>
                            <option>Always social and lively</option>
                        </select>
                    </div>
                     {/* Shared Items Section */}
                    <div>
                        <h3 className="text-xl font-semibold">4. Shared Items</h3>
                        <label className="block text-sm font-medium mt-4">How should shared groceries (milk, oil, etc.) be handled?</label>
                        <select value={responses.sharedItems} onChange={(e) => setResponses(r => ({...r, sharedItems: e.target.value}))} className="w-full p-2 border rounded-md mt-2">
                            <option value="" disabled>Select method...</option>
                            <option>We each buy our own</option>
                            <option>We use a communal pot and split the cost</option>
                            <option>We can figure it out as we go</option>
                        </select>
                    </div>
                    <div className="pt-6">
                        <button type="submit" disabled={!isFormComplete || isSaving} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600 disabled:opacity-50">
                            {isSaving ? "Submitting..." : "Agree & Finalize Match"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
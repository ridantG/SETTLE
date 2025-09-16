// File: app/dashboard/DashboardClient.tsx
// FINAL, RESTORED VERSION: The complete interactive UI for the dashboard,
// with the Founder's Corner and "How It Works" sections restored.

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import toast, { Toaster } from "react-hot-toast";

// --- Reusable Card & Icon Components ---
const FeatureCard = ({ onClick, title, description, icon }: { onClick: () => void, title: string, description: string, icon: React.ReactNode }) => (
    <div onClick={onClick} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 group h-full flex flex-col text-center cursor-pointer">
        <div className="mx-auto mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{title}</h3>
        <p className="mt-2 text-gray-500 flex-grow">{description}</p>
    </div>
);
const HowItWorksCard = ({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) => ( <div className="text-center"><div className="mx-auto mb-6 bg-green-100 rounded-full h-20 w-20 flex items-center justify-center relative">{icon}<span className="absolute -top-2 -left-2 h-10 w-10 bg-green-500 text-white font-bold text-xl rounded-full flex items-center justify-center border-4 border-white">{number}</span></div><h3 className="text-xl font-bold text-gray-800">{title}</h3><p className="mt-2 text-gray-600">{description}</p></div> );
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ForumIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const TiffinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
const Step1Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const Step2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const Step3Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z" /></svg>;

type DashboardClientProps = {
    user: User;
    profile: { name: string | null; age: number | null; gender: string | null; city: string | null; role: string | null; } | null;
};

export default function DashboardClient({ user, profile }: DashboardClientProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleNavigation = async (role: 'seeker' | 'lister', destination: string) => {
        const toastId = toast.loading("Setting your role...");
        const { data: updatedProfile, error } = await supabase.from('profiles').update({ role: role }).eq('id', user.id).select().single();
        toast.dismiss(toastId);
        if (error) { toast.error("Could not save your choice."); return; }
        const isProfileComplete = updatedProfile && updatedProfile.age && updatedProfile.gender && updatedProfile.city;
        if (isProfileComplete) router.push(destination);
        else router.push(`/onboarding?next=${destination}`);
    };

    return (
        <main>
            <Toaster position="top-center" />
            <div className="bg-gray-50 text-center py-20 pt-32 sm:pt-40">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">Welcome, {profile?.name || 'User'}!</h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">What are you looking to do today?</p>
            </div>

            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard onClick={() => handleNavigation('lister', '/roommate-results')} title="Find a Roommate" description="List your space and discover compatible people." icon={<UsersIcon />} />
                    <FeatureCard onClick={() => handleNavigation('seeker', '/seeker-results')} title="Find a Room" description="Browse listings to find your ideal home." icon={<HomeIcon />} />
                    <FeatureCard onClick={() => router.push('/forum')} title="Community Forum" description="Connect with the Settle community." icon={<ForumIcon />} />
                    <FeatureCard onClick={() => router.push('/tiffin')} title="Tiffin Service" description="Home-cooked meals, delivered. Coming Soon!" icon={<TiffinIcon />} />
                </div>
            </div>
                
            {/* RESTORED: The Founder's Corner Section */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-12 rounded-2xl shadow-lg">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/3 text-center">
                                <img src="/founder.jpeg" alt="Ridant Gunjar, Founder of Settle" className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-white shadow-2xl"/>
                                <h3 className="mt-6 text-2xl font-bold text-gray-900">Ridant Gunjar</h3>
                                <p className="text-gray-500">Founder of Settle</p>
                            </div>
                            <div className="md:w-2/3">
                                <h2 className="text-3xl font-bold text-gray-800">A Note from the Founder</h2>
                                <blockquote className="mt-4 text-lg text-gray-600 italic border-l-4 border-green-500 pl-6">"Finding a home has become a game of chance and risk. We're changing the rules. Settle was built to eliminate the uncertainty from one of life's most important decisions. Our commitment is to a community built on trust, deep compatibility, and the simple idea that your home should be a source of strength, not stress. This is the new standard for co-living. Welcome."</blockquote>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESTORED: The "How Settle Works" Section */}
            <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900">How Settle Works</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">Your simple, safe path to a great living situation in just three steps.</p>
                </div>
                <div className="mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                        <HowItWorksCard number="1" title="Create Your Profile" description="Tell us about your lifestyle, habits, and what you're looking for." icon={<Step1Icon/>} />
                        <HowItWorksCard number="2" title="Discover Matches" description="Our smart algorithm and detailed filters show you the most compatible people." icon={<Step2Icon/>} />
                        <HowItWorksCard number="3" title="Connect Securely" description="Chat with your matches directly on our secure platform." icon={<Step3Icon/>} />
                    </div>
                </div>
            </div>
        </main>
    );
}
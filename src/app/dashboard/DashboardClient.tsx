// File: src/app/dashboard/DashboardClient.tsx
// FINAL VERSION: Handles Role Selection, UI Display, and Smart Redirection.

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- UI Components ---
const FeatureCard = ({ onClick, title, description, icon }: { onClick: () => void, title: string, description: string, icon: React.ReactNode }) => (
    <div onClick={onClick} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 group h-full flex flex-col text-center cursor-pointer border border-gray-100">
        <div className="mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{title}</h3>
        <p className="mt-2 text-gray-500 flex-grow">{description}</p>
    </div>
);

const HowItWorksCard = ({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) => (
    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="mx-auto mb-6 bg-green-50 rounded-full h-20 w-20 flex items-center justify-center relative">
            {icon}
            <span className="absolute -top-2 -left-2 h-8 w-8 bg-green-500 text-white font-bold text-lg rounded-full flex items-center justify-center border-2 border-white">{number}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600 leading-relaxed">{description}</p>
    </div>
);

// --- Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ForumIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
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

    // The Logic: Set Role -> Check Profile -> Redirect
    const handleNavigation = async (role: 'seeker' | 'lister', destination: string) => {
        const toastId = toast.loading("Setting your preferences...");
        
        try {
            // 1. Save the role selection to Supabase
            const { data: updatedProfile, error } = await supabase
                .from('profiles')
                .update({ role: role })
                .eq('id', user.id)
                .select()
                .single();
            
            if (error) throw error;

            toast.dismiss(toastId);

            // 2. Check if the user is fully onboarded
            // We check against the UPDATED profile we just got back
            const isProfileComplete = updatedProfile && updatedProfile.age && updatedProfile.gender && updatedProfile.city;

            if (isProfileComplete) {
                // If ready, go straight to results
                router.push(destination);
            } else {
                // If not ready, go to Onboarding, passing the intended destination
                router.push(`/onboarding?next=${destination}`); 
            }

        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error("Could not save your choice. Please try again.");
        }
    };

    return (
        <main className="flex-grow">
            <Toaster position="top-center" />
            
            {/* Hero Section */}
            <div className="bg-gray-50 text-center py-20 pt-32 sm:pt-40 px-4">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    Welcome, <span className="text-green-600">{profile?.name?.split(' ')[0] || 'User'}</span>!
                </h1>
                <p className="mt-4 max-w-md mx-auto text-lg text-gray-500 md:max-w-3xl">
                    Settle makes finding your perfect living situation simple. What would you like to do today?
                </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Primary Actions: Call handleNavigation */}
                    <FeatureCard 
                        onClick={() => handleNavigation('lister', '/roommate-results')} 
                        title="Find a Roommate" 
                        description="I have a place (or will find one) and need a roommate." 
                        icon={<UsersIcon />} 
                    />
                    <FeatureCard 
                        onClick={() => handleNavigation('seeker', '/seeker-results')} 
                        title="Find a Room" 
                        description="I am looking for a room in an existing shared flat." 
                        icon={<HomeIcon />} 
                    />
                    
                    {/* Secondary Actions: Direct Links */}
                    <FeatureCard 
                        onClick={() => router.push('/forum')} 
                        title="Community Forum" 
                        description="Discuss city life, ask questions, and meet neighbors." 
                        icon={<ForumIcon />} 
                    />
                    <FeatureCard 
                        onClick={() => router.push('/tiffin')} 
                        title="Tiffin Service" 
                        description="Subscribe to healthy, home-cooked meal delivery. (Coming Soon)" 
                        icon={<TiffinIcon />} 
                    />
                </div>
            </div>
            
            {/* Founder's Corner */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 shadow-inner">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="md:w-1/3 flex flex-col items-center">
                                {/* Use a placeholder if image fails, or ensure /founder.jpeg exists in public folder */}
                                <div className="h-48 w-48 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                                     <img src="/founder.jpeg" alt="Ridant Gunjar" className="h-full w-full object-cover" onError={(e) => {e.currentTarget.style.display='none'}} />
                                </div>
                                <h3 className="mt-6 text-2xl font-bold text-gray-900">Ridant Gunjar</h3>
                                <p className="text-green-600 font-medium">Founder & CEO</p>
                            </div>
                            <div className="md:w-2/3 text-center md:text-left">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">A Note from the Founder</h2>
                                <blockquote className="text-xl text-gray-600 italic leading-relaxed">
                                    "Finding a home has become a game of chance and risk. We're changing the rules. Settle was built to eliminate the uncertainty from one of life's most important decisions. Our commitment is to a community built on trust, deep compatibility, and the simple idea that your home should be a source of strength, not stress. This is the new standard for co-living. Welcome."
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How Settle Works</h2>
                        <p className="mt-4 text-xl text-gray-500">Your simple, safe path to a great living situation in just three steps.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <HowItWorksCard 
                            number="1" 
                            title="Create Your Profile" 
                            description="Tell us about your lifestyle, habits, and what you're looking for. The more we know, the better the match." 
                            icon={<Step1Icon/>} 
                        />
                        <HowItWorksCard 
                            number="2" 
                            title="Discover Matches" 
                            description="Our smart algorithm and detailed filters show you the most compatible people and places nearby." 
                            icon={<Step2Icon/>} 
                        />
                        <HowItWorksCard 
                            number="3" 
                            title="Connect Securely" 
                            description="Chat with your matches directly on our platform. Arrange a meeting and settle in with confidence." 
                            icon={<Step3Icon/>} 
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoggedInHeader from "@/components/LoggedInHeader";
import toast, { Toaster } from "react-hot-toast";
import { type User } from "@supabase/supabase-js";
import { FaExchangeAlt } from "react-icons/fa";
import OnboardingForm from "@/components/OnboardingForm";
import { type Profile } from "@/lib/schemas";

export default function PreferencesPage() {
  const router = useRouter();
  // The Supabase client instance is now memoized for performance.
  const supabase = useMemo(() => createClient(), []);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getProfile = useCallback(async (currentUser: User) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        toast.error("Could not load your profile. Redirecting...");
        console.error("Profile Fetch Error:", error);
        router.push("/dashboard");
    } else if (data) {
        setProfile(data as Profile);
    }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await getProfile(session.user);
      } else {
        router.push("/login");
      }
    };
    checkUserAndProfile();
  }, [getProfile, supabase.auth, router]);

  const handleSwitchRole = async () => {
      if (!profile) return;
      const newRole = profile.role === 'seeker' ? 'lister' : 'seeker';
      setIsSaving(true);
      const toastId = toast.loading(`Switching role...`);
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
      toast.dismiss(toastId);
      if (response.ok) {
          setProfile(prev => prev ? { ...prev, role: newRole } : null);
          toast.success(`You are now a ${newRole}!`);
      } else {
          toast.error("Failed to switch role.");
      }
      setIsSaving(false);
  };

  const handleSave = async (updatedProfile: Profile): Promise<void> => {
    setIsSaving(true);
    const toastId = toast.loading("Saving profile...");
    const { id, created_at, email, ...profileUpdateData } = updatedProfile;
    const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileUpdateData),
    });
    toast.dismiss(toastId);
    if (response.ok) {
        toast.success("Profile saved successfully!");
        router.push('/dashboard');
    } else {
        toast.error('Failed to save profile.');
    }
    setIsSaving(false);
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading Your Profile...</p></div>;
  }
  
  if (!profile) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <p>Initializing your profile... If this screen persists, please return to the dashboard.</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <LoggedInHeader />
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
              {profile.role === 'seeker' ? 'Tell Us About Yourself' : 'Describe Your Space'}
            </h1>
            <p className="text-gray-500 text-center mb-6">A great profile leads to great matches.</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Your Role</h3>
                        <p className="text-sm text-gray-600">You are a <span className="font-bold text-green-600 capitalize">{profile.role}</span>.</p>
                    </div>
                    <button onClick={handleSwitchRole} disabled={isSaving} className="flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-70">
                        <FaExchangeAlt /><span>Switch Role</span>
                    </button>
                </div>
            </div>
            <OnboardingForm 
              user={user}
              profileData={profile}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
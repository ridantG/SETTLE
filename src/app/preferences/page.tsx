// File: app/preferences/page.tsx
// FINAL, DEFINITIVE, AND CORRECT VERSION
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoggedInHeader from "@/components/LoggedInHeader";
import toast, { Toaster } from "react-hot-toast";
import { type User } from "@supabase/supabase-js";
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type Profile } from '@/lib/schemas';
import OnboardingForm from "@/components/OnboardingForm";

export default function PreferencesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const methods = useForm<Profile>({ resolver: zodResolver(profileSchema) });
  const { reset, handleSubmit } = methods;

  const getProfile = useCallback(async (currentUser: User) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
    if (data) reset(data); else router.push("/dashboard");
    setLoading(false);
  }, [supabase, router, reset]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/"); return; }
      setUser(session.user);
      getProfile(session.user);
    };
    checkUser();
  }, [getProfile, router]);

  const onSave = async (data: Profile) => {
    const toastId = toast.loading("Saving profile...");
    const { id, created_at, email, updated_at, ...updateData } = data;
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) });
    toast.dismiss(toastId);
    if (response.ok) { toast.success("Profile saved!"); router.push('/dashboard'); } 
    else { toast.error('Failed to save profile.'); }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading Your Profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" /><LoggedInHeader />
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-4xl font-bold mb-6">Your Profile</h1>
            <FormProvider {...methods}>
              <OnboardingForm user={user} onSave={handleSubmit(onSave)} isSaving={methods.formState.isSubmitting}/>
            </FormProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoggedInHeader from "@/components/LoggedInHeader";
import toast, { Toaster } from "react-hot-toast";
import { type User } from "@supabase/supabase-js";
import { FaExchangeAlt } from "react-icons/fa";
import { useForm, FormProvider, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type Profile } from "@/lib/schemas";
import OnboardingForm from "@/components/OnboardingForm";

export default function PreferencesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const methods = useForm<Profile>({
    resolver: zodResolver(profileSchema) as Resolver<Profile>,
    defaultValues: profile ?? undefined,
  });

  const { reset, handleSubmit, setValue } = methods;

  const getProfile = useCallback(
    async (currentUser: User) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) {
        const fullProfile = data as Profile;
        setProfile(fullProfile);
        reset(fullProfile);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    },
    [supabase, router, reset]
  );

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      getProfile(session.user);
    };
    checkUser();
  }, [getProfile, supabase.auth, router]);

  const handleSwitchRole = async () => {
    if (!profile || !user) return;

    const newRole = (profile.role === "seeker" ? "lister" : "seeker") as Profile["role"];

    const toastId = toast.loading("Switching role...");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    toast.dismiss(toastId);

    if (response.ok) {
      setProfile((p) => (p ? { ...p, role: newRole } : p));
      setValue("role", newRole);
      toast.success(`You are now a ${newRole}!`);
    } else {
      toast.error("Failed to switch role.");
    }
  };

  const onSave: SubmitHandler<Profile> = async (data) => {
    const toastId = toast.loading("Saving profile...");
    const { id, created_at, email, ...updateData } = data;
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    toast.dismiss(toastId);

    if (response.ok) {
      toast.success("Profile saved!");
      router.push("/dashboard");
    } else {
      toast.error("Failed to save profile.");
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading Your Profile...</p>
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
            {/* Page title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
              {profile.role === "seeker" ? "Tell Us About Yourself" : "Describe Your Space"}
            </h1>
            <p className="text-gray-500 text-center mb-6">
              A great profile leads to great matches.
            </p>

            {/* Switch Role */}
            <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Your Role</h3>
                  <p className="text-sm text-gray-600">
                    You are a{" "}
                    <span className="font-bold text-green-600 capitalize">
                      {profile.role}
                    </span>
                    .
                  </p>
                </div>
                <button
                  onClick={handleSwitchRole}
                  disabled={methods.formState.isSubmitting}
                  className="flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-70"
                >
                  <FaExchangeAlt />
                  <span>Switch Role</span>
                </button>
              </div>
            </div>

            {/* Onboarding Form */}
            <FormProvider {...methods}>
              {/* 
                Ensure OnboardingForm's onSave prop is typed as:
                onSave: (data: Profile) => Promise<void>
              */}
              <OnboardingForm
                user={user}
                profileData={profile}
                onSave={handleSubmit(onSave)}
                isSaving={methods.formState.isSubmitting}
              />
            </FormProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
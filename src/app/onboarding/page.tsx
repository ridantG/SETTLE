// File: app/onboarding/page.tsx
// FINAL, CORRECTED, AND SELF-CONTAINED VERSION
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingSchema } from "@/lib/schemas";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data: profile } = await supabase.from("profiles").select("name, age, gender, city").eq("id", user.id).single();
      if (profile) {
        reset({
          name: profile.name || user.user_metadata?.full_name || "",
          age: profile.age ?? undefined,
          gender: profile.gender as 'male' | 'female' | undefined,
          city: profile.city || "",
        });
      }
    };
    fetchInitialData();
  }, [supabase, router, reset]);

  const onSubmit = async (data: OnboardingSchema) => {
    const toastId = toast.loading("Saving your details...");
    const response = await fetch("/api/onboarding", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    toast.dismiss(toastId);
    if (response.ok) {
      toast.success("Profile updated!");
      const nextUrl = searchParams.get("next") || "/dashboard";
      router.push(nextUrl);
      router.refresh();
    } else {
      toast.error("Failed to save details. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <Toaster position="top-center" />
      <div className="absolute top-0 left-0 p-6 sm:p-8"><Link href="/dashboard" className="text-3xl font-bold"><span className="text-green-600">Set</span>tle</Link></div>
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center">One last step...</h1>
        <p className="text-gray-600 text-center mt-2 mb-6">Let's get your basic profile set up to continue.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium">Full Name</label><input {...register("name")} id="name" type="text" className="mt-1 w-full p-3 border rounded-md" />{errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}</div>
          <div><label htmlFor="age" className="block text-sm font-medium">Age</label><input {...register("age")} id="age" type="number" className="mt-1 w-full p-3 border rounded-md" />{errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}</div>
          <div><label htmlFor="gender" className="block text-sm font-medium">Gender</label><select {...register("gender")} id="gender" defaultValue="" className="mt-1 w-full p-3 border rounded-md bg-white"><option value="" disabled>Select one...</option><option value="male">Male</option><option value="female">Female</option></select>{errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}</div>
          <div><label htmlFor="city" className="block text-sm font-medium">City</label><input {...register("city")} id="city" type="text" className="mt-1 w-full p-3 border rounded-md" placeholder="e.g., Bhopal"/>{errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}</div>
          <div className="pt-2"><button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-3 px-5 rounded-lg text-lg">{isSubmitting ? "Saving..." : "Save & Continue"}</button></div>
        </form>
      </div>
    </div>
  );
}
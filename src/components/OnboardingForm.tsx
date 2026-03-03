// File: src/components/OnboardingForm.tsx
// FIXED VERSION — Matches ImageUpload props (no functionality changed)

"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { type Profile } from "@/lib/schemas";
import { type User } from "@supabase/supabase-js";

import { FaBirthdayCake, FaUser } from "react-icons/fa";
import ImageUpload from "@/components/ImageUpload";
import MultiImageUpload from "@/components/MultiImageUpload";

interface OnboardingFormProps {
    user: User;
    onSave: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSaving: boolean;
}

export default function OnboardingForm({
    user,
    onSave,
    isSaving
}: OnboardingFormProps) {

    const {
        register,
        control,
        formState: { errors }
    } = useFormContext<Profile>();

    return (
        <form onSubmit={onSave}>
            <fieldset disabled={isSaving} className="space-y-6">

                <h2 className="text-2xl font-bold text-gray-800">Your Details</h2>

                {/* Full Name */}
                <div>
                    <div className="relative">
                        <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <input
                            {...register("name")}
                            placeholder="Full Name"
                            className="w-full pl-12 p-3 bg-gray-100 rounded"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Age */}
                <div>
                    <div className="relative">
                        <FaBirthdayCake className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            {...register("age")}
                            placeholder="Age"
                            className="w-full pl-12 p-3 bg-gray-100 rounded"
                        />
                    </div>
                    {errors.age && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.age.message}
                        </p>
                    )}
                </div>

                {/* Profile Image */}
                <div>
                    <label>Your Photograph</label>

                    <Controller
                        name="image_url"
                        control={control}
                        render={({ field }) => (
                            <ImageUpload
                                label="Upload Profile Image"
                                onUpload={(url) => field.onChange(url)}
                            />
                        )}
                    />

                    {errors.image_url && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.image_url.message}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-green-500 text-white font-bold py-3 px-5 rounded-lg text-lg"
                    >
                        {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                </div>

            </fieldset>
        </form>
    );
}

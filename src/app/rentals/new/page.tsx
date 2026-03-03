"use client";

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { rentalSchema, type RentalSchema } from '@/lib/schemas';
import LoggedInHeader from '@/components/LoggedInHeader';
import MultiImageUpload from '@/components/MultiImageUpload';
import { type User } from '@supabase/supabase-js';

export default function CreateRentalPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/');
            else setUser(user);
        };
        fetchUser();
    }, [supabase, router]);

    // THE FIX IS HERE: We remove the 'resolver' from useForm.
    // The form now only manages state.
    const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<RentalSchema>({
        defaultValues: {
            title: "",
            category: "",
            city: "",
            description: "",
            price: 0,
            image_urls: []
        }
    });

    // THE FIX IS HERE: We now perform validation manually inside onSubmit.
    const onSubmit = async (data: RentalSchema) => {
        // 1. Manually validate the data using the schema
        const result = rentalSchema.safeParse(data);

        // 2. Check if validation failed
        if (!result.success) {
            // Find the first error message and show it
            const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0];
            toast.error(firstError || "Please check your form for errors.");
            return;
        }

        // 3. If validation succeeds, send the (now-safe) data to the API
        const response = await fetch('/api/rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.data) // We use result.data, not the raw form data
        });

        if (response.ok) {
            toast.success("Listing created successfully!");
            router.push('/rentals');
        } else {
            toast.error("Failed to create listing. Please try again.");
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-2xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Create a New Listing</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">Title</label>
                        <input {...register("title")} id="title" className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Gently Used Study Table" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium">Category</label>
                        <select {...register("category")} id="category" defaultValue="" className="mt-1 w-full p-2 border rounded-md bg-white">
                            <option value="" disabled>Select a category...</option>
                            <option value="furniture">Furniture</option>
                            <option value="electronics">Electronics</option>
                            <option value="books">Books</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="price" className="block text-sm font-medium">Price (per month)</label>
                            <input {...register("price")} id="price" type="number" className="mt-1 w-full p-2 border rounded-md" placeholder="1000" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="city" className="block text-sm font-medium">City</label>
                            <input {...register("city")} id="city" className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Bhopal" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <textarea {...register("description")} id="description" rows={4} className="mt-1 w-full p-2 border rounded-md" placeholder="Describe your item..."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Upload Photos</label>
                        <Controller name="image_urls" control={control} render={({ field }) => (
                            <MultiImageUpload 
                                user={user} 
                                bucket="rental-images" 
                                initialImageUrls={field.value} 
                                onUploadSuccess={(urls) => field.onChange(urls)} 
                            />
                        )} />
                    </div>
                    <div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:bg-gray-400">
                            {isSubmitting ? 'Posting...' : 'Post Your Listing'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
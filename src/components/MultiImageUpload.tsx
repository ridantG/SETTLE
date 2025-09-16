// File: src/components/MultiImageUpload.tsx
// A complete, production-ready component for multiple image uploads to Supabase Storage.

"use client";

import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type MultiImageUploadProps = {
    user: User | null;
    initialImageUrls: string[] | null;
    onUploadSuccess: (urls: string[]) => void; // Callback with an array of URLs
    bucket: string; // e.g., 'flat-photos'
};

export default function MultiImageUpload({ user, initialImageUrls, onUploadSuccess, bucket }: MultiImageUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls || []);

    useEffect(() => {
        setImageUrls(initialImageUrls || []);
    }, [initialImageUrls]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        if (!user) {
            toast.error("You must be logged in to upload images.");
            return;
        }

        const files = Array.from(event.target.files);
        setUploading(true);
        const toastId = toast.loading(`Uploading ${files.length} image(s)...`);

        const uploadPromises = files.map(file => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}-${Math.random()}.${fileExt}`;
            return supabase.storage.from(bucket).upload(fileName, file);
        });

        const uploadResults = await Promise.all(uploadPromises);

        const newUrls: string[] = [];
        let hadError = false;

        for (const result of uploadResults) {
            if (result.error) {
                hadError = true;
                console.error('Upload Error:', result.error.message);
            } else if (result.data?.path) {
                const { data } = supabase.storage.from(bucket).getPublicUrl(result.data.path);
                newUrls.push(data.publicUrl);
            }
        }
        
        toast.dismiss(toastId);
        if (hadError) {
            toast.error("Some images failed to upload. Please try again.");
        } else {
            const updatedUrls = [...imageUrls, ...newUrls];
            setImageUrls(updatedUrls);

            onUploadSuccess(updatedUrls); // Inform parent of all URLs
            toast.success('Images uploaded successfully!');
        }
        setUploading(false);
    };

    const handleDelete = (urlToDelete: string) => {
        // This is a simplified delete. A production app would also delete the file from Supabase storage.
        const updatedUrls = imageUrls.filter(url => url !== urlToDelete);
        setImageUrls(updatedUrls);
        onUploadSuccess(updatedUrls);
        toast.success("Image removed.");
    };

    return (
        <div className="p-4 my-4 bg-gray-100 rounded-lg">
            <div className="grid grid-cols-3 gap-4 mb-4">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                        <img src={url} alt={`Flat Photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button onClick={() => handleDelete(url)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">X</button>
                    </div>
                ))}
            </div>
            <div className="text-center">
                 <label htmlFor="multi-image-upload" className="cursor-pointer bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    {uploading ? 'Uploading...' : 'Add Photos'}
                </label>
                <input
                    type="file"
                    id="multi-image-upload"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    disabled={uploading}
                    multiple
                />
            </div>
        </div>
    );
}
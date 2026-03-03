// File: src/components/MultiImageUpload.tsx
// FINAL, DEFINITIVE, AND COMPLETE VERSION

"use client";

import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

type MultiImageUploadProps = {
    user: User;
    bucket: string; // This will be 'rental-images'
    initialImageUrls: string[] | null;
    onUploadSuccess: (urls: string[]) => void;
};

// --- Reusable Icon Components ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export default function MultiImageUpload({ user, bucket, initialImageUrls, onUploadSuccess }: MultiImageUploadProps) {
    const supabase = useMemo(() => createClient(), []);
    const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls || []);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (imageUrls.length + e.target.files.length > 6) {
            toast.error("You can upload a maximum of 6 photos.");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${e.target.files.length} image(s)...`);
        const uploadPromises: Promise<string>[] = [];

        for (const file of e.target.files) {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

            const uploadPromise = supabase
                .storage
                .from(bucket) // 'bucket' prop will be "rental-images"
                .upload(filePath, file)
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Upload Error:", error);
                        throw new Error(`Failed to upload ${file.name}`);
                    }
                    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
                    return publicUrlData.publicUrl;
                });
            uploadPromises.push(uploadPromise);
        }

        try {
            const newUrls = await Promise.all(uploadPromises);
            const updatedUrls = [...imageUrls, ...newUrls];
            setImageUrls(updatedUrls);
            onUploadSuccess(updatedUrls);
            toast.success("Upload complete!", { id: toastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unknown error occurred.", { id: toastId });
        }
        setIsUploading(false);
    };

    const handleDelete = (urlToDelete: string) => {
        const updatedUrls = imageUrls.filter(url => url !== urlToDelete);
        setImageUrls(updatedUrls);
        onUploadSuccess(updatedUrls);
        // We can also trigger a storage delete here if needed
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden aspect-square">
                        <img src={url} alt={`Uploaded rental image ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button type="button" onClick={() => handleDelete(url)} className="p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
                
                {imageUrls.length < 6 && (
                    <label htmlFor="multi-upload" className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        {isUploading ? (<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>) : (<UploadIcon />)}
                        <span className="mt-2 text-sm text-gray-500">Upload</span>
                    </label>
                )}
            </div>
            <input type="file" id="multi-upload" accept="image/png, image/jpeg, image/webp" multiple onChange={handleFileChange} className="hidden" disabled={isUploading || imageUrls.length >= 6} />
        </div>
    );
}
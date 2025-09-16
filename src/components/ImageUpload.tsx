// File: src/components/ImageUpload.tsx
// A complete, production-ready component for single image uploads to Supabase Storage.

"use client";

import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type ImageUploadProps = {
    user: User | null;
    initialImageUrl: string | null;
    onUploadSuccess: (url: string) => void; // Callback to parent with the final URL
    bucket: string; // e.g., 'avatars'
};

export default function ImageUpload({ user, initialImageUrl, onUploadSuccess, bucket }: ImageUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);

    // Ensure preview updates if the initial URL changes
    useEffect(() => {
        setPreviewUrl(initialImageUrl);
    }, [initialImageUrl]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        if (!user) {
            toast.error("You must be logged in to upload images.");
            return;
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);

        // Show a local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        const { error } = await supabase.storage.from(bucket).upload(filePath, file);

        if (error) {
            toast.error('Error uploading image. Please try again.');
            console.error('Upload Error:', error.message);
            setPreviewUrl(initialImageUrl); // Revert preview on error
        } else {
            // Get the public URL of the uploaded file
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            if (data.publicUrl) {
                onUploadSuccess(data.publicUrl); // Send the final URL to the parent
                setPreviewUrl(data.publicUrl);   // Update preview to the final URL
                toast.success('Image uploaded successfully!');
            } else {
                toast.error('Could not get public URL for the image.');
                setPreviewUrl(initialImageUrl);
            }
        }
        setUploading(false);
    };

    return (
        <div className="p-4 my-4 bg-gray-100 rounded-lg text-center">
            {previewUrl ? (
                <div className="relative group w-32 h-32 mx-auto">
                    <img src={previewUrl} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                    {uploading && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div></div>}
                </div>
            ) : (
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    No Image
                </div>
            )}
            <div className="mt-4">
                <label htmlFor="single-image-upload" className="cursor-pointer bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    {uploading ? 'Uploading...' : 'Choose Photo'}
                </label>
                <input
                    type="file"
                    id="single-image-upload"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </div>
        </div>
    );
}
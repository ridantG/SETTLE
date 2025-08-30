// src/components/ImageUpload.tsx

"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

type ImageUploadProps = {
  onUpload: (filePath: string) => void;
  label: string;
};

export default function ImageUpload({ onUpload, label }: ImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Show a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Call the onUpload callback with the file path
      onUpload(filePath);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
            <Image src={previewUrl} alt="Preview" layout="fill" objectFit="cover" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}
        <label htmlFor="profile-photo-upload" className="cursor-pointer bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
          {uploading ? 'Uploading...' : 'Upload'}
        </label>
        <input
          id="profile-photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>
    </div>
  );
}
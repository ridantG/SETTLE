// src/components/MultiImageUpload.tsx

"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';

type MultiImageUploadProps = {
  onUpload: (filePaths: string[]) => void;
  label: string;
};

export default function MultiImageUpload({ onUpload, label }: MultiImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(event.target.files);
    if (files.length + selectedFiles.length > 6) {
      alert("You can only upload a maximum of 6 photos.");
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      const uploadedFilePaths: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('flat-photos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }
        uploadedFilePaths.push(filePath);
      }
      onUpload(uploadedFilePaths);
      alert("Images uploaded successfully!");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative w-full h-24 rounded-lg overflow-hidden">
            <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <label htmlFor="flat-photos-upload" className="cursor-pointer bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
          Select Photos
        </label>
        <input
          id="flat-photos-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading || files.length >= 6}
          className="hidden"
        />
        {files.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600"
            disabled={uploading}
          >
            {uploading ? `Uploading ${files.length}...` : `Upload ${files.length} Photos`}
          </button>
        )}
      </div>
    </div>
  );
}
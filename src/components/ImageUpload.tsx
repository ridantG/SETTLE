// File: src/components/ImageUpload.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useId } from "react";
import toast from "react-hot-toast";

type ImageUploadProps = {
  label?: string;
  onUpload: (path: string) => void; // sends file path back to parent
};

export default function ImageUpload({ label, onUpload }: ImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputId = useId();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      setUploading(true);

      // Local preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (error) {
        toast.error("Image upload failed.");
        console.error("Upload error:", error);
        return;
      }

      onUpload(filePath);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload exception:", error);
      toast.error("Unexpected error during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 my-4 bg-gray-100 rounded-lg text-center">
      <p className="font-medium mb-2">{label}</p>

      {previewUrl ? (
        <div className="relative group w-32 h-32 mx-auto">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}

      <div className="mt-4">
        <label
          htmlFor={inputId}
          className="cursor-pointer bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {uploading ? "Uploading..." : "Choose Photo"}
        </label>

        <input
          type="file"
          id={inputId}
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}

// src/components/ForumPostCard.tsx

"use client";

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

// 1. New props to handle user permissions
type ForumPostCardProps = {
  postId: number;
  authorId: string;
  currentUserId: string | undefined;
  title: string;
  content: string;
  author: string;
  date: string;
};

export default function ForumPostCard({ postId, authorId, currentUserId, title, content, author, date }: ForumPostCardProps) {
  const supabase = createClient();
  const router = useRouter();
  const isOwner = currentUserId === authorId; // Check if the current user owns this post

  // 2. Function to handle deleting the post
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    const toastId = toast.loading('Deleting post...');
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);
    
    toast.dismiss(toastId);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Post deleted successfully.');
      // Refresh the page to show the updated list of posts
      router.refresh(); 
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            by <span className="font-semibold">{author}</span> on {date}
          </p>
        </div>
        
        {/* 3. Conditionally render the Edit/Delete buttons */}
        {isOwner && (
          <div className="flex items-center space-x-3">
            <Link href={`/forum/posts/${postId}/edit`} className="text-gray-400 hover:text-blue-500 transition-colors" title="Edit Post">
              <FaEdit />
            </Link>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete Post">
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      <p className="text-gray-600 mt-4">{content}</p>
    </div>
  );
};
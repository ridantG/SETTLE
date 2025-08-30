// src/app/forum/new/page.tsx

"use client";

import { useState } from 'react';
// CORRECTED IMPORT: Use the new browser client utility
import { createClient } from '@/lib/supabase/client'; 
import { useRouter } from 'next/navigation';
import LoggedInHeader from '@/components/LoggedInHeader';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  // Create the client instance using the correct utility
  const supabase = createClient();

  const handlePostSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in to create a post.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        title: title,
        content: content,
        author_name: user.email || 'Anonymous',
        author_id: user.id,
      });

    if (error) {
      setMessage(`Error creating post: ${error.message}`);
    } else {
      setMessage('Post created successfully!');
      router.push('/forum/my-posts');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Create a New Post</h1>
        <form onSubmit={handlePostSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300 disabled:opacity-50"
            disabled={loading || !title || !content}
          >
            {loading ? 'Posting...' : 'Create Post'}
          </button>
          {message && <p className="text-center text-sm text-red-500 mt-4">{message}</p>}
        </form>
      </main>
    </div>
  );
}
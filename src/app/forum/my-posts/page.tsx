// src/app/forum/my-posts/page.tsx

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from "@/components/LoggedInHeader";
import ForumPostCard from "@/components/ForumPostCard";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Post = {
  id: number;
  created_at: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
};

export default async function MyPostsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoggedInHeader />
        <main className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-700">Access Denied</h1>
          <p className="text-gray-500 mt-2">You must be logged in to view your posts.</p>
          <Link href="/login">
            <button className="mt-6 bg-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-600">
              Go to Login
            </button>
          </Link>
        </main>
      </div>
    );
  }

  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user posts:", error);
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Posts</h1>
          <Link href="/forum/new">
            <button className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">
              New Post
            </button>
          </Link>
        </div>
        
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              <ForumPostCard
                key={post.id}
                title={post.title}
                content={post.content}
                author={post.author_name}
                date={new Date(post.created_at).toLocaleDateString()}
              />
            ))
          ) : (
            // CORRECTED: "haven't" is now "haven&apos;t"
            <p className="text-center text-gray-500 mt-12">You haven&apos;t created any posts yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
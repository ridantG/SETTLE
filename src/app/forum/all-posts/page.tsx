// src/app/forum/all-posts/page.tsx

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers' // 1. Import the cookies function
import LoggedInHeader from "@/components/LoggedInHeader";
import ForumPostCard from "@/components/ForumPostCard";
import Link from 'next/link';

type Post = {
  id: number;
  created_at: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
};

export default async function AllPostsPage() {
  const cookieStore = cookies() // 2. Get the cookie store instance
  const supabase = createClient(cookieStore) // 3. Pass it to the utility

  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching forum posts:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">All Posts</h1>
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
            <p className="text-center text-gray-500 mt-12">No posts are being displayed.</p>
          )}
        </div>
      </main>
    </div>
  );
}
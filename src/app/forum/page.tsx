// src/app/forum/page.tsx

import LoggedInHeader from "@/components/LoggedInHeader";
import Link from 'next/link';
import { FaUsers, FaUser } from 'react-icons/fa';

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Community Forum</h1>
          <p className="text-lg text-gray-500 mt-2">Choose a view to explore the community posts.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Link Card for All Posts */}
          <Link href="/forum/all-posts" className="block p-8 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow text-center">
            <FaUsers className="mx-auto text-5xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">All Posts</h2>
            <p className="text-gray-500 mt-2">See what everyone in the community is talking about.</p>
          </Link>

          {/* Link Card for My Posts */}
          <Link href="/forum/my-posts" className="block p-8 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow text-center">
            <FaUser className="mx-auto text-5xl text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">My Posts</h2>
            <p className="text-gray-500 mt-2">View and manage the posts you have created.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
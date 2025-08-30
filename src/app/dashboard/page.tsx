// src/app/dashboard/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import LoggedInHeader from '@/components/LoggedInHeader';
import Link from 'next/link';
import { FaSearch, FaPlusCircle } from 'react-icons/fa';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Attempt to get the user's name from their email, or use the full email as a fallback
        const nameFromEmail = user.email?.split('@')[0];
        setUserName(nameFromEmail || 'there');
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    // The new green theme starts here
    <div className="min-h-screen bg-green-50/50">
      <LoggedInHeader />
      <main className="max-w-4xl mx-auto py-12 px-4 fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Welcome, {userName || 'Settle user'}!
          </h1>
          
          {/* The new quote section */}
          <p className="text-lg text-gray-500 mt-4 italic">
            &quot;Home is not a place... it&apos;s a feeling.&quot;
          </p>
          
          <p className="text-xl text-gray-700 mt-8">
            What brings you here today?
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Find a Room */}
          <Link href="/find-a-room" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-green-200 hover:shadow-2xl hover:-translate-y-2 transition-all text-center border-2 border-transparent hover:border-green-500">
            <FaSearch className="mx-auto text-6xl text-green-500 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Find a Room</h2>
            <p className="text-gray-500 mt-2">I&apos;m looking for a place to live and need to find a room and a roommate.</p>
          </Link>

          {/* Card 2: Find a Roommate */}
          <Link href="/preferences" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-blue-200 hover:shadow-2xl hover:-translate-y-2 transition-all text-center border-2 border-transparent hover:border-blue-500">
            <FaPlusCircle className="mx-auto text-6xl text-blue-500 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Find a Roommate</h2>
            <p className="text-gray-500 mt-2">I have a place and I&apos;m looking for someone to live with me.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
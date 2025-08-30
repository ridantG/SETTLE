// src/components/LoggedInHeader.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import Image from 'next/image';

const LoggedInHeader = () => {
  const router = useRouter();
  const supabase = createClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfileImage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('image_url')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.image_url) {
          setImageUrl(profile.image_url);
        }
      }
    };
    fetchUserProfileImage();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">
          <Link href="/dashboard">Settle</Link>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
          <Link href="/forum" className="hover:text-green-500 transition-colors">Forum</Link>
          <Link href="/find-a-room" className="hover:text-green-500 transition-colors">Find a Room</Link>
          <Link href="/preferences" className="hover:text-green-500 transition-colors">Find a Roommate</Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="block focus:outline-none">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="User profile picture"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <FaUserCircle 
                className="text-3xl text-gray-400 hover:text-green-500 transition-colors" 
              />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
              <Link
                href="/account"
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaCog className="mr-3" />
                Edit Profile
              </Link>
              {/* --- "Change My Goal" option has been removed --- */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LoggedInHeader;
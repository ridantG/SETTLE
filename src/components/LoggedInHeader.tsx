// File: src/components/LoggedInHeader.tsx
// FINAL, OPTIMIZED VERSION: The Supabase client is now correctly memoized for performance.

"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useRef, useMemo } from 'react'; // <-- Step 1: Import useMemo
import toast, { Toaster } from 'react-hot-toast';

// --- SVG Icon Components ---
const TiffinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const ForumIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Reusable Modal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800">Are you sure?</h2>
                <p className="text-gray-600 mt-4">This action is permanent and cannot be undone. All of your data will be permanently deleted.</p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Yes, Delete My Account</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Header Component ---
export default function LoggedInHeader() {
    const router = useRouter();
    // THE FIX IS HERE: The Supabase client instance is now memoized for performance and stability.
    const supabase = useMemo(() => createClient(), []);
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const handleDeleteAccount = async () => {
        const toastId = toast.loading("Deleting your account...");
        const response = await fetch('/api/user', { method: 'DELETE' });
        toast.dismiss(toastId);
        if (response.ok) {
            toast.success("Your account has been permanently deleted.");
            router.push('/');
            router.refresh();
        } else {
            toast.error("Could not delete your account. Please try again.");
        }
        setIsModalOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <>
            <Toaster position="top-center" />
            <header className="bg-white shadow-md p-4 sticky top-0 z-40">
                <nav className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/dashboard" className="text-3xl font-bold text-gray-800 tracking-wider"><span className="text-green-600">Set</span>tle</Link>
                    <div className="flex items-center space-x-6">
                        <Link href="/tiffin" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                            <TiffinIcon />
                            <span className="font-medium">Tiffin Service</span>
                        </Link>
                        <Link href="/chat" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                            <ChatIcon />
                            <span className="font-medium">Chats</span>
                        </Link>
                        <Link href="/forum" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                            <ForumIcon />
                            <span className="font-medium">Forum</span>
                        </Link>
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsDropdownOpen(prev => !prev)} className="text-gray-600 hover:text-green-600 focus:outline-none"><ProfileIcon /></button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                                    <Link href="/preferences" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>My Profile</Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                                    <div className="border-t my-2 border-gray-100"></div>
                                    <button onClick={() => { setIsDropdownOpen(false); setIsModalOpen(true); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold">
                                        Delete My Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteAccount} />
        </>
    );
}
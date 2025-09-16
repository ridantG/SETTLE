"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaLock } from 'react-icons/fa';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Resetting your password...');

    const { error } = await supabase.auth.updateUser({ password });

    toast.dismiss(toastId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully! Please log in with your new password.');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Create a New Password</h1>
        <p className="text-gray-500 mb-8">Please enter and confirm your new password below.</p>
        
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="relative">
            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
          </div>
          <div className="relative">
            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}